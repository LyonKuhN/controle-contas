
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
  numero_parcelas?: number;
  valor_total?: number;
  parcela_atual?: number;
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
      console.log('Buscando despesas do banco de dados...');
      const { data, error } = await supabase
        .from('despesas')
        .select(`
          *,
          categoria:categorias(nome, cor)
        `)
        .order('data_vencimento', { ascending: true });

      if (error) {
        console.error('Erro ao buscar despesas:', error);
        throw error;
      }
      console.log('Despesas carregadas:', data);
      return data as Despesa[];
    }
  });

  const createDespesa = useMutation({
    mutationFn: async (despesa: Omit<Despesa, 'id' | 'categoria'>) => {
      console.log('Criando despesa:', despesa);
      const { data, error } = await supabase
        .from('despesas')
        .insert([{
          ...despesa,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar despesa:', error);
        throw error;
      }
      console.log('Despesa criada:', data);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      
      // Personalizar mensagem de sucesso baseada no tipo
      if (variables.tipo === 'fixa') {
        toast({
          title: "Sucesso",
          description: "Despesa fixa modelo cadastrada! Use o botão 'Gerar Despesas Fixas' no controle de contas para criar as despesas do mês."
        });
      } else if (variables.numero_parcelas && variables.parcela_atual === variables.numero_parcelas) {
        toast({
          title: "Sucesso",
          description: `Despesa parcelada cadastrada com ${variables.numero_parcelas} parcelas!`
        });
      } else if (!variables.parcela_atual) {
        toast({
          title: "Sucesso",
          description: "Despesa cadastrada com sucesso!"
        });
      }
    },
    onError: (error) => {
      console.error('Erro na mutação de despesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar despesa",
        variant: "destructive"
      });
    }
  });

  const generateDespesasFixas = useMutation({
    mutationFn: async (targetDate: Date) => {
      console.log('Gerando despesas fixas para:', targetDate.toLocaleDateString('pt-BR'));
      
      // Buscar todas as despesas fixas modelo (que não têm data específica ainda)
      const { data: despesasModelo, error: fetchError } = await supabase
        .from('despesas')
        .select('*')
        .eq('tipo', 'fixa')
        .eq('pago', false);

      if (fetchError) {
        console.error('Erro ao buscar despesas modelo:', fetchError);
        throw fetchError;
      }

      if (!despesasModelo || despesasModelo.length === 0) {
        throw new Error('Nenhuma despesa fixa modelo encontrada');
      }

      // Gerar despesas para o mês selecionado
      const promises = despesasModelo.map(async (modelo) => {
        // Extrair o dia da data de vencimento da despesa modelo
        const diaVencimento = new Date(modelo.data_vencimento).getDate();
        
        // Criar nova data para o mês/ano selecionado
        const novaData = new Date(targetDate.getFullYear(), targetDate.getMonth(), diaVencimento);
        
        // Se o dia não existe no mês (ex: 31 de fevereiro), ajustar para o último dia do mês
        if (novaData.getMonth() !== targetDate.getMonth()) {
          novaData.setDate(0); // Vai para o último dia do mês anterior
        }

        // Verificar se já existe uma despesa igual para este mês
        const { data: existingDespesa } = await supabase
          .from('despesas')
          .select('id')
          .eq('descricao', modelo.descricao)
          .eq('categoria_id', modelo.categoria_id)
          .eq('data_vencimento', novaData.toISOString().split('T')[0])
          .single();

        if (existingDespesa) {
          console.log(`Despesa ${modelo.descricao} já existe para ${novaData.toLocaleDateString('pt-BR')}`);
          return null;
        }

        const { data, error } = await supabase
          .from('despesas')
          .insert([{
            descricao: modelo.descricao,
            valor: modelo.valor,
            categoria_id: modelo.categoria_id,
            data_vencimento: novaData.toISOString().split('T')[0],
            tipo: 'fixa',
            observacoes: modelo.observacoes,
            user_id: modelo.user_id,
            pago: false
          }])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar despesa fixa:', error);
          throw error;
        }

        return data;
      });

      const results = await Promise.all(promises);
      const createdDespesas = results.filter(result => result !== null);
      
      console.log(`${createdDespesas.length} despesas fixas geradas`);
      return createdDespesas;
    },
    onSuccess: (createdDespesas) => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      toast({
        title: "Sucesso",
        description: `${createdDespesas.length} despesas fixas geradas para o mês selecionado!`
      });
    },
    onError: (error: any) => {
      console.error('Erro ao gerar despesas fixas:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao gerar despesas fixas",
        variant: "destructive"
      });
    }
  });

  const updateDespesa = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Despesa> & { id: string }) => {
      console.log('Atualizando despesa:', id, updates);
      const { data, error } = await supabase
        .from('despesas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar despesa:', error);
        throw error;
      }
      console.log('Despesa atualizada:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
    }
  });

  const deleteDespesa = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deletando despesa:', id);
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar despesa:', error);
        throw error;
      }
      console.log('Despesa deletada com sucesso');
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
    deleteDespesa,
    generateDespesasFixas
  };
};
