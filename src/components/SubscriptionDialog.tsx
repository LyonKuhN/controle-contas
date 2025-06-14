
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Crown, CreditCard, AlertTriangle } from "lucide-react";
import { useSubscriptionDialog } from "@/hooks/useSubscriptionDialog";

interface SubscriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubscriptionDialog = ({ isOpen, onClose }: SubscriptionDialogProps) => {
  const { loading, subscriptionData, handleCancelSubscription } = useSubscriptionDialog();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Gerenciar Assinatura
          </DialogTitle>
          <DialogDescription>
            Visualize e gerencie os detalhes da sua assinatura
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {subscriptionData?.subscribed ? (
            <>
              {/* Status da Assinatura */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge className="bg-green-500 text-white">
                    Ativa
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Plano</span>
                  <span className="text-sm">
                    {subscriptionData.subscription_tier || 'Premium'}
                  </span>
                </div>

                {subscriptionData.subscription_end && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Próxima cobrança
                    </span>
                    <span className="text-sm">
                      {formatDate(subscriptionData.subscription_end)}
                    </span>
                  </div>
                )}
              </div>

              {/* Aviso sobre cancelamento */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div className="text-sm text-orange-700">
                    <p className="font-medium">Cancelar assinatura</p>
                    <p className="text-xs mt-1">
                      Você será redirecionado para o portal do cliente onde poderá cancelar sua assinatura.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleCancelSubscription}
                  disabled={loading}
                  variant="outline"
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  {loading ? 'Abrindo portal...' : 'Gerenciar Assinatura'}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <AlertTriangle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Você não possui uma assinatura ativa no momento.
                </p>
              </div>
              
              <Button onClick={onClose} className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionDialog;
