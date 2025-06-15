
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User } from 'lucide-react';

interface DisplayNameModalProps {
  isOpen: boolean;
  onSubmit: (displayName: string) => Promise<{ error?: string }>;
  loading?: boolean;
}

const DisplayNameModal = ({ isOpen, onSubmit, loading = false }: DisplayNameModalProps) => {
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Por favor, insira um nome de exibição');
      return;
    }

    if (displayName.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres');
      return;
    }

    setError('');
    const result = await onSubmit(displayName.trim());
    
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Bem-vindo!</DialogTitle>
          <DialogDescription>
            Para começar, escolha um nome de exibição para sua conta
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="displayName">Nome de exibição</Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Digite seu nome"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1"
              disabled={loading}
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive mt-1">{error}</p>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={loading || !displayName.trim()} 
            className="w-full"
          >
            {loading ? 'Salvando...' : 'Continuar'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DisplayNameModal;
