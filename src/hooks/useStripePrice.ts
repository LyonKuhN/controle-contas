
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PriceData {
  amount: number;
  currency: string;
  formatted: string;
}

export const useStripePrice = () => {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        console.log('useStripePrice: Iniciando busca do preço...');
        
        const { data, error } = await supabase.functions.invoke('get-stripe-price');
        
        if (error) {
          console.error('useStripePrice: Erro na função:', error);
          throw error;
        }
        
        console.log('useStripePrice: Preço carregado com sucesso:', data);
        setPriceData(data);
        setError(null);
      } catch (err) {
        console.error('useStripePrice: Erro ao buscar preço:', err);
        setError(err instanceof Error ? err.message : 'Erro ao buscar preço');
        setPriceData(null); // Importante: não definir fallback aqui
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, []);

  return { priceData, loading, error };
};
