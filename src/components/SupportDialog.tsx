
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
      console.log("Salvando mensagem de suporte...");
      
      const { data, error } = await supabase
        .from('support_messages')
        .insert({
          user_id: user?.id || null,
          user_email: emailToUse,
          user_name: user?.user_metadata?.full_name || 'Usuário',
          subject: subject.trim(),
          description: description.trim(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error("Erro ao salvar mensagem:", error);
        throw error;
      }

      console.log("Mensagem salva com sucesso:", data);

      toast({
        title: "Mensagem enviada com sucesso!",
        description: "Sua mensagem foi registrada e nossa equipe entrará em contato em breve através do email adm@lyonpay.com.",
      });
      
      setSubject('');
      setDescription('');
      setUserEmail('');
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem de suporte:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Houve um problema ao registrar sua mensagem. Tente novamente ou entre em contato diretamente através do email adm@lyonpay.com.",
        variant: "destructive"
      });
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
            Entre em contato conosco. Sua mensagem será registrada e responderemos através do email: <strong>adm@lyonpay.com</strong>
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
              {isLoading ? 'Enviando...' : 'Enviar Mensagem'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupportDialog;
