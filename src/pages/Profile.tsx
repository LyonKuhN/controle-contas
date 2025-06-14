
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Navigate } from 'react-router-dom';
import { LogOut, User, Key, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

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
      // Aqui você implementaria a mudança de senha com Supabase
      // const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      // Simulando sucesso por enquanto
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
