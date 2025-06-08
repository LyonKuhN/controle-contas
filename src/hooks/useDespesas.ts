
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
      
      // Buscar todas as despesas fixas
      const { data: todasDespesasFixas, error: fetchError } = await supabase
        .from('despesas')
        .select('*')
        .eq('tipo', 'fixa')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Erro ao buscar despesas fixas:', fetchError);
        throw fetchError;
      }

      if (!todasDespesasFixas || todasDespesasFixas.length === 0) {
        throw new Error('Nenhuma despesa fixa encontrada');
      }

      console.log('Todas as despesas fixas encontradas:', todasDespesasFixas);

      // Identificar despesas modelo (as mais antigas de cada descrição+categoria)
      // Uma despesa modelo é a primeira criada para cada combinação única de descrição+categoria
      const modelosMap = new Map();
      
      todasDespesasFixas.forEach(despesa => {
        const chave = `${despesa.descricao}-${despesa.categoria_id}`;
        const dataCreated = new Date(despesa.created_at);
        
        if (!modelosMap.has(chave) || new Date(modelosMap.get(chave).created_at) > dataCreated) {
          modelosMap.set(chave, despesa);
        }
      });

      const despesasModelo = Array.from(modelosMap.values());
      console.log('Despesas modelo identificadas:', despesasModelo);

      if (despesasModelo.length === 0) {
        throw new Error('Nenhuma despesa fixa modelo disponível para gerar');
      }

      // Verificar se já existem despesas fixas para o mês selecionado
      const ano = targetDate.getFullYear();
      const mes = targetDate.getMonth() + 1;
      const inicioMesStr = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const fimMesStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

      console.log('Verificando despesas existentes entre:', inicioMesStr, 'e', fimMesStr);

      const { data: despesasExistentes, error: checkError } = await supabase
        .from('despesas')
        .select('descricao, categoria_id, data_vencimento')
        .eq('tipo', 'fixa')
        .gte('data_vencimento', inicioMesStr)
        .lte('data_vencimento', fimMesStr);

      if (checkError) {
        console.error('Erro ao verificar despesas existentes:', checkError);
        throw checkError;
      }

      console.log('Despesas fixas existentes no mês:', despesasExistentes);

      // Verificar quais modelos ainda não foram gerados para este mês
      let despesasJaExistentes = 0;
      const despesasParaGerar = [];

      for (const modelo of despesasModelo) {
        const jaExiste = despesasExistentes?.some(existente => 
          existente.descricao === modelo.descricao && 
          existente.categoria_id === modelo.categoria_id
        );

        if (jaExiste) {
          despesasJaExistentes++;
          console.log(`Despesa ${modelo.descricao} já existe para este mês`);
        } else {
          despesasParaGerar.push(modelo);
          console.log(`Despesa ${modelo.descricao} será gerada para este mês`);
        }
      }

      // Se todas as despesas já existem, informar ao usuário
      if (despesasJaExistentes === despesasModelo.length) {
        throw new Error(`As despesas fixas já foram geradas para ${targetDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`);
      }

      // Gerar apenas as despesas que ainda não existem
      const promises = despesasParaGerar.map(async (modelo) => {
        // Extrair o dia da data de vencimento da despesa modelo
        const partesData = modelo.data_vencimento.split('-');
        const diaVencimento = parseInt(partesData[2], 10);
        
        console.log(`Modelo original: ${modelo.data_vencimento}, Dia extraído: ${diaVencimento}`);
        
        // Verificar se o dia existe no mês alvo
        const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
        const diaFinal = Math.min(diaVencimento, ultimoDiaDoMes);
        
        // Formatar a data manualmente para garantir precisão
        const dataVencimentoFormatada = `${ano}-${String(mes).padStart(2, '0')}-${String(diaFinal).padStart(2, '0')}`;

        console.log(`Criando despesa ${modelo.descricao} para ${dataVencimentoFormatada} (dia original: ${diaVencimento}, dia final: ${diaFinal})`);

        const { data, error } = await supabase
          .from('despesas')
          .insert([{
            descricao: modelo.descricao,
            valor: modelo.valor,
            categoria_id: modelo.categoria_id,
            data_vencimento: dataVencimentoFormatada,
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
      console.log(`${results.length} despesas fixas geradas`);
      return results;
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
        title: "Informação",
        description: error.message || "Erro ao gerar despesas fixas",
        variant: error.message?.includes('já foram geradas') ? "default" : "destructive"
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
