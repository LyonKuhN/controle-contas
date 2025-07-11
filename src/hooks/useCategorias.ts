
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
      // Primeiro, verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado - retornando array vazio');
        return [];
      }

      console.log('Buscando categorias para usuário:', user.id);
      
      let query = supabase
        .from('categorias')
        .select('*')
        .or(`user_id.eq.${user.id},user_id.is.null`); // Buscar categorias do usuário OU categorias do sistema (user_id = null)
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      
      const { data, error } = await query.order('nome');

      if (error) {
        console.error('Erro ao buscar categorias:', error);
        throw error;
      }
      
      console.log('Categorias carregadas:', data);
      console.log('Filtro aplicado: user_id =', user.id, 'ou user_id = null');
      
      return data as Categoria[];
    }
  });

  const deleteCategoria = useMutation({
    mutationFn: async (id: string) => {
      // Verificar se é uma categoria padrão do sistema (user_id = NULL)
      const { data: categoria } = await supabase
        .from('categorias')
        .select('user_id')
        .eq('id', id)
        .single();

      if (categoria && categoria.user_id === null) {
        throw new Error('Não é possível excluir categorias padrão do sistema');
      }

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
        description: error.message || "Erro ao remover categoria",
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
