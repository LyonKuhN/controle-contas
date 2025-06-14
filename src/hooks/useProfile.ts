
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (displayName: string) => {
    if (!user) return { error: 'User not authenticated' };

    setLoading(true);
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

      setProfile(data);
      toast({
        title: "Perfil criado",
        description: "Seu nome de exibição foi definido com sucesso!"
      });
      
      return { data };
    } catch (error) {
      console.error('Error creating profile:', error);
      return { error: 'Erro ao criar perfil' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (displayName: string) => {
    if (!user || !profile) return { error: 'Profile not found' };

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    createProfile,
    updateProfile,
    refetchProfile: fetchProfile
  };
};
