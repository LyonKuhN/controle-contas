
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  subscriptionData: SubscriptionData | null;
  profile: Profile | null;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  loading: boolean;
  userName: string | null;
  showDisplayNameModal: boolean;
  setShowDisplayNameModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      
      // If user is logged in but has no profile, show the modal
      if (!data) {
        setShowDisplayNameModal(true);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

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
        
        if (session?.user) {
          // Extract user name from metadata or profile
          if (profile?.display_name) {
            setUserName(profile.display_name);
          } else if (session.user.user_metadata?.full_name) {
            setUserName(session.user.user_metadata.full_name);
          } else {
            // Fallback to first part of email
            const emailName = session.user.email?.split('@')[0] || '';
            setUserName(emailName.charAt(0).toUpperCase() + emailName.slice(1));
          }

          // Fetch profile and check subscription
          await fetchProfile(session.user.id);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
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
        }
        
        // Clear data when user signs out
        if (event === 'SIGNED_OUT') {
          setSubscriptionData(null);
          setUserName(null);
          setProfile(null);
          setShowDisplayNameModal(false);
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('Sessão inicial:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
        
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

  // Update userName when profile changes
  useEffect(() => {
    if (profile?.display_name) {
      setUserName(profile.display_name);
    }
  }, [profile]);

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
      profile,
      signUp,
      signIn,
      signOut,
      checkSubscription,
      loading,
      userName,
      showDisplayNameModal,
      setShowDisplayNameModal
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
