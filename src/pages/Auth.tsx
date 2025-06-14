
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Eye, EyeOff, ArrowLeft, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import EmailConfirmationDialog from '@/components/EmailConfirmationDialog';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, signIn, signUp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    const errorParam = searchParams.get('error');
    
    if (modeParam === 'signup') {
      setMode('signup');
    } else {
      setMode('login');
    }

    // Handle error messages from URL params
    if (errorParam) {
      switch (errorParam) {
        case 'not-confirmed':
          toast({
            title: "Email não confirmado",
            description: "Por favor, confirme seu email antes de fazer login.",
            variant: "destructive"
          });
          break;
        case 'verification-failed':
          toast({
            title: "Erro na verificação",
            description: "Houve um problema ao verificar seu email. Tente fazer login.",
            variant: "destructive"
          });
          break;
        default:
          break;
      }
    }
  }, [searchParams, toast]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateEmail = (): boolean => {
    if (!email) {
      setEmailError('O email é obrigatório.');
      return false;
    }
    if (!isValidEmail(email)) {
      setEmailError('Email inválido.');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (): boolean => {
    if (!password) {
      setPasswordError('A senha é obrigatória.');
      return false;
    }
    if (!isValidPassword(password)) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (): boolean => {
    if (mode === 'signup') {
      if (!confirmPassword) {
        setConfirmPasswordError('A confirmação de senha é obrigatória.');
        return false;
      }
      if (password !== confirmPassword) {
        setConfirmPasswordError('As senhas não coincidem.');
        return false;
      }
      setConfirmPasswordError(null);
    }
    return true;
  };

  const getAuthErrorMessage = (error: any): string => {
    const errorMessage = error?.message || '';
    
    if (errorMessage.includes('Invalid login credentials') || errorMessage.includes('invalid_credentials')) {
      return 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
    }
    
    if (errorMessage.includes('Email not confirmed')) {
      return 'Seu email ainda não foi confirmado. Verifique sua caixa de entrada.';
    }
    
    if (errorMessage.includes('too_many_requests')) {
      return 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.';
    }
    
    if (errorMessage.includes('signup_disabled')) {
      return 'Cadastro temporariamente desabilitado. Tente novamente mais tarde.';
    }
    
    if (errorMessage.includes('weak_password') || errorMessage.includes('password')) {
      return 'A senha deve ter pelo menos 6 caracteres e ser mais forte.';
    }
    
    if (errorMessage.includes('email')) {
      return 'Email inválido ou já está em uso.';
    }
    
    return 'Ocorreu um erro inesperado. Tente novamente.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();
    const isConfirmPasswordValid = validateConfirmPassword();

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Redirecionando para o painel...",
        });
      } else {
        const { error } = await signUp(email, password);
        
        if (error) {
          throw error;
        }
        
        // Show email confirmation dialog instead of toast
        setSignupEmail(email);
        setShowEmailConfirmation(true);
        
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      const friendlyMessage = getAuthErrorMessage(error);
      
      toast({
        variant: "destructive",
        title: mode === 'login' ? "Erro ao fazer login" : "Erro ao criar conta",
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{mode === 'login' ? 'Login' : 'Criar Conta'}</CardTitle>
            <CardDescription className="text-center">
              {mode === 'login'
                ? 'Entre com seu email e senha para acessar o painel.'
                : 'Crie sua conta para começar a controlar suas finanças.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Tabs defaultValue={mode} className="w-full">
              <TabsList>
                <TabsTrigger value="login" onClick={() => setMode('login')}>
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setMode('signup')}>
                  Criar Conta
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={validateEmail}
                    />
                    {emailError && <Alert variant="destructive"><AlertDescription>{emailError}</AlertDescription></Alert>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={validatePassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">Mostrar senha</span>
                      </Button>
                    </div>
                    {passwordError && <Alert variant="destructive"><AlertDescription>{passwordError}</AlertDescription></Alert>}
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seuemail@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={validateEmail}
                    />
                    {emailError && <Alert variant="destructive"><AlertDescription>{emailError}</AlertDescription></Alert>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Senha (mínimo 6 caracteres)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={validatePassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">Mostrar senha</span>
                      </Button>
                    </div>
                    {passwordError && <Alert variant="destructive"><AlertDescription>{passwordError}</AlertDescription></Alert>}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirmar Senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={validateConfirmPassword}
                      />
                    </div>
                    {confirmPasswordError && <Alert variant="destructive"><AlertDescription>{confirmPasswordError}</AlertDescription></Alert>}
                  </div>
                  
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Importante</p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Após criar sua conta, você receberá um email de confirmação. É necessário confirmar seu email para acessar o sistema.
                      </p>
                    </div>
                  </div>
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <Separator />
          </CardContent>
        </Card>
      </div>

      <EmailConfirmationDialog
        isOpen={showEmailConfirmation}
        onClose={() => setShowEmailConfirmation(false)}
        email={signupEmail}
      />
    </div>
  );
};

export default Auth;
