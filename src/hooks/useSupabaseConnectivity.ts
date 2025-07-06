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
      
      // Use a timeout to prevent hanging connections
      const connectionPromise = supabase
        .from('categorias')
        .select('count(*)', { count: 'exact', head: true });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout de conexão - 10 segundos')), 10000);
      });

      const { data, error } = await Promise.race([connectionPromise, timeoutPromise]) as any;
      
      if (error) {
        const errorMessage = error.message || 'Erro de conectividade desconhecido';
        console.error('❌ Erro de conectividade Supabase:', errorMessage);
        
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
      const errorMessage = error instanceof Error ? error.message : 'Erro de rede desconhecido';
      console.error('❌ Erro de rede:', errorMessage);
      
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
      testSupabaseConnection();
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

    // Test connectivity every 60 seconds (reduced frequency to avoid overwhelming)
    const interval = setInterval(() => {
      if (navigator.onLine && !state.isSupabaseConnected && !state.isReconnecting && !isTestingConnection) {
        testSupabaseConnection();
      }
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [state.isSupabaseConnected, state.isReconnecting]);

  return {
    ...state,
    testConnection: testSupabaseConnection,
    reconnect: attemptReconnection
  };
};