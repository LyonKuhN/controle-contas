
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  categoria_id: string;
  data_vencimento: string;
  pago: boolean;
  data_pagamento?: string;
  observacoes?: string;
  tipo: 'fixa' | 'variavel' | 'parcelada';
  categoria?: {
    nome: string;
    cor: string;
  };
}

export const useDespesas = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: despesas = [], isLoading } = useQuery({
    queryKey: ['despesas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('despesas')
        .select(`
          *,
          categoria:categorias(nome, cor)
        `)
        .order('data_vencimento', { ascending: true });

      if (error) throw error;
      return data as Despesa[];
    }
  });

  const createDespesa = useMutation({
    mutationFn: async (despesa: Omit<Despesa, 'id' | 'categoria'>) => {
      const { data, error } = await supabase
        .from('despesas')
        .insert([{
          ...despesa,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: "Sucesso",
        description: "Despesa cadastrada com sucesso!"
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar despesa",
        variant: "destructive"
      });
    }
  });

  const updateDespesa = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Despesa> & { id: string }) => {
      const { data, error } = await supabase
        .from('despesas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
    }
  });

  const deleteDespesa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: "Sucesso",
        description: "Despesa removida com sucesso!"
      });
    }
  });

  return {
    despesas,
    isLoading,
    createDespesa,
    updateDespesa,
    deleteDespesa
  };
};
