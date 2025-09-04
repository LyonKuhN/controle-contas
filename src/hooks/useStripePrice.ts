import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  amount: number;
  currency: string;
  formatted: string;
}

// Cache global para evitar múltiplas requisições
let priceCache: { data: PriceData; timestamp: number } | null = null;

// Cache para evitar múltiplas chamadas simultâneas
let isInvoking = false;

export const useStripePrice = () => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 1;
    
    // Evitar múltiplas chamadas simultâneas
    if (loading || isInvoking) {
      console.log('useStripePrice: Já está processando, ignorando');
      return;
    }

    // Verificar cache (válido por 5 minutos)
    if (priceCache && Date.now() - priceCache.timestamp < 300000) {
      console.log('useStripePrice: Usando cache válido');
      setPriceData(priceCache.data);
      setError(null);
      return;
    }

    console.log(`useStripePrice: Iniciando busca ${retryCount + 1}/${MAX_RETRIES + 1}`);
    setLoading(true);
    setError(null);
    isInvoking = true;
    
    try {
      // Timeout bem maior para lidar com cold starts
      console.log('useStripePrice: Chamando edge function...');
      
      const { data, error } = await supabase.functions.invoke('get-stripe-price');
      
      if (error) {
        throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No data received from edge function');
      }
      
      // Validar estrutura dos dados
      if (!data.amount || !data.currency || !data.formatted) {
        console.warn('useStripePrice: Dados incompletos:', data);
        throw new Error('Invalid price data structure');
      }
      
      console.log('useStripePrice: Sucesso!', data);
      
      // Atualizar cache
      priceCache = { data, timestamp: Date.now() };
      setPriceData(data);
      setError(null);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('useStripePrice: Erro:', errorMessage);
      
      // Retry logic apenas para timeouts ou network errors
      if (retryCount < MAX_RETRIES && (errorMessage.includes('fetch') || errorMessage.includes('timeout') || errorMessage.includes('network'))) {
        const delay = 2000; // 2 segundos
        console.log(`useStripePrice: Retry em ${delay}ms`);
        
        setTimeout(() => {
          isInvoking = false;
          fetchPrice(retryCount + 1);
        }, delay);
        return; // Não definir loading = false ainda
      }
      
      // Após todas as tentativas falharem, continuar com loading para tentar novamente
      console.log('useStripePrice: Todas as tentativas falharam, mantendo loading ativo');
      setError(errorMessage);
      
    } finally {
      if (priceData || retryCount >= MAX_RETRIES) {
        setLoading(false);
      }
      isInvoking = false;
    }
  }, [loading]);

  // Função para refresh manual
  const refreshPrice = useCallback(() => {
    console.log('useStripePrice: Refresh manual solicitado - LIMPANDO CACHE');
    
    // CRÍTICO: Resetar completamente o estado
    priceCache = null;
    isInvoking = false;
    setPriceData(null);
    setLoading(false);
    setError(null);
    
    // Forçar nova busca imediata
    setTimeout(() => {
      console.log('useStripePrice: Iniciando nova busca após reset');
      fetchPrice(0);
    }, 100);
  }, [fetchPrice]);

  // Inicialização apenas uma vez
  useEffect(() => {
    console.log('useStripePrice: Inicializando...');
    
    // Se já tem dados em cache válido, usar imediatamente
    if (priceCache && Date.now() - priceCache.timestamp < 300000) {
      console.log('useStripePrice: Cache válido encontrado');
      setPriceData(priceCache.data);
      return;
    }
    
    // Delay pequeno para evitar chamadas simultâneas
    const timer = setTimeout(() => {
      fetchPrice(0);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [fetchPrice]);

  return { 
    priceData, 
    loading, 
    error,
    refreshPrice
  };
};