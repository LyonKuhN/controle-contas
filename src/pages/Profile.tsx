import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStripePrice } from '@/hooks/useStripePrice';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { LogOut, User, Key, ArrowLeft, Clock, Crown, CreditCard, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import SubscriptionDialog from '@/components/SubscriptionDialog';

const Profile = () => {
  const { user, signOut, subscriptionData, session, userName } = useAuth();
  const { priceData } = useStripePrice();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    const calculateTrialTime = () => {
      if (subscriptionData?.subscribed) {
        setIsTrialActive(false);
        return;
      }

      const signupDate = new Date(user.created_at || new Date());
      const trialEndDate = new Date(signupDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
      const now = new Date();
      
      const difference = trialEndDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        setTimeRemaining({ days, hours, minutes });
        setIsTrialActive(true);
      } else {
        setIsTrialActive(false);
        setTimeRemaining({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTrialTime();
    const interval = setInterval(calculateTrialTime, 60000);

    return () => clearInterval(interval);
  }, [user.created_at, subscriptionData]);

  // Check if subscription is canceled but still active
  const isSubscriptionCanceled = subscriptionData?.subscribed && subscriptionData?.subscription_end;

  const getSubscriptionStatusDisplay = () => {
    if (!subscriptionData?.subscribed) return null;
    
    if (isSubscriptionCanceled) {
      const endDate = new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR');
      return `Cancelado, ativo até ${endDate}`;
    }
    
    return 'Assinatura Ativa';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive"
      });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso."
      });
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao alterar senha",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const displayPrice = priceData?.formatted || 'R$ 29,90';

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Menu
          </Link>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Header with Welcome Message */}
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Seja bem-vindo, {userName || 'Usuário'}!
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e configurações de conta
            </p>
          </div>

          {/* Subscription Status Card */}
          <Card className="p-6 border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Status da Assinatura</h2>
            </div>
            
            {subscriptionData?.subscribed ? (
              <div className="space-y-4">
                <div className={`${isSubscriptionCanceled ? 'bg-orange-500/20 text-orange-700' : 'bg-green-500/20 text-green-700'} p-4 rounded-lg text-center`}>
                  <p className="font-semibold text-lg">
                    {isSubscriptionCanceled ? '⚠️' : '✅'} {getSubscriptionStatusDisplay()}
                  </p>
                  <p className="text-sm">
                    Plano: {subscriptionData.subscription_tier || 'Premium'}
                  </p>
                  {subscriptionData.subscription_end && (
                    <p className="text-sm">
                      {isSubscriptionCanceled ? 'Ativa até' : 'Renova em'}: {new Date(subscriptionData.subscription_end).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={() => setShowSubscriptionDialog(true)}
                  disabled={loading}
                  className="w-full"
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar Assinatura
                </Button>
              </div>
            ) : isTrialActive ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-lg mb-2">Tempo restante do seu teste grátis:</p>
                  <div className="flex justify-center gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{timeRemaining.days}</div>
                      <div className="text-sm text-muted-foreground">Dias</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{timeRemaining.hours}</div>
                      <div className="text-sm text-muted-foreground">Horas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{timeRemaining.minutes}</div>
                      <div className="text-sm text-muted-foreground">Minutos</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-primary/20 text-primary p-4 rounded-lg text-center">
                  <p className="text-sm">
                    ✨ Aproveite todos os recursos premium durante seu período de teste!
                  </p>
                </div>

                <Button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-black font-semibold py-6"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  {loading ? 'Processando...' : `Assinar Agora - ${displayPrice}/mês`}
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="bg-destructive/20 text-destructive p-4 rounded-lg">
                  <p className="font-semibold">Seu período gratuito expirou</p>
                  <p className="text-sm">Assine agora para continuar usando todos os recursos</p>
                </div>
                
                <Button 
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-accent text-black font-semibold py-6"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? 'Processando...' : `Assinar Premium - ${displayPrice}/mês`}
                </Button>
              </div>
            )}
          </Card>

          {/* Account Info Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Informações da Conta</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  value={userName || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  O email e nome não podem ser alterados
                </p>
              </div>
            </div>
          </Card>

          {/* Change Password Card */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Alterar Senha</h2>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </form>
          </Card>

          {/* Logout Card */}
          <Card className="p-6 border-destructive/20">
            <div className="flex items-center gap-3 mb-4">
              <LogOut className="w-5 h-5 text-destructive" />
              <h2 className="text-xl font-semibold">Sair da Conta</h2>
            </div>
            
            <p className="text-muted-foreground mb-4">
              Clique no botão abaixo para fazer logout da sua conta.
            </p>
            
            <Button 
              onClick={handleLogout} 
              variant="destructive" 
              className="w-full"
            >
              Sair da Conta
            </Button>
          </Card>
        </div>
      </div>

      {/* Subscription Dialog */}
      <SubscriptionDialog 
        isOpen={showSubscriptionDialog} 
        onClose={() => setShowSubscriptionDialog(false)} 
      />
    </div>
  );
};

export default Profile;
