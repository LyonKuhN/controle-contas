
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  amount: number;
  currency: string;
  formatted: string;
}

// Cache global com timestamp para expiração
let priceCache: { data: PriceData; timestamp: number } | null = null;
let cacheError: { error: string; timestamp: number } | null = null;
let activeFetchPromise: Promise<PriceData> | null = null;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const isCacheValid = (cacheItem: { timestamp: number } | null): boolean => {
  if (!cacheItem) return false;
  return Date.now() - cacheItem.timestamp < CACHE_DURATION;
};

export const useStripePrice = () => {
  const [priceData, setPriceData] = useState<PriceData | null>(
    isCacheValid(priceCache) ? priceCache?.data || null : null
  );
  const [loading, setLoading] = useState(
    !isCacheValid(priceCache) && !isCacheValid(cacheError)
  );
  const [error, setError] = useState<string | null>(
    isCacheValid(cacheError) ? cacheError?.error || null : null
  );

  useEffect(() => {
    // Se temos dados válidos em cache, usar eles
    if (isCacheValid(priceCache)) {
      setPriceData(priceCache!.data);
      setError(null);
      setLoading(false);
      return;
    }

    // Se temos erro válido em cache, usar ele
    if (isCacheValid(cacheError)) {
      setError(cacheError!.error);
      setPriceData(null);
      setLoading(false);
      return;
    }

    // Se já existe uma requisição ativa, aguardá-la
    if (activeFetchPromise) {
      activeFetchPromise
        .then((data) => {
          setPriceData(data);
          setError(null);
          setLoading(false);
        })
        .catch((err) => {
          const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar preço';
          setError(errorMessage);
          setPriceData(null);
          setLoading(false);
        });
      return;
    }

    const fetchPrice = async (): Promise<PriceData> => {
      try {
        console.log('useStripePrice: Iniciando busca do preço...');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
        
        const { data, error } = await supabase.functions.invoke('get-stripe-price', {
          headers: {
            'Content-Type': 'application/json',
          },
          body: {} // Adicionar body vazio para garantir compatibilidade
        });
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.error('useStripePrice: Erro na função:', error);
          throw new Error(error.message || 'Erro na função get-stripe-price');
        }
        
        if (!data) {
          throw new Error('Dados de preço não recebidos');
        }
        
        console.log('useStripePrice: Preço carregado com sucesso:', data);
        
        // Validar estrutura dos dados
        if (typeof data.amount !== 'number' || !data.currency || !data.formatted) {
          console.warn('useStripePrice: Dados incompletos recebidos:', data);
          throw new Error('Dados de preço inválidos');
        }
        
        // Atualizar cache com timestamp
        priceCache = { data, timestamp: Date.now() };
        cacheError = null;
        
        return data;
      } catch (err) {
        console.error('useStripePrice: Erro ao buscar preço:', err);
        
        let errorMessage = 'Erro ao buscar preço';
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            errorMessage = 'Timeout na requisição do preço';
          } else {
            errorMessage = err.message;
          }
        }
        
        // Atualizar cache de erro com timestamp
        cacheError = { error: errorMessage, timestamp: Date.now() };
        priceCache = null;
        
        throw new Error(errorMessage);
      } finally {
        activeFetchPromise = null;
      }
    };

    // Iniciar fetch e armazenar promise ativa
    activeFetchPromise = fetchPrice();
    
    activeFetchPromise
      .then((data) => {
        setPriceData(data);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar preço';
        setError(errorMessage);
        setPriceData(null);
        setLoading(false);
      });
  }, []);

  return { priceData, loading, error };
};
