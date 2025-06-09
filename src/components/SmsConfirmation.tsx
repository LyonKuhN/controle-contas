
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';

interface SmsConfirmationProps {
  phone: string;
  onBack: () => void;
  onSuccess: () => void;
}

const SmsConfirmation = ({ phone, onBack, onSuccess }: SmsConfirmationProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "O código deve ter 6 dígitos",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Aqui você implementaria a verificação do SMS com Supabase
      // Por enquanto, vamos simular uma verificação bem-sucedida
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Conta confirmada!",
        description: "Sua conta foi confirmada com sucesso via SMS."
      });
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Código inválido ou expirado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      // Aqui você implementaria o reenvio do SMS
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Código reenviado",
        description: "Um novo código foi enviado para seu telefone."
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reenviar código",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Confirmação por SMS
      </h2>
      
      <p className="text-center text-muted-foreground mb-6">
        Digite o código de 6 dígitos enviado para {phone}
      </p>
      
      <div className="space-y-6">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(value) => setCode(value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        
        <Button 
          onClick={handleVerifyCode} 
          className="w-full" 
          disabled={loading || code.length !== 6}
        >
          {loading ? 'Verificando...' : 'Confirmar Código'}
        </Button>
        
        <div className="text-center space-y-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendCode}
            disabled={loading}
          >
            Reenviar código
          </Button>
          
          <br />
          
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
          >
            Voltar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SmsConfirmation;
