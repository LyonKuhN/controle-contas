
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  amount: number;
  currency: string;
  formatted: string;
}

// Cache global para evitar múltiplas chamadas
let priceCache: PriceData | null = null;
let cacheError: string | null = null;
let isFetching = false;
let fetchPromise: Promise<void> | null = null;

export const useStripePrice = () => {
  const [priceData, setPriceData] = useState<PriceData | null>(priceCache);
  const [loading, setLoading] = useState(!priceCache && !cacheError);
  const [error, setError] = useState<string | null>(cacheError);

  useEffect(() => {
    // Se já temos dados em cache ou erro, não fazer nova requisição
    if (priceCache || cacheError) {
      setPriceData(priceCache);
      setError(cacheError);
      setLoading(false);
      return;
    }

    // Se já está fazendo fetch, aguardar o resultado
    if (isFetching && fetchPromise) {
      fetchPromise.then(() => {
        setPriceData(priceCache);
        setError(cacheError);
        setLoading(false);
      });
      return;
    }

    const fetchPrice = async () => {
      if (isFetching) return;
      
      isFetching = true;
      
      try {
        console.log('useStripePrice: Iniciando busca do preço...');
        
        const { data, error } = await supabase.functions.invoke('get-stripe-price');
        
        if (error) {
          console.error('useStripePrice: Erro na função:', error);
          throw error;
        }
        
        console.log('useStripePrice: Preço carregado com sucesso:', data);
        priceCache = data;
        cacheError = null;
        setPriceData(data);
        setError(null);
      } catch (err) {
        console.error('useStripePrice: Erro ao buscar preço:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar preço';
        cacheError = errorMessage;
        priceCache = null;
        setError(errorMessage);
        setPriceData(null);
      } finally {
        setLoading(false);
        isFetching = false;
        fetchPromise = null;
      }
    };

    fetchPromise = fetchPrice();
  }, []);

  return { priceData, loading, error };
};
