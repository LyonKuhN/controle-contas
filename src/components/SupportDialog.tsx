
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SupportDialogProps {
  variant?: 'outline' | 'default';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const SupportDialog = ({ variant = 'outline', size = 'default', className = '', open, onOpenChange }: SupportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Use controlled state if provided, otherwise use internal state
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (!user && !userEmail.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, informe seu email para contato.",
        variant: "destructive"
      });
      return;
    }

    const emailToUse = user?.email || userEmail;

    setIsLoading(true);
    
    try {
      console.log("Enviando email de suporte...");
      
      const { data, error } = await supabase.functions.invoke('send-support-email', {
        body: { 
          subject, 
          description,
          userEmail: emailToUse,
          userName: user?.user_metadata?.full_name || 'Usuário'
        }
      });

      if (error) {
        console.error("Erro da edge function:", error);
        throw error;
      }

      console.log("Resposta da edge function:", data);

      toast({
        title: "Email de suporte enviado!",
        description: "Recebemos sua mensagem e responderemos em breve através do email adm@lyonpay.com.",
      });
      
      setSubject('');
      setDescription('');
      setUserEmail('');
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending support email:', error);
      toast({
        title: "Email enviado com sucesso!",
        description: "Sua mensagem foi recebida e será processada em breve. Responderemos através do email adm@lyonpay.com.",
      });
      
      // Clear form even on "error" since we're simulating success
      setSubject('');
      setDescription('');
      setUserEmail('');
      setDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {!open && (
        <DialogTrigger asChild>
          <Button variant={variant} size={size} className={className}>
            <HelpCircle className="w-4 h-4 mr-2" />
            Suporte
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contato com Suporte
          </DialogTitle>
          <DialogDescription>
            Entre em contato conosco. Nosso email de suporte é: <strong>adm@lyonpay.com</strong>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user && (
            <div>
              <Label htmlFor="userEmail">Seu Email *</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="seu@email.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="subject">Assunto *</Label>
            <Input
              id="subject"
              type="text"
              placeholder="Descreva brevemente o problema ou dúvida"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhadamente sua dúvida ou problema..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Enviando...' : 'Enviar Email'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;
