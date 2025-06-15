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
      console.log('useDespesas: === INICIANDO BUSCA DETALHADA ===');
      
      try {
        // Step 1: Verificar conexão básica
        console.log('useDespesas: Step 1 - Testando conexão...');
        const { data: testData, error: testError } = await supabase
          .from('despesas')
          .select('count(*)', { count: 'exact', head: true });
        
        console.log('useDespesas: Teste de conexão:', { testData, testError });
        
        if (testError) {
          console.error('useDespesas: ERRO no teste de conexão:', testError);
          throw new Error(`Erro de conexão: ${testError.message}`);
        }

        // Step 2: Verificar autenticação
        console.log('useDespesas: Step 2 - Verificando autenticação...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('useDespesas: Dados do usuário:', { 
          userExists: !!user, 
          userId: user?.id, 
          userEmail: user?.email,
          userError: userError?.message 
        });
        
        if (userError) {
          console.error('useDespesas: ERRO de autenticação:', userError);
          throw new Error(`Erro de autenticação: ${userError.message}`);
        }
        
        if (!user) {
          console.error('useDespesas: Usuário não autenticado');
          throw new Error('Usuário não autenticado - faça login novamente');
        }

        // Step 3: Buscar despesas
        console.log('useDespesas: Step 3 - Buscando despesas...');
        const { data, error: queryError, count } = await supabase
          .from('despesas')
          .select(`
            *,
            categoria:categorias(nome, cor)
          `, { count: 'exact' })
          .eq('user_id', user.id)
          .eq('is_modelo', false)
          .order('data_vencimento', { ascending: true });

        console.log('useDespesas: Resultado da query:', { 
          data: data, 
          dataLength: data?.length || 0,
          count: count,
          error: queryError,
          queryDetails: {
            table: 'despesas',
            userId: user.id,
            isModelo: false,
            orderBy: 'data_vencimento'
          }
        });

        if (queryError) {
          console.error('useDespesas: ERRO na query:', {
            error: queryError,
            code: queryError.code,
            message: queryError.message,
            details: queryError.details
          });
          
          if (queryError.code === 'PGRST116' || queryError.message?.includes('RLS') || queryError.message?.includes('policy')) {
            throw new Error('Erro de permissão: As políticas de segurança estão bloqueando o acesso aos dados.');
          }
          
          throw new Error(`Erro ao buscar despesas: ${queryError.message}`);
        }
        
        if (!data) {
          console.warn('useDespesas: Query retornou null/undefined');
          return [];
        }

        console.log('useDespesas: === BUSCA CONCLUÍDA ===', { total: data.length });
        return data as Despesa[];
        
      } catch (err: any) {
        console.error('useDespesas: === ERRO FATAL ===', err);
        throw err;
      }
    },
    retry: (failureCount, error: any) => {
      console.log('useDespesas: Tentativa de retry:', { failureCount, errorMessage: error?.message });
      if (error?.message?.includes('autenticação') || error?.message?.includes('permissão')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  console.log('useDespesas: === ESTADO ATUAL ===', { 
    despesasCount: despesas?.length || 0, 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message,
    timestamp: new Date().toISOString()
  });

  // Query separada para buscar todas as despesas (incluindo modelos) - usado no ControleContas
  const { data: todasDespesas = [] } = useQuery({
    queryKey: ['todas-despesas'],
    queryFn: async () => {
      console.log('useDespesas: Buscando todas as despesas (incluindo modelos)...');
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
        console.error('useDespesas: Erro ao buscar todas as despesas:', error);
        throw error;
      }
      console.log('useDespesas: Todas as despesas carregadas (incluindo modelos):', data);
      return data as Despesa[];
    }
  });

  const createDespesa = useMutation({
    mutationFn: async (despesa: Omit<Despesa, 'id' | 'categoria'>) => {
      console.log('useDespesas: Criando despesa:', despesa);
      
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
        console.error('useDespesas: Erro ao criar despesa:', error);
        throw error;
      }
      console.log('useDespesas: Despesa criada:', data);
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
      console.error('useDespesas: Erro na mutação de despesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao cadastrar despesa",
        variant: "destructive"
      });
    }
  });

  const generateDespesasFixas = useMutation({
    mutationFn: async (targetDate: Date) => {
      console.log('useDespesas: Gerando despesas fixas para:', targetDate.toLocaleDateString('pt-BR'));
      
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
        console.error('useDespesas: Erro ao buscar despesas fixas:', fetchError);
        throw fetchError;
      }

      if (!todasDespesasFixas || todasDespesasFixas.length === 0) {
        throw new Error('Nenhuma despesa fixa modelo encontrada');
      }

      console.log('useDespesas: Despesas fixas modelo encontradas:', todasDespesasFixas);

      // Verificar se já existem despesas fixas para o mês selecionado
      const ano = targetDate.getFullYear();
      const mes = targetDate.getMonth() + 1;
      const inicioMesStr = `${ano}-${String(mes).padStart(2, '0')}-01`;
      const ultimoDia = new Date(ano, mes, 0).getDate();
      const fimMesStr = `${ano}-${String(mes).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`;

      console.log('useDespesas: Verificando despesas existentes entre:', inicioMesStr, 'e', fimMesStr);

      const { data: despesasExistentes, error: checkError } = await supabase
        .from('despesas')
        .select('descricao, categoria_id, data_vencimento')
        .eq('tipo', 'fixa')
        .eq('is_modelo', false)
        .eq('user_id', user.id)
        .gte('data_vencimento', inicioMesStr)
        .lte('data_vencimento', fimMesStr);

      if (checkError) {
        console.error('useDespesas: Erro ao verificar despesas existentes:', checkError);
        throw checkError;
      }

      console.log('useDespesas: Despesas fixas existentes no mês:', despesasExistentes);

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
          console.log(`useDespesas: Despesa ${modelo.descricao} já existe para este mês`);
        } else {
          despesasParaGerar.push(modelo);
          console.log(`useDespesas: Despesa ${modelo.descricao} será gerada para este mês`);
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
        
        console.log(`useDespesas: Modelo original: ${modelo.data_vencimento}, Dia extraído: ${diaVencimento}`);
        
        // Verificar se o dia existe no mês alvo
        const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
        const diaFinal = Math.min(diaVencimento, ultimoDiaDoMes);
        
        // Formatar a data manualmente para garantir precisão
        const dataVencimentoFormatada = `${ano}-${String(mes).padStart(2, '0')}-${String(diaFinal).padStart(2, '0')}`;

        console.log(`useDespesas: Criando despesa ${modelo.descricao} para ${dataVencimentoFormatada} (dia original: ${diaVencimento}, dia final: ${diaFinal})`);

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
          console.error('useDespesas: Erro ao criar despesa fixa:', error);
          throw error;
        }

        return data;
      });

      const results = await Promise.all(promises);
      console.log(`useDespesas: ${results.length} despesas fixas geradas`);
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
      console.error('useDespesas: Erro ao gerar despesas fixas:', error);
      toast({
        title: "Informação",
        description: error.message || "Erro ao gerar despesas fixas",
        variant: error.message?.includes('já foram geradas') ? "default" : "destructive"
      });
    }
  });

  const updateDespesa = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Despesa> & { id: string }) => {
      console.log('useDespesas: Atualizando despesa:', id, updates);
      const { data, error } = await supabase
        .from('despesas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('useDespesas: Erro ao atualizar despesa:', error);
        throw error;
      }
      console.log('useDespesas: Despesa atualizada:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['despesas'] });
      queryClient.invalidateQueries({ queryKey: ['todas-despesas'] });
    }
  });

  const deleteDespesa = useMutation({
    mutationFn: async (id: string) => {
      console.log('useDespesas: Deletando despesa:', id);
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useDespesas: Erro ao deletar despesa:', error);
        throw error;
      }
      console.log('useDespesas: Despesa deletada com sucesso');
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
