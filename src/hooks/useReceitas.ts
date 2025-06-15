
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
      console.log('useReceitas: Iniciando busca de recebimentos...');
      
      try {
        // Verificar se o usuário está autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error('useReceitas: Erro de autenticação:', authError);
          throw new Error(`Erro de autenticação: ${authError.message}`);
        }
        
        if (!user) {
          console.error('useReceitas: Usuário não autenticado');
          throw new Error('Usuário não autenticado');
        }
        
        console.log('useReceitas: Usuário autenticado:', user.id);
        
        const { data, error: queryError } = await supabase
          .from('receitas')
          .select(`
            *,
            categoria:categorias(nome, cor)
          `)
          .eq('user_id', user.id)
          .order('data_recebimento', { ascending: true });

        if (queryError) {
          console.error('useReceitas: Erro ao buscar recebimentos:', queryError);
          throw new Error(`Erro ao buscar recebimentos: ${queryError.message}`);
        }
        
        console.log('useReceitas: Recebimentos carregados com sucesso:', data?.length || 0, 'items');
        return (data as Receita[]) || [];
        
      } catch (err) {
        console.error('useReceitas: Erro na função de busca:', err);
        throw err;
      }
    },
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Log de erro se houver
  if (error) {
    console.error('useReceitas: Erro na query:', error);
  }

  // Log do estado atual sempre que houver mudança
  console.log('useReceitas: Estado atual:', { 
    receitasCount: receitas?.length || 0, 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message
  });

  const createReceita = useMutation({
    mutationFn: async (receita: Omit<Receita, 'id' | 'categoria'>) => {
      console.log('useReceitas: Criando recebimento:', receita);
      
      try {
        // Obter o usuário autenticado
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (!user || authError) {
          throw new Error('Usuário não autenticado');
        }

        const { data, error } = await supabase
          .from('receitas')
          .insert([{
            ...receita,
            user_id: user.id
          }])
          .select()
          .single();

        if (error) {
          console.error('useReceitas: Erro ao criar recebimento:', error);
          throw new Error(`Erro ao criar recebimento: ${error.message}`);
        }
        
        console.log('useReceitas: Recebimento criado com sucesso:', data);
        return data;
      } catch (err) {
        console.error('useReceitas: Erro na criação:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Recebimento cadastrado com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('useReceitas: Erro na mutação de recebimento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar recebimento",
        variant: "destructive"
      });
    }
  });

  const updateReceita = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Receita> & { id: string }) => {
      console.log('useReceitas: Atualizando recebimento:', id, updates);
      
      try {
        const { data, error } = await supabase
          .from('receitas')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          console.error('useReceitas: Erro ao atualizar recebimento:', error);
          throw new Error(`Erro ao atualizar recebimento: ${error.message}`);
        }
        
        console.log('useReceitas: Recebimento atualizado com sucesso:', data);
        return data;
      } catch (err) {
        console.error('useReceitas: Erro na atualização:', err);
        throw err;
      }
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
      console.log('useReceitas: Deletando recebimento:', id);
      
      try {
        const { error } = await supabase
          .from('receitas')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('useReceitas: Erro ao deletar recebimento:', error);
          throw new Error(`Erro ao deletar recebimento: ${error.message}`);
        }
        
        console.log('useReceitas: Recebimento deletado com sucesso');
      } catch (err) {
        console.error('useReceitas: Erro na deleção:', err);
        throw err;
      }
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
