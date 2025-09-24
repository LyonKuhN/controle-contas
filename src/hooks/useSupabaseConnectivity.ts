import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectivityState {
  isOnline: boolean;
  isSupabaseConnected: boolean;
  isReconnecting: boolean;
  lastError: string | null;
}

export const useSupabaseConnectivity = () => {
  const [state, setState] = useState<ConnectivityState>({
    isOnline: navigator.onLine,
    isSupabaseConnected: true,
    isReconnecting: false,
    lastError: null
  });

  // Track connection attempts to prevent multiple simultaneous tests
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Force clear storage when connectivity fails
  const clearStorageAndRetry = () => {
    console.log('🧹 Limpando cache e localStorage...');
    // Clear Supabase auth cache
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('sb-ncjcsfnvyungxfmqszpz-auth-token');
    
    // Clear other potential cache keys
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('supabase') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    // Force page reload after clearing cache
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Test Supabase connectivity with concurrency control
  const testSupabaseConnection = async () => {
    // Prevent multiple simultaneous connection tests
    if (isTestingConnection) {
      console.log('🔄 Teste de conectividade já em andamento, aguardando...');
      return state.isSupabaseConnected;
    }

    setIsTestingConnection(true);

    try {
      console.log('🔍 Testando conectividade com Supabase...');
      
      // Simple connectivity test with timeout - use auth endpoint which doesn't require RLS
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Test connectivity using a simple operation that always works
      const { error, data } = await supabase.auth.getSession();

      clearTimeout(timeoutId);
      
      // Check if we have a valid session and not an empty or error response
      if (error || !data) {
        const errorMessage = error?.message || 'Erro de conectividade com o banco';
        console.error('❌ Erro de conectividade Supabase:', errorMessage);
        
        // If we have auth-related errors or storage issues, clear cache
        if (error?.message?.includes('session') || error?.message?.includes('invalid') || error?.message?.includes('expired')) {
          console.log('🧹 Erro de sessão detectado, limpando cache...');
          clearStorageAndRetry();
          return false;
        }
        
        setState(prev => ({
          ...prev,
          isSupabaseConnected: false,
          lastError: errorMessage,
          isReconnecting: false
        }));
        return false;
      }
      
      console.log('✅ Supabase conectado com sucesso');
      setState(prev => ({
        ...prev,
        isSupabaseConnected: true,
        lastError: null,
        isReconnecting: false
      }));
      return true;
    } catch (error) {
      let errorMessage = 'Erro de conexão desconhecido';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout na conexão (5 segundos)';
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('❌ Erro de conectividade:', errorMessage);
      
      setState(prev => ({
        ...prev,
        isSupabaseConnected: false,
        lastError: errorMessage,
        isReconnecting: false
      }));
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Attempt reconnection with backoff strategy
  const attemptReconnection = async () => {
    // Prevent multiple simultaneous reconnection attempts
    if (state.isReconnecting || isTestingConnection) {
      console.log('🔄 Reconexão já em andamento...');
      return;
    }

    setState(prev => ({ ...prev, isReconnecting: true }));
    console.log('🔄 Tentando reconectar com Supabase...');
    
    const connected = await testSupabaseConnection();
    
    if (!connected && navigator.onLine) {
      // Exponential backoff: retry after 5 seconds, then 10, then 20
      const retryDelay = Math.min(5000 * Math.pow(2, Math.floor(Date.now() / 10000) % 3), 20000);
      console.log(`🔄 Tentando novamente em ${retryDelay / 1000} segundos...`);
      
      setTimeout(() => {
        if (navigator.onLine && !state.isSupabaseConnected) {
          attemptReconnection();
        }
      }, retryDelay);
    } else {
      setState(prev => ({ ...prev, isReconnecting: false }));
    }
  };

  useEffect(() => {
    // Test initial connection
    testSupabaseConnection();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('🌐 Conexão de internet restaurada');
      setState(prev => ({ ...prev, isOnline: true }));
      // Só testa se realmente estava desconectado
      if (!state.isSupabaseConnected) {
        testSupabaseConnection();
      }
    };

    const handleOffline = () => {
      console.log('❌ Conexão de internet perdida');
      setState(prev => ({ 
        ...prev, 
        isOnline: false, 
        isSupabaseConnected: false,
        lastError: 'Sem conexão com a internet'
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test connectivity every 2 minutes when disconnected
    const interval = setInterval(() => {
      if (navigator.onLine && !state.isSupabaseConnected && !state.isReconnecting && !isTestingConnection) {
        console.log('🔄 Teste automático de conectividade...');
        testSupabaseConnection();
      }
    }, 120000); // 2 minutes when disconnected

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [state.isSupabaseConnected, state.isReconnecting]);

  return {
    ...state,
    testConnection: testSupabaseConnection,
    reconnect: attemptReconnection,
    clearCache: clearStorageAndRetry
  };
};