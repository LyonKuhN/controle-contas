
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
  dia_vencimento?: number; // Para receitas fixas, o dia do mês que vence
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
      console.log('useReceitas: === INICIANDO BUSCA SIMPLIFICADA ===');
      
      try {
        // Verificar autenticação primeiro
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('useReceitas: Erro de autenticação:', userError);
          throw new Error(`Erro de autenticação: ${userError.message}`);
        }
        
        if (!user) {
          console.error('useReceitas: Usuário não autenticado');
          throw new Error('Usuário não autenticado');
        }

        console.log('useReceitas: Usuário autenticado:', user.email);

        // Buscar receitas com query simplificada
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

        console.log('useReceitas: Resultado da query:', { 
          data: data, 
          dataLength: data?.length || 0,
          error: queryError,
          userId: user.id
        });

        if (queryError) {
          console.error('useReceitas: Erro na query:', queryError);
          throw new Error(`Erro ao buscar receitas: ${queryError.message}`);
        }
        
        const result = (data as Receita[]) || [];
        console.log('useReceitas: === BUSCA CONCLUÍDA ===', { 
          total: result.length,
          receitas: result.slice(0, 2) // Log das primeiras 2 receitas para debug
        });
        
        return result;
        
      } catch (err: any) {
        console.error('useReceitas: === ERRO FATAL ===', err);
        throw err;
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 0, // Sempre buscar dados frescos para debug
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log('useReceitas: Estado atual:', { 
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
        description: "Receita cadastrada com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('useReceitas: Erro na mutação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar receita",
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
        description: "Receita atualizada com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('useReceitas: Erro na atualização:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar receita",
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
        description: "Receita removida com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('useReceitas: Erro na deleção:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao remover receita",
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
