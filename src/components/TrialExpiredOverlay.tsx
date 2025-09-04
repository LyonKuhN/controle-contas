
import { useAuth } from '@/hooks/useAuth';
import { useStripePrice } from '@/hooks/useStripePrice';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TrialExpiredOverlay = () => {
  const { user, subscriptionData, session } = useAuth();
  const { priceData } = useStripePrice();
  const { toast } = useToast();
  const location = useLocation();
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  // Only show on specific pages
  const restrictedPages = ['/despesas', '/receitas', '/controle-contas'];
  const shouldShowOnCurrentPage = restrictedPages.includes(location.pathname);

  useEffect(() => {
    if (!user || !subscriptionData || !shouldShowOnCurrentPage) return;

    const checkTrialStatus = () => {
      // If user has active subscription, don't show overlay
      if (subscriptionData.subscribed) {
        setIsTrialExpired(false);
        return;
      }

      // Check if trial period has expired
      const signupDate = new Date(user.created_at || new Date());
      const trialEndDate = new Date(signupDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
      const now = new Date();
      
      if (now > trialEndDate) {
        setIsTrialExpired(true);
      } else {
        setIsTrialExpired(false);
      }
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, subscriptionData, shouldShowOnCurrentPage]);

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

  // Don't show overlay if user has active subscription, trial hasn't expired, or not on restricted page
  if (!isTrialExpired || subscriptionData?.subscribed || !shouldShowOnCurrentPage) return null;

  const displayPrice = priceData?.formatted || 'R$ 29,90';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="text-6xl">⏰</div>
        
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Seu período gratuito expirou
          </h2>
          <p className="text-muted-foreground">
            Continue aproveitando todos os recursos do LYONPAY assinando nosso plano premium.
          </p>
        </div>

        <div className="bg-primary/20 text-primary p-4 rounded-lg">
          <div className="text-lg font-bold">{displayPrice}/mês</div>
          <div className="text-sm">Acesso completo a todas as funcionalidades</div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleSubscribe}
            disabled={true}
            className="w-full bg-gradient-to-r from-primary to-accent text-black font-semibold py-6 text-lg opacity-50"
            size="lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            Temporariamente Indisponível
          </Button>
          
          <div className="text-xs text-muted-foreground">
            ✓ Controle financeiro completo • ✓ Relatórios avançados • ✓ Suporte prioritário
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TrialExpiredOverlay;
