
import { useState } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { session, subscriptionData, checkSubscription } = useAuth();
  const { toast } = useToast();

  const handleCancelSubscription = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
        // Fechar o diálogo após abrir o portal
        setIsOpen(false);
        // Verificar status da assinatura após um delay
        setTimeout(() => {
          checkSubscription();
        }, 3000);
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: "Erro ao abrir portal de cancelamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    loading,
    subscriptionData,
    handleCancelSubscription
  };
};
