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

  // Test Supabase connectivity
  const testSupabaseConnection = async () => {
    try {
      console.log('🔍 Testando conectividade com Supabase...');
      
      // Simple ping to test connection
      const { data, error } = await supabase
        .from('categorias')
        .select('count(*)', { count: 'exact', head: true });
      
      if (error) {
        console.error('❌ Erro de conectividade Supabase:', error);
        setState(prev => ({
          ...prev,
          isSupabaseConnected: false,
          lastError: error.message,
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
      console.error('❌ Erro de rede:', error);
      setState(prev => ({
        ...prev,
        isSupabaseConnected: false,
        lastError: error instanceof Error ? error.message : 'Erro de conexão',
        isReconnecting: false
      }));
      return false;
    }
  };

  // Attempt reconnection
  const attemptReconnection = async () => {
    setState(prev => ({ ...prev, isReconnecting: true }));
    console.log('🔄 Tentando reconectar com Supabase...');
    
    const connected = await testSupabaseConnection();
    
    if (!connected) {
      // Retry after 3 seconds
      setTimeout(() => {
        attemptReconnection();
      }, 3000);
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

    // Test connectivity every 30 seconds
    const interval = setInterval(() => {
      if (navigator.onLine && !state.isSupabaseConnected && !state.isReconnecting) {
        testSupabaseConnection();
      }
    }, 30000);

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