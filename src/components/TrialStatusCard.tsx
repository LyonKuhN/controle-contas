
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Crown, Clock } from 'lucide-react';

const TrialStatusCard = () => {
  const { user, subscriptionData } = useAuth();
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    if (!user) return;

    const checkTrialStatus = () => {
      if (subscriptionData?.subscribed) return;

      const signupDate = new Date(user.created_at || new Date());
      const trialEndDate = new Date(signupDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
      const now = new Date();
      const timeLeft = trialEndDate.getTime() - now.getTime();
      const daysRemaining = Math.ceil(timeLeft / (24 * 60 * 60 * 1000));
      
      setDaysLeft(Math.max(0, daysRemaining));
    };

    checkTrialStatus();
    const interval = setInterval(checkTrialStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user, subscriptionData]);

  if (!user) return null;

  // Show premium status
  if (subscriptionData?.subscribed) {
    return (
      <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-200">
        <div className="flex items-center gap-3">
          <Crown className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-semibold text-yellow-700">Premium</h3>
            <p className="text-sm text-yellow-600/80">
              Plano ativo
            </p>
          </div>
        </div>
      </Card>
    );
  }

  // Show trial status
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200">
      <div className="flex items-center gap-3">
        <Clock className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="font-semibold text-blue-700">
            {daysLeft > 0 ? `${daysLeft} dia(s) restante(s)` : 'Teste expirado'}
          </h3>
          <p className="text-sm text-blue-600/80">
            {daysLeft > 0 ? 'Teste gratuito' : 'Assine para continuar'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default TrialStatusCard;
