
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
  is_modelo?: boolean;
  categoria?: {
    nome: string;
    cor: string;
  };
}

export const useDespesas = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query para buscar apenas despesas normais (sem modelos)
  const { data: despesas = [], isLoading, error } = useQuery({
    queryKey: ['despesas'],
    queryFn: async () => {
      console.log('Buscando despesas do banco de dados...');
      const { data, error } = await supabase
        .from('despesas')
        .select(`
          *,
          categoria:categorias(nome, cor)
        `)
        .eq('is_modelo', false) // Filtrar apenas despesas que não são modelos
        .order('data_vencimento', { ascending: true });

      if (error) {
        console.error('Erro ao buscar despesas:', error);
        throw error;
      }
      console.log('Despesas carregadas:', data);
      return data as Despesa[];
    }
  });

  // Query separada para buscar todas as despesas (incluindo modelos) - usado no ControleContas
  const { data: todasDespesas = [] } = useQuery({
    queryKey: ['todas-despesas'],
    queryFn: async () => {
      console.log('Buscando todas as despesas (incluindo modelos)...');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('despesas')
        .select(`
          *,
          categoria:categorias(nome, cor)
        `)
        .eq('user_id', user.id)
        .order('data_vencimento', { ascending: true });

      if (error) {
        console.error('Erro ao buscar todas as despesas:', error);
        throw error;
      }
      console.log('Todas as despesas carregadas (incluindo modelos):', data);
      return data as Despesa[];
    }
  });

  const createDespesa = useMutation({
    mutationFn: async (despesa: Omit<Despesa, 'id' | 'categoria'>) => {
      console.log('Criando despesa:', despesa);
      
      // Obter o usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const despesaData = {
        ...despesa,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('despesas')
        .insert([despesaData])
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
      queryClient.invalidateQueries({ queryKey: ['todas-despesas'] });
      
      // Personalizar mensagem de sucesso baseada no tipo
      if (variables.tipo === 'fixa' && variables.is_modelo) {
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
      
      // Obter o usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Buscar todas as despesas fixas modelo do usuário
      const { data: todasDespesasFixas, error: fetchError } = await supabase
        .from('despesas')
        .select('*')
        .eq('tipo', 'fixa')
        .eq('is_modelo', true)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Erro ao buscar despesas fixas:', fetchError);
        throw fetchError;
      }

      if (!todasDespesasFixas || todasDespesasFixas.length === 0) {
        throw new Error('Nenhuma despesa fixa modelo encontrada');
      }

      console.log('Despesas fixas modelo encontradas:', todasDespesasFixas);

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
        .eq('is_modelo', false)
        .eq('user_id', user.id)
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

      for (const modelo of todasDespesasFixas) {
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
      if (despesasJaExistentes === todasDespesasFixas.length) {
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
            user_id: user.id,
            pago: false,
            is_modelo: false
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
      queryClient.invalidateQueries({ queryKey: ['todas-despesas'] });
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
      queryClient.invalidateQueries({ queryKey: ['todas-despesas'] });
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
      queryClient.invalidateQueries({ queryKey: ['todas-despesas'] });
      toast({
        title: "Sucesso",
        description: "Despesa removida com sucesso!"
      });
    }
  });

  return {
    despesas,
    todasDespesas, // Novo retorno para usar no ControleContas
    isLoading,
    error, // Now exposing error from the query
    createDespesa,
    updateDespesa,
    deleteDespesa,
    generateDespesasFixas
  };
};
