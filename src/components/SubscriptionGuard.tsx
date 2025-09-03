
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { user, subscriptionData } = useAuth();
  const location = useLocation();
  const [isTrialExpired, setIsTrialExpired] = useState(false);

  // Pages that require active subscription
  const protectedPages = ['/despesas', '/receitas', '/controle-contas'];
  const isProtectedPage = protectedPages.includes(location.pathname);

  useEffect(() => {
    if (!user || !isProtectedPage) {
      setIsTrialExpired(false);
      return;
    }

    const checkTrialStatus = () => {
      // Check if user is admin (bypass all restrictions)
      if (user.email && (user.email === 'empresa@admin.local' || user.email.endsWith('@admin.local'))) {
        console.log('👑 Usuário admin detectado, bypassing subscription guard');
        setIsTrialExpired(false);
        return;
      }
      
      // If user has active subscription, allow access
      if (subscriptionData?.subscribed) {
        setIsTrialExpired(false);
        return;
      }

      // Check if trial period has expired
      const signupDate = new Date(user.created_at || new Date());
      const trialEndDate = new Date(signupDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days
      const now = new Date();
      
      if (now > trialEndDate) {
        setIsTrialExpired(true);
      } else {
        setIsTrialExpired(false);
      }
    };

    checkTrialStatus();
  }, [user, subscriptionData, isProtectedPage]);

  // If trial is expired and user is trying to access protected content, redirect to profile
  if (isTrialExpired && isProtectedPage) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
