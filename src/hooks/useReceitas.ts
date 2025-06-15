
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

  const { data: receitas = [], isLoading } = useQuery({
    queryKey: ['receitas'],
    queryFn: async () => {
      console.log('Buscando recebimentos do banco de dados...');
      const { data, error } = await supabase
        .from('receitas')
        .select(`
          *,
          categoria:categorias(nome, cor)
        `)
        .order('data_recebimento', { ascending: true });

      if (error) {
        console.error('Erro ao buscar recebimentos:', error);
        throw error;
      }
      console.log('Recebimentos carregados:', data);
      return data as Receita[];
    }
  });

  const createReceita = useMutation({
    mutationFn: async (receita: Omit<Receita, 'id' | 'categoria'>) => {
      console.log('Criando recebimento:', receita);
      
      // Obter o usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
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
        console.error('Erro ao criar recebimento:', error);
        throw error;
      }
      console.log('Recebimento criado:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Recebimento cadastrado com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Erro na mutação de recebimento:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar recebimento",
        variant: "destructive"
      });
    }
  });

  const updateReceita = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Receita> & { id: string }) => {
      console.log('Atualizando recebimento:', id, updates);
      const { data, error } = await supabase
        .from('receitas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar recebimento:', error);
        throw error;
      }
      console.log('Recebimento atualizado:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Recebimento atualizado com sucesso!"
      });
    }
  });

  const deleteReceita = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deletando recebimento:', id);
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar recebimento:', error);
        throw error;
      }
      console.log('Recebimento deletado com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Recebimento removido com sucesso!"
      });
    }
  });

  return {
    receitas,
    isLoading,
    createReceita,
    updateReceita,
    deleteReceita
  };
};
