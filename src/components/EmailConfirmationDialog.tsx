
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface EmailConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailConfirmationDialog = ({ isOpen, onClose, email }: EmailConfirmationDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleConfirmation = async () => {
    setIsLoading(true);
    
    try {
      // Check if the user's email is confirmed by trying to get their session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }

      // If no session, try to get the user to check confirmation status
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        // User not found or not confirmed yet
        toast({
          title: "Email ainda não confirmado",
          description: "Por favor, verifique seu email e clique no link de confirmação antes de prosseguir.",
          variant: "destructive"
        });
        
        // Redirect to login with error message
        setTimeout(() => {
          onClose();
          navigate('/auth?mode=login&error=not-confirmed');
        }, 2000);
        
        return;
      }

      if (user.email_confirmed_at) {
        // Email is confirmed, user can be logged in
        toast({
          title: "Email confirmado com sucesso!",
          description: "Redirecionando para o painel...",
        });
        
        onClose();
        navigate('/dashboard');
      } else {
        // Email not confirmed yet
        toast({
          title: "Email ainda não confirmado",
          description: "Por favor, verifique seu email e clique no link de confirmação.",
          variant: "destructive"
        });
        
        setTimeout(() => {
          onClose();
          navigate('/auth?mode=login&error=not-confirmed');
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error checking confirmation:', error);
      toast({
        title: "Erro ao verificar confirmação",
        description: "Tente novamente ou faça login manualmente.",
        variant: "destructive"
      });
      
      setTimeout(() => {
        onClose();
        navigate('/auth?mode=login&error=verification-failed');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    onClose();
    navigate('/auth?mode=login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Confirme seu Email
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Conta criada com sucesso!</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um email de confirmação para <strong>{email}</strong>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-yellow-500/10 rounded-lg border border-yellow-200">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Ação necessária</p>
                <p className="text-sm text-yellow-700">
                  Para acessar sua conta, você precisa confirmar seu email clicando no link que enviamos.
                </p>
              </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              Após confirmar seu email, clique no botão abaixo para fazer login automaticamente.
            </p>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <Button 
            onClick={handleConfirmation}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Verificando...' : 'Já confirmei meu email'}
          </Button>
          
          <Button 
            onClick={handleGoToLogin}
            variant="outline"
            className="w-full"
          >
            Ir para Login
          </Button>
        </div>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          Não recebeu o email? Verifique sua caixa de spam ou tente criar a conta novamente.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default EmailConfirmationDialog;
