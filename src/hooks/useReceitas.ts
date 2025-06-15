
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

  const { data: receitas = [], isLoading, error } = useQuery({
    queryKey: ['receitas'],
    queryFn: async () => {
      console.log('🔍 useReceitas: Iniciando busca de receitas...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('❌ useReceitas: Erro de autenticação:', userError);
        throw new Error(`Erro de autenticação: ${userError.message}`);
      }
      
      if (!user) {
        console.error('❌ useReceitas: Usuário não autenticado');
        throw new Error('Usuário não autenticado');
      }

      console.log('✅ useReceitas: Usuário autenticado:', user.email);

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

      console.log('📊 useReceitas: Resposta da API:', { data, error: queryError });

      if (queryError) {
        console.error('❌ useReceitas: Erro na query:', queryError);
        throw new Error(`Erro ao buscar receitas: ${queryError.message}`);
      }
      
      const result = (data as Receita[]) || [];
      console.log('✅ useReceitas: Receitas carregadas:', result.length);
      return result;
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  console.log('📈 useReceitas: Estado atual:', { 
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
