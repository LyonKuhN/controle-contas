import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wifi, WifiOff, RotateCcw } from 'lucide-react';
import { useSupabaseConnectivity } from '@/hooks/useSupabaseConnectivity';

const ConnectivityOverlay = () => {
  const location = useLocation();
  const { 
    isOnline, 
    isSupabaseConnected, 
    isReconnecting, 
    lastError, 
    reconnect 
  } = useSupabaseConnectivity();

  // Não mostrar overlay na landing page
  const isLandingPage = location.pathname === '/';
  
  if (isLandingPage) {
    return null;
  }

  // Block user interactions when offline
  useEffect(() => {
    if (!isOnline || !isSupabaseConnected) {
      document.body.style.pointerEvents = 'none';
      const overlay = document.querySelector('[data-connectivity-overlay]') as HTMLElement;
      if (overlay) {
        overlay.style.pointerEvents = 'all';
      }
    } else {
      document.body.style.pointerEvents = 'auto';
    }

    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, [isOnline, isSupabaseConnected]);

  if (isOnline && isSupabaseConnected) {
    return null;
  }

  return (
    <div 
      data-connectivity-overlay
      className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        <Alert className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">
            {!isOnline ? 'Sem Conexão com a Internet' : 'Conectividade com Servidor Perdida'}
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {!isOnline ? (
                <>
                  <WifiOff className="h-4 w-4" />
                  <span>Verifique sua conexão com a internet</span>
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  <span>Internet conectada, mas servidor indisponível</span>
                </>
              )}
            </div>
            
            {lastError && (
              <div className="text-xs text-muted-foreground bg-background/50 p-2 rounded">
                <strong>Erro:</strong> {lastError}
              </div>
            )}

            {isReconnecting ? (
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="h-4 w-4 animate-spin" />
                <span>Tentando reconectar...</span>
              </div>
            ) : (
              <Button 
                onClick={reconnect}
                variant="outline" 
                size="sm"
                className="w-full"
                disabled={!isOnline}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Tentar Reconectar
              </Button>
            )}

            <div className="text-xs text-center text-muted-foreground">
              Para sua segurança, as funcionalidades estão bloqueadas enquanto não há conexão.
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ConnectivityOverlay;