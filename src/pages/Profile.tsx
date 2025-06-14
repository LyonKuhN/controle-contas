
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { LogOut, User, Key, ArrowLeft, Clock, Crown, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isTrialActive, setIsTrialActive] = useState(true);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Simular período de teste (3 dias a partir do cadastro)
  useEffect(() => {
    const calculateTrialTime = () => {
      // Simular data de cadastro (para demo, usar uma data fixa)
      const signupDate = new Date(user.created_at || new Date());
      const trialEndDate = new Date(signupDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 dias
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
    const interval = setInterval(calculateTrialTime, 60000); // Atualizar a cada minuto

    return () => clearInterval(interval);
  }, [user.created_at]);

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

  const handleSubscribe = () => {
    toast({
      title: "Redirecionando...",
      description: "Você será redirecionado para a página de pagamento.",
    });
    // Aqui será implementada a integração com Stripe
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Voltar Button */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Menu
          </Link>
        </div>

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Profile Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Meu Perfil
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e configurações de conta
            </p>
          </div>

          {/* Trial Status Card */}
          <Card className="p-6 border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Status do Período Gratuito</h2>
            </div>
            
            {isTrialActive ? (
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
                  className="w-full bg-gradient-to-r from-primary to-accent text-black font-semibold py-6"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Assinar Agora - R$ 29,90/mês
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
                  className="w-full bg-gradient-to-r from-primary to-accent text-black font-semibold py-6"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Assinar Premium - R$ 29,90/mês
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  O email não pode ser alterado
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
    </div>
  );
};

export default Profile;
