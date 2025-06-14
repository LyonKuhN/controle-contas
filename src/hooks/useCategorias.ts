
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'despesa' | 'receita';
  cor: string;
  user_id?: string;
}

export const useCategorias = (tipo?: 'despesa' | 'receita') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias', tipo],
    queryFn: async () => {
      // Primeiro verifica se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      let query = supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id); // Filtra apenas categorias do usuário atual
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      
      const { data, error } = await query.order('nome');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }
      
      console.log('Categorias carregadas para o usuário:', user.id, data);
      return data as Categoria[];
    }
  });

  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!"
      });
    },
    onError: (error) => {
      console.error('Erro ao deletar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover categoria",
        variant: "destructive"
      });
    }
  });

  return {
    categorias,
    isLoading,
    deleteCategoria
  };
};
