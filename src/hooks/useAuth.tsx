
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscriptionData: SubscriptionData | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  loading: boolean;
  userName: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);

  const checkSubscription = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Error checking subscription:', error);
        return;
      }
      
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Extract user name from metadata
        if (session?.user?.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name);
        } else if (session?.user?.email) {
          // Fallback to first part of email
          const emailName = session.user.email.split('@')[0];
          setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
        }
        
        // Verificar assinatura automaticamente em qualquer evento de login
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('Verificando assinatura automaticamente...');
          setTimeout(async () => {
            try {
              const { data, error } = await supabase.functions.invoke('check-subscription', {
                headers: {
                  Authorization: `Bearer ${session.access_token}`,
                },
              });
              
              if (error) {
                console.error('Error checking subscription:', error);
                return;
              }
              
              console.log('Dados da assinatura atualizados:', data);
              setSubscriptionData(data);
            } catch (error) {
              console.error('Error checking subscription:', error);
            }
          }, 1000);
        }
        
        // Clear subscription data when user signs out
        if (event === 'SIGNED_OUT') {
          setSubscriptionData(null);
          setUserName(null);
        }
      }
    );

    // Verificar sessão existente e assinatura
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Sessão inicial:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Extract user name from metadata
      if (session?.user?.user_metadata?.full_name) {
        setUserName(session.user.user_metadata.full_name);
      } else if (session?.user?.email) {
        // Fallback to first part of email
        const emailName = session.user.email.split('@')[0];
        setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
      }
      
      // Verificar assinatura para sessão existente
      if (session?.user) {
        console.log('Verificando assinatura para sessão existente...');
        setTimeout(async () => {
          try {
            const { data, error } = await supabase.functions.invoke('check-subscription', {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            
            if (error) {
              console.error('Error checking subscription:', error);
              return;
            }
            
            console.log('Dados da assinatura carregados:', data);
            setSubscriptionData(data);
          } catch (error) {
            console.error('Error checking subscription:', error);
          }
        }, 1000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      subscriptionData,
      signUp,
      signIn,
      signOut,
      checkSubscription,
      loading,
      userName
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
