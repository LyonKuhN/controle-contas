
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout para evitar loading infinito
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ ProtectedRoute: Timeout de loading atingido');
        setTimeoutReached(true);
      }
    }, 15000); // 15 segundos

    return () => clearTimeout(timer);
  }, [loading]);

  // Se houve timeout e ainda está loading, redirecionar para auth
  if (timeoutReached && loading) {
    console.log('🔄 ProtectedRoute: Redirecionando devido a timeout');
    return <Navigate to="/auth" replace />;
  }

  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-lg">Carregando...</p>
          <p className="text-sm text-muted-foreground mt-2">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
