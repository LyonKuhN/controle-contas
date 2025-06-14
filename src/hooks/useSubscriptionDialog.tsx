
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const useSubscriptionDialog = () => {
  const [loading, setLoading] = useState(false);
  const { subscriptionData, checkSubscription } = useAuth();
  const { toast } = useToast();

  const handleCancelSubscription = async () => {
    if (!subscriptionData?.subscribed) {
      toast({
        title: "Erro",
        description: "Nenhuma assinatura ativa encontrada",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Get user's subscription data to find Stripe customer ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: subscriber, error: subscriberError } = await supabase
        .from('subscribers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .single();

      if (subscriberError || !subscriber?.stripe_customer_id) {
        throw new Error("Subscription data not found");
      }

      // Call the customer portal function with cancel action
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { 
          customerId: subscriber.stripe_customer_id,
          action: 'cancel'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Assinatura cancelada com sucesso. Você ainda terá acesso até o final do período pago.",
        });
        
        // Refresh subscription data
        await checkSubscription();
      } else {
        throw new Error("Failed to cancel subscription");
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar assinatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    subscriptionData,
    handleCancelSubscription
  };
};
