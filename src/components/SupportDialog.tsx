
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SupportDialogProps {
  variant?: 'outline' | 'default';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

const SupportDialog = ({ variant = 'outline', size = 'default', className = '' }: SupportDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !description.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-support-email', {
        body: { subject, description }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Email de suporte enviado!",
        description: "Recebemos sua mensagem e responderemos em breve através do email adm@lyonpay.com.",
      });
      
      setSubject('');
      setDescription('');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error sending support email:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar email de suporte. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Suporte
        </Button>
      </DialogTrigger>
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
          <div>
            <Label htmlFor="subject">Assunto</Label>
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
            <Label htmlFor="description">Descrição</Label>
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
              onClick={() => setIsOpen(false)}
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
