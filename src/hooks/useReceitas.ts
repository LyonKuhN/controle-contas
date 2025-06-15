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
      console.log('🔍 === INÍCIO DA BUSCA RECEITAS ===');
      console.log('🔍 URL Supabase:', 'https://ncjcsfnvyungxfmqszpz.supabase.co');
      
      try {
        // Log da tentativa de autenticação
        console.log('🔍 Step 1: Verificando autenticação...');
        const authStart = performance.now();
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        const authEnd = performance.now();
        console.log(`🔍 Step 1 completo em ${authEnd - authStart}ms`);
        
        if (userError) {
          console.error('❌ Erro de autenticação:', {
            message: userError.message,
            status: userError.status,
            details: userError
          });
          throw new Error(`Erro de autenticação: ${userError.message}`);
        }
        
        if (!user) {
          console.error('❌ Usuário não autenticado - user é null');
          throw new Error('Usuário não autenticado');
        }

        console.log('✅ Usuário autenticado:', {
          id: user.id,
          email: user.email,
          aud: user.aud,
          role: user.role
        });

        // Log da query ao banco
        console.log('🔍 Step 2: Executando query no Supabase...');
        console.log('🔍 Query SQL: SELECT id, descricao, valor, categoria_id, data_recebimento, recebido, observacoes, categoria:categorias(nome, cor) FROM receitas WHERE user_id = ?');
        console.log('🔍 Parâmetros: user_id =', user.id);
        
        const queryStart = performance.now();
        
        const { data, error: queryError, status, statusText } = await supabase
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

        const queryEnd = performance.now();
        console.log(`🔍 Step 2 completo em ${queryEnd - queryStart}ms`);

        // Log detalhado da resposta
        console.log('📊 Resposta da API:', {
          status,
          statusText,
          data,
          dataType: typeof data,
          dataLength: data?.length,
          error: queryError,
          rawResponse: { data, error: queryError }
        });

        if (queryError) {
          console.error('❌ Erro na query:', {
            message: queryError.message,
            details: queryError.details,
            hint: queryError.hint,
            code: queryError.code
          });
          throw new Error(`Erro ao buscar receitas: ${queryError.message}`);
        }
        
        const result = (data as Receita[]) || [];
        
        console.log('✅ Query executada com sucesso:', {
          totalReceitas: result.length,
          primeiraReceita: result[0] || 'Nenhuma receita encontrada',
          ultimaReceita: result[result.length - 1] || 'Nenhuma receita encontrada'
        });
        
        console.log('🔍 === FIM DA BUSCA RECEITAS ===');
        return result;
        
      } catch (err: any) {
        console.error('💥 === ERRO FATAL NA BUSCA ===', {
          name: err.name,
          message: err.message,
          stack: err.stack,
          cause: err.cause
        });
        throw err;
      }
    },
    retry: (failureCount, error) => {
      console.log(`🔄 Tentativa ${failureCount + 1} falhou:`, error.message);
      return failureCount < 2; // Máximo 3 tentativas
    },
    retryDelay: (attemptIndex) => {
      const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
      console.log(`⏰ Aguardando ${delay}ms antes da próxima tentativa...`);
      return delay;
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  console.log('📈 Estado atual do hook:', { 
    receitasCount: receitas?.length || 0, 
    isLoading, 
    hasError: !!error,
    errorMessage: error?.message,
    errorDetails: error
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
