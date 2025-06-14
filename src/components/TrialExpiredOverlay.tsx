
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TrialExpiredOverlay = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkTrialStatus = () => {
      // Simular data de cadastro (para demo, usar uma data fixa)
      const signupDate = new Date(user.created_at || new Date());
      const trialEndDate = new Date(signupDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 dias
      const now = new Date();
      
      if (now > trialEndDate) {
        setIsTrialExpired(true);
      }
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [user]);

  const handleSubscribe = () => {
    toast({
      title: "Redirecionando...",
      description: "Você será redirecionado para a página de pagamento.",
    });
    // Aqui será implementada a integração com Stripe
  };

  if (!isTrialExpired) return null;

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
            className="w-full bg-gradient-to-r from-primary to-accent text-black font-semibold py-6 text-lg"
            size="lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            Assinar Premium
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
