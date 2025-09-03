
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Receita {
  id: string;
  descricao: string;
  valor: number;
  categoria_id: string;
  data_recebimento: string;
  recebido: boolean;
  observacoes?: string;
  tipo?: 'fixa' | 'variavel';
  dia_vencimento?: number;
  categoria?: {
    nome: string;
    cor: string;
  };
}

export const useReceitas = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, loading: authLoading } = useAuth();

  const { data: receitas = [], isLoading, error } = useQuery({
    queryKey: ['receitas', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('🚫 useReceitas: Usuário não autenticado');
        return [];
      }

      console.log('🔄 useReceitas: Buscando receitas para usuário', user.id);

      const { data, error: queryError } = await supabase
        .from('receitas')
        .select(`
          id,
          descricao,
          valor,
          categoria_id,
          data_recebimento,
          recebido,
          observacoes,
          categoria:categorias(nome, cor)
        `)
        .eq('user_id', user.id)
        .order('data_recebimento', { ascending: true });

      if (queryError) {
        console.error('❌ useReceitas: Erro na query:', queryError);
        throw new Error(`Erro na query: ${queryError.message}`);
      }
      
      console.log('✅ useReceitas: Dados carregados:', data?.length || 0, 'receitas');
      return (data as Receita[]) || [];
    },
    enabled: !!user, // Simplifiquei - só precisa do user
    retry: 2,
    retryDelay: (attemptIndex) => 1000 * Math.pow(2, attemptIndex), // backoff exponencial
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Mudei para true para sempre buscar quando montar
    refetchOnReconnect: true,
    networkMode: 'online'
  });

  console.log('📈 useReceitas: Estado final:', { 
    receitasCount: receitas?.length || 0, 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message
  });

  const createReceita = useMutation({
    mutationFn: async (receita: Omit<Receita, 'id' | 'categoria'>) => {
      console.log('useReceitas: Criando receita:', receita);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const receitaData = {
        ...receita,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('receitas')
        .insert([receitaData])
        .select()
        .single();

      if (error) {
        console.error('useReceitas: Erro ao criar receita:', error);
        throw new Error(`Erro ao criar receita: ${error.message}`);
      }
      
      console.log('useReceitas: Receita criada com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Recebimento cadastrado com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('useReceitas: Erro na mutação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar recebimento",
        variant: "destructive"
      });
    }
  });

  const updateReceita = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Receita> & { id: string }) => {
      console.log('useReceitas: Atualizando receita:', id, updates);
      
      const { data, error } = await supabase
        .from('receitas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useReceitas: Erro ao atualizar receita:', error);
        throw new Error(`Erro ao atualizar receita: ${error.message}`);
      }
      
      console.log('useReceitas: Receita atualizada com sucesso:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Recebimento atualizado com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('useReceitas: Erro na atualização:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar recebimento",
        variant: "destructive"
      });
    }
  });

  const deleteReceita = useMutation({
    mutationFn: async (id: string) => {
      console.log('useReceitas: Deletando receita:', id);
      
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useReceitas: Erro ao deletar receita:', error);
        throw new Error(`Erro ao deletar receita: ${error.message}`);
      }
      
      console.log('useReceitas: Receita deletada com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Recebimento removido com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('useReceitas: Erro na deleção:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover recebimento",
        variant: "destructive"
      });
    }
  });

  return {
    receitas,
    isLoading,
    error,
    createReceita,
    updateReceita,
    deleteReceita
  };
};
