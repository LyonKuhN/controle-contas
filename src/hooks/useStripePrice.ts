import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  amount: number;
  currency: string;
  formatted: string;
}

// Cache global para evitar múltiplas requisições
let priceCache: { data: PriceData; timestamp: number } | null = null;

export const useStripePrice = () => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    
    // Evitar múltiplas chamadas simultâneas
    if (loading) {
      console.log('useStripePrice: Já está carregando, ignorando nova chamada');
      return;
    }

    // Verificar cache (válido por 5 minutos)
    if (priceCache && Date.now() - priceCache.timestamp < 300000) {
      console.log('useStripePrice: Usando cache válido');
      setPriceData(priceCache.data);
      setLoading(false);
      setError(null);
      return;
    }

    console.log(`useStripePrice: Iniciando busca ${retryCount + 1}/${MAX_RETRIES + 1}`);
    setLoading(true);
    setError(null);
    
    try {
      // Timeout de 6 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      console.log('useStripePrice: Chamando edge function...');
      
      // Usar Promise.race para timeout manual já que Supabase não suporta signal
      const fetchPromise = supabase.functions.invoke('get-stripe-price');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout: 6 segundos')), 6000)
      );
      
      const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
      const { data, error } = result;
      
      clearTimeout(timeoutId);
      
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
      if (retryCount < MAX_RETRIES && (errorMessage.includes('Timeout') || errorMessage.includes('fetch') || errorMessage.includes('AbortError'))) {
        const delay = Math.min(1000 * Math.pow(2, retryCount), 3000); // 1s, 2s, 3s max
        console.log(`useStripePrice: Retry em ${delay}ms`);
        
        setTimeout(() => {
          fetchPrice(retryCount + 1);
        }, delay);
        return; // Não definir loading = false ainda
      }
      
      // Fallback para valor padrão se todas as tentativas falharam
      console.log('useStripePrice: Usando fallback');
      const fallbackData = {
        amount: 29.9,
        currency: 'brl',
        formatted: 'R$ 29,90'
      };
      
      setPriceData(fallbackData);
      setError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Função para refresh manual
  const refreshPrice = useCallback(() => {
    console.log('useStripePrice: Refresh manual solicitado');
    priceCache = null; // Limpar cache
    setError(null);
    fetchPrice(0);
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
    
    // Pequeno delay para evitar chamadas simultâneas na inicialização
    const timer = setTimeout(() => {
      fetchPrice(0);
    }, 200);
    
    return () => clearTimeout(timer);
  }, []); // Dependências vazias - executar apenas uma vez

  return { 
    priceData, 
    loading, 
    error,
    refreshPrice
  };
};