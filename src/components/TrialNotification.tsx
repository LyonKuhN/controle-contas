
import { useAuth } from '@/hooks/useAuth';
import { useStripePrice } from '@/hooks/useStripePrice';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

const TrialNotification = () => {
  const { user, subscriptionData, session } = useAuth();
  const { priceData } = useStripePrice();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [showNotification, setShowNotification] = useState(false);
  const [daysLeft, setDaysLeft] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !subscriptionData) return;

    const checkTrialStatus = () => {
      // If user has active subscription, don't show notification
      if (subscriptionData.subscribed) {
        setShowNotification(false);
        return;
      }

      // Check trial status
      const signupDate = new Date(user.created_at || new Date());
      const trialEndDate = new Date(signupDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
      const now = new Date();
      const timeLeft = trialEndDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
      
      setDaysLeft(daysRemaining);

      if (daysRemaining <= 3 && daysRemaining > 0) {
        setShowNotification(true);
      } else if (daysRemaining <= 0) {
        setShowNotification(true);
        setDaysLeft(0);
      } else {
        setShowNotification(false);
      }
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, subscriptionData]);

  const handleSubscribe = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      console.log('🛒 Iniciando checkout Stripe...');
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        console.log('🔗 Redirecionando para Stripe:', data.url);
        
        // Salvar estado atual antes de ir para Stripe
        sessionStorage.setItem('stripe_checkout_active', 'true');
        sessionStorage.setItem('checkout_timestamp', Date.now().toString());
        
        // Usar window.location.href em vez de window.open
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('❌ Erro no checkout:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar processo de assinatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!showNotification || subscriptionData?.subscribed) return null;

  const displayPrice = priceData?.formatted || 'R$ 29,90';

  if (isMobile) {
    return (
      <Card className="trial-notification p-4 mb-6 text-black">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold text-center">
              {daysLeft > 0 ? `${daysLeft} dia(s) restante(s) no teste gratuito` : 'Teste gratuito expirado'}
            </h3>
          </div>
          <p className="text-sm opacity-90 text-center">
            {daysLeft > 0 
              ? 'Assine agora e continue aproveitando todos os recursos' 
              : 'Assine para continuar usando o LYONPAY'}
          </p>
          <Button 
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800 w-full"
            size="sm"
          >
            <Crown className="w-4 h-4 mr-2" />
            {loading ? 'Processando...' : `Assinar ${displayPrice}/mês`}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="trial-notification p-4 mb-6 text-black">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">
              {daysLeft > 0 ? `${daysLeft} dia(s) restante(s) no teste gratuito` : 'Teste gratuito expirado'}
            </h3>
            <p className="text-sm opacity-90">
              {daysLeft > 0 
                ? 'Assine agora e continue aproveitando todos os recursos' 
                : 'Assine para continuar usando o LYONPAY'}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-black text-white hover:bg-gray-800"
          size="sm"
        >
          <Crown className="w-4 h-4 mr-2" />
          {loading ? 'Processando...' : `Assinar ${displayPrice}/mês`}
        </Button>
      </div>
    </Card>
  );
};

export default TrialNotification;
