
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  createProfile: (displayName: string) => Promise<{ error?: string; data?: Profile }>;
  updateProfile: (displayName: string) => Promise<{ error?: string; data?: Profile }>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  
  // Controle para evitar múltiplas verificações simultâneas
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetchando profile para user:', userId);
      
      // Primeiro, tentar buscar profile existente
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Erro ao buscar profile:', fetchError);
        // Se der erro, tentar criar profile automaticamente
        console.log('🔄 Tentando criar profile automaticamente...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            user_id: userId,
            display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
          }])
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar profile:', createError);
          return;
        }

        console.log('✅ Profile criado automaticamente:', newProfile);
        setProfile(newProfile);
        setShowDisplayNameModal(false);
        return;
      }

      if (existingProfile) {
        console.log('✅ Profile encontrado:', existingProfile);
        setProfile(existingProfile);
        setShowDisplayNameModal(false);
      } else {
        console.log('⚠️ Nenhum profile encontrado, criando automaticamente...');
        // Criar profile automaticamente se não existir
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{
            user_id: userId,
            display_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'
          }])
          .select()
          .single();

        if (createError) {
          console.error('❌ Erro ao criar profile automaticamente:', createError);
          setShowDisplayNameModal(true);
          return;
        }

        console.log('✅ Profile criado automaticamente:', newProfile);
        setProfile(newProfile);
        setShowDisplayNameModal(false);
      }
    } catch (error) {
      console.error('❌ Erro geral ao processar profile:', error);
      setShowDisplayNameModal(true);
    }
  };

  const createProfile = async (displayName: string) => {
    if (!user) return { error: 'User not authenticated' };

    console.log('Creating profile with display name:', displayName);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          user_id: user.id,
          display_name: displayName
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return { error: error.message };
      }

      console.log('Profile created successfully:', data);
      setProfile(data);
      toast({
        title: "Perfil criado",
        description: "Seu nome de exibição foi definido com sucesso!"
      });
      
      return { data };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { error: 'Erro ao criar perfil' };
    }
  };

  const updateProfile = async (displayName: string) => {
    if (!user || !profile) return { error: 'Profile not found' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return { error: error.message };
      }

      setProfile(data);
      toast({
        title: "Perfil atualizado",
        description: "Seu nome de exibição foi atualizado com sucesso!"
      });
      
      return { data };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: 'Erro ao atualizar perfil' };
    }
  };

  const checkSubscription = async () => {
    if (!session || isCheckingSubscription) {
      console.log('⚠️ Verificação de assinatura cancelada - sem sessão ou já verificando');
      return;
    }
    
    // Verificar se a sessão não expirou
    if (session.expires_at && Date.now() >= session.expires_at * 1000) {
      console.log('⚠️ Verificação de assinatura cancelada - sessão expirada');
      return;
    }

    // Verificar se é usuário admin
    if (user?.email && (user.email === 'empresa@admin.local' || user.email.endsWith('@admin.local'))) {
      console.log('👑 Usuário admin detectado, aplicando assinatura permanente');
      setSubscriptionData({
        subscribed: true,
        subscription_tier: 'Enterprise',
        subscription_end: '2099-12-31T23:59:59Z'
      });
      return;
    }
    
    setIsCheckingSubscription(true);
    
    try {
      console.log('🔍 Verificando assinatura...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout (reduzido)
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        }
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        console.error('❌ Error checking subscription:', error);
        // Retry após 3 segundos em caso de erro
        setTimeout(() => {
          if (!isCheckingSubscription && session) {
            checkSubscription();
          }
        }, 3000);
        return;
      }
      
      console.log('✅ Assinatura verificada:', data);
      setSubscriptionData(data);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('❌ Timeout na verificação de assinatura');
      } else {
        console.error('❌ Error checking subscription:', error);
      }
      
      // Retry após 5 segundos em caso de timeout ou erro
      setTimeout(() => {
        if (!isCheckingSubscription && session) {
          console.log('🔄 Tentativa automática de verificação de assinatura...');
          checkSubscription();
        }
      }, 5000);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  useEffect(() => {
    console.log('🔧 useAuth: Iniciando configuração de autenticação...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch profile first before setting loading to false
          await fetchProfile(session.user.id);
          setLoading(false);
          
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            console.log('Verificando assinatura automaticamente...');
            // Use debouncing to prevent multiple simultaneous calls - only for new sessions
            setTimeout(() => {
              if (!isCheckingSubscription) {
                checkSubscription();
              }
            }, 3000); // Increased delay to ensure stability
          }
        } else {
          setLoading(false);
        }
        
        // Clear data when user signs out
        if (event === 'SIGNED_OUT') {
          console.log('🔄 useAuth: Limpando dados do usuário...');
          setSubscriptionData(null);
          setUserName(null);
          setProfile(null);
          setShowDisplayNameModal(false);
          setIsCheckingSubscription(false);
        }
      }
    );

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (error) {
        console.error('❌ useAuth: Erro ao obter sessão:', error);
        setLoading(false);
        return;
      }
      
      console.log('Sessão inicial:', session?.user?.email || 'Nenhuma sessão');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchProfile(session.user.id);
        setLoading(false);
        
        console.log('Verificando assinatura para sessão existente...');
        setTimeout(() => {
          if (!isCheckingSubscription) {
            checkSubscription();
          }
        }, 2000);
      } else {
        setLoading(false);
      }
    });

    return () => {
      console.log('🔧 useAuth: Limpando subscription...');
      subscription.unsubscribe();
    };
  }, []); // Dependências vazias para evitar loops

  // Update userName when profile changes
  useEffect(() => {
    console.log('🏷️ Atualizando userName:', { 
      profileDisplayName: profile?.display_name, 
      userFullName: user?.user_metadata?.full_name,
      userEmail: user?.email 
    });
    
    if (profile?.display_name) {
      setUserName(profile.display_name);
      console.log('✅ UserName definido pelo profile:', profile.display_name);
    } else if (user?.user_metadata?.full_name) {
      setUserName(user.user_metadata.full_name);
      console.log('✅ UserName definido pelo metadata:', user.user_metadata.full_name);
    } else if (user?.email) {
      // Fallback to first part of email
      const emailName = user.email.split('@')[0] || '';
      const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      setUserName(formattedName);
      console.log('✅ UserName definido pelo email:', formattedName);
    } else {
      setUserName(null);
      console.log('⚠️ UserName definido como null');
    }
  }, [profile, user]);

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

  // Force refresh profile data
  const refetchProfile = useCallback(async () => {
    if (user) {
      console.log('🔄 Forçando refresh do profile...');
      await fetchProfile(user.id);
    }
  }, [user]);

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
      setShowDisplayNameModal,
      createProfile,
      updateProfile,
      refetchProfile
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
