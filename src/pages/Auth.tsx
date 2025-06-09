
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import SmsConfirmation from '@/components/SmsConfirmation';

type ConfirmationMethod = 'email' | 'sms';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmationMethod, setConfirmationMethod] = useState<ConfirmationMethod>('email');
  const [loading, setLoading] = useState(false);
  const [showSmsConfirmation, setShowSmsConfirmation] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Sucesso",
            description: "Login realizado com sucesso!"
          });
        }
      } else {
        // Cadastro
        const { error } = await signUp(email, password);
        if (error) {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive"
          });
        } else {
          // Sucesso no cadastro
          if (confirmationMethod === 'sms') {
            setShowSmsConfirmation(true);
          } else {
            setShowSuccessMessage(true);
            // Redirecionar para login após 3 segundos
            setTimeout(() => {
              setIsLogin(true);
              setShowSuccessMessage(false);
              setEmail('');
              setPassword('');
              setPhone('');
            }, 3000);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSmsSuccess = () => {
    setShowSmsConfirmation(false);
    setIsLogin(true);
    setEmail('');
    setPassword('');
    setPhone('');
    toast({
      title: "Conta confirmada!",
      description: "Agora você pode fazer login."
    });
  };

  const handleBackFromSms = () => {
    setShowSmsConfirmation(false);
  };

  if (showSmsConfirmation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
        <SmsConfirmation
          phone={phone}
          onBack={handleBackFromSms}
          onSuccess={handleSmsSuccess}
        />
      </div>
    );
  }

  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
        <Card className="p-8 w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-2xl font-bold">Conta criada com sucesso!</h2>
            <p className="text-muted-foreground">
              {confirmationMethod === 'email' 
                ? 'Verifique seu email para confirmar sua conta antes de fazer login.'
                : 'Agora você pode fazer login com suas credenciais.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecionando para a página de login...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
      <Card className="p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          {isLogin ? 'Entrar' : 'Criar Conta'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <Label>Método de confirmação</Label>
                <RadioGroup
                  value={confirmationMethod}
                  onValueChange={(value: ConfirmationMethod) => setConfirmationMethod(value)}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email-confirm" />
                    <Label htmlFor="email-confirm">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms-confirm" />
                    <Label htmlFor="sms-confirm">SMS</Label>
                  </div>
                </RadioGroup>
              </div>

              {confirmationMethod === 'sms' && (
                <div>
                  <Label htmlFor="phone">Telefone (com DDD)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    required={confirmationMethod === 'sms'}
                  />
                </div>
              )}
            </>
          )}
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline"
          >
            {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
