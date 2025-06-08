
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
      console.log('Buscando receitas do banco de dados...');
      const { data, error } = await supabase
        .from('receitas')
        .select(`
          *,
          categoria:categorias(nome, cor)
        `)
        .order('data_recebimento', { ascending: true });

      if (error) {
        console.error('Erro ao buscar receitas:', error);
        throw error;
      }
      console.log('Receitas carregadas:', data);
      return data as Receita[];
    }
  });

  const createReceita = useMutation({
    mutationFn: async (receita: Omit<Receita, 'id' | 'categoria'>) => {
      console.log('Criando receita:', receita);
      const { data, error } = await supabase
        .from('receitas')
        .insert([{
          ...receita,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar receita:', error);
        throw error;
      }
      console.log('Receita criada:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Receita cadastrada com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Erro na mutação de receita:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar receita",
        variant: "destructive"
      });
    }
  });

  const updateReceita = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Receita> & { id: string }) => {
      console.log('Atualizando receita:', id, updates);
      const { data, error } = await supabase
        .from('receitas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar receita:', error);
        throw error;
      }
      console.log('Receita atualizada:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Receita atualizada com sucesso!"
      });
    }
  });

  const deleteReceita = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deletando receita:', id);
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar receita:', error);
        throw error;
      }
      console.log('Receita deletada com sucesso');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Receita removida com sucesso!"
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
