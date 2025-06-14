
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const TrialExpiredOverlay = () => {
  const { user, subscriptionData, session } = useAuth();
  const { toast } = useToast();
  const [isTrialExpired, setIsTrialExpired] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !subscriptionData) return;

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
  }, [user, subscriptionData]);

  const handleSubscribe = async () => {
    if (!session) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar processo de assinatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show overlay if user has active subscription or trial hasn't expired
  if (!isTrialExpired || subscriptionData?.subscribed) return null;

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
          <div className="text-lg font-bold">R$ 29,90/mês</div>
          <div className="text-sm">Acesso completo a todas as funcionalidades</div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-accent text-black font-semibold py-6 text-lg"
            size="lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            {loading ? 'Processando...' : 'Assinar Premium'}
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
