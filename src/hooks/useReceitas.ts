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
      console.log('useReceitas: === INICIANDO BUSCA DETALHADA ===');
      
      try {
        // Step 1: Verificar conexão básica com Supabase
        console.log('useReceitas: Step 1 - Testando conexão com Supabase...');
        const { data: testData, error: testError } = await supabase
          .from('receitas')
          .select('count(*)', { count: 'exact', head: true });
        
        console.log('useReceitas: Teste de conexão:', { testData, testError });
        
        if (testError) {
          console.error('useReceitas: ERRO no teste de conexão:', testError);
          throw new Error(`Erro de conexão: ${testError.message}`);
        }

        // Step 2: Verificar autenticação
        console.log('useReceitas: Step 2 - Verificando autenticação...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('useReceitas: Dados do usuário:', { 
          userExists: !!user, 
          userId: user?.id, 
          userEmail: user?.email,
          userError: userError?.message 
        });
        
        if (userError) {
          console.error('useReceitas: ERRO de autenticação:', userError);
          throw new Error(`Erro de autenticação: ${userError.message}`);
        }
        
        if (!user) {
          console.error('useReceitas: Usuário não autenticado');
          throw new Error('Usuário não autenticado - faça login novamente');
        }

        // Step 3: Buscar receitas com logs detalhados
        console.log('useReceitas: Step 3 - Buscando receitas...');
        console.log('useReceitas: Query SQL que será executada:', `
          SELECT receitas.*, categorias.nome as categoria_nome, categorias.cor as categoria_cor
          FROM receitas
          LEFT JOIN categorias ON receitas.categoria_id = categorias.id
          WHERE receitas.user_id = '${user.id}'
          ORDER BY receitas.data_recebimento ASC
        `);
        
        const { data, error: queryError, count } = await supabase
          .from('receitas')
          .select(`
            *,
            categoria:categorias(nome, cor)
          `, { count: 'exact' })
          .eq('user_id', user.id)
          .order('data_recebimento', { ascending: true });

        console.log('useReceitas: Resultado da query:', { 
          data: data, 
          dataLength: data?.length || 0,
          count: count,
          error: queryError,
          queryDetails: {
            table: 'receitas',
            userId: user.id,
            hasJoin: true,
            orderBy: 'data_recebimento'
          }
        });

        if (queryError) {
          console.error('useReceitas: ERRO na query principal:', {
            error: queryError,
            code: queryError.code,
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint
          });
          
          // Verificar se é erro de RLS
          if (queryError.code === 'PGRST116' || queryError.message?.includes('RLS') || queryError.message?.includes('policy')) {
            console.error('useReceitas: ERRO DE RLS - Políticas de segurança bloqueando acesso');
            throw new Error('Erro de permissão: As políticas de segurança estão bloqueando o acesso aos dados. Verifique as configurações RLS no Supabase.');
          }
          
          // Verificar se é erro de tabela não encontrada
          if (queryError.code === 'PGRST106' || queryError.message?.includes('relation') || queryError.message?.includes('does not exist')) {
            console.error('useReceitas: ERRO DE TABELA - Tabela receitas não encontrada');
            throw new Error('Erro de estrutura: A tabela de receitas não foi encontrada no banco de dados.');
          }
          
          throw new Error(`Erro ao buscar receitas: ${queryError.message}`);
        }
        
        // Step 4: Verificar se retornou dados
        if (!data) {
          console.warn('useReceitas: Query retornou null/undefined');
          return [];
        }

        if (data.length === 0) {
          console.log('useReceitas: Nenhuma receita encontrada para o usuário');
        } else {
          console.log('useReceitas: Receitas encontradas:', {
            total: data.length,
            primeirasReceitas: data.slice(0, 3).map(r => ({
              id: r.id,
              descricao: r.descricao,
              valor: r.valor,
              categoria: r.categoria?.nome || 'Sem categoria'
            }))
          });
        }
        
        console.log('useReceitas: === BUSCA CONCLUÍDA COM SUCESSO ===');
        return (data as Receita[]) || [];
        
      } catch (err: any) {
        console.error('useReceitas: === ERRO FATAL NA BUSCA ===');
        console.error('useReceitas: Detalhes do erro:', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          cause: err.cause
        });
        throw err;
      }
    },
    retry: (failureCount, error: any) => {
      console.log('useReceitas: Tentativa de retry:', { failureCount, errorMessage: error?.message });
      // Não retry em erros de autenticação ou RLS
      if (error?.message?.includes('autenticação') || error?.message?.includes('RLS') || error?.message?.includes('política')) {
        console.log('useReceitas: Não fazendo retry para erro de autenticação/RLS');
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log('useReceitas: Aguardando retry em:', delay, 'ms');
      return delay;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Log detalhado do estado sempre que houver mudança
  console.log('useReceitas: === ESTADO ATUAL DO HOOK ===', { 
    receitasCount: receitas?.length || 0, 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message,
    timestamp: new Date().toISOString()
  });

  // Log de erro detalhado se houver
  if (error) {
    console.error('useReceitas: === ERRO NO HOOK ===', {
      error: error,
      errorName: error.name,
      errorMessage: error.message,
      errorStack: error.stack
    });
  }

  const createReceita = useMutation({
    mutationFn: async (receita: Omit<Receita, 'id' | 'categoria'>) => {
      console.log('useReceitas: Criando receita:', receita);
      
      try {
        // Obter o usuário autenticado
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
      } catch (err) {
        console.error('useReceitas: Erro na criação:', err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receitas'] });
      toast({
        title: "Sucesso",
        description: "Receita cadastrada com sucesso!"
      });
    },
    onError: (error: any) => {
      console.error('useReceitas: Erro na mutação de receita:', error);
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
      
      try {
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
      } catch (err) {
        console.error('useReceitas: Erro na atualização:', err);
        throw err;
      }
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
      
      try {
        const { error } = await supabase
          .from('receitas')
          .delete()
          .eq('id', id);

        if (error) {
          console.error('useReceitas: Erro ao deletar receita:', error);
          throw new Error(`Erro ao deletar receita: ${error.message}`);
        }
        
        console.log('useReceitas: Receita deletada com sucesso');
      } catch (err) {
        console.error('useReceitas: Erro na deleção:', err);
        throw err;
      }
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
