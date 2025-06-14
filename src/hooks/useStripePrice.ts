
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
        const { data, error } = await supabase.functions.invoke('get-stripe-price');
        
        if (error) {
          throw error;
        }
        
        setPriceData(data);
      } catch (err) {
        console.error('Error fetching price:', err);
        setError(err instanceof Error ? err.message : 'Error fetching price');
        // Fallback to default price
        setPriceData({
          amount: 29.90,
          currency: 'brl',
          formatted: 'R$ 29,90'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, []);

  return { priceData, loading, error };
};
