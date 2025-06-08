
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Categoria {
  id: string;
  nome: string;
  tipo: 'despesa' | 'receita';
  cor: string;
}

export const useCategorias = (tipo?: 'despesa' | 'receita') => {
  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias', tipo],
    queryFn: async () => {
      let query = supabase.from('categorias').select('*');
      
      if (tipo) {
        query = query.eq('tipo', tipo);
      }
      
      const { data, error } = await query.order('nome');

      if (error) throw error;
      return data as Categoria[];
    }
  });

  return {
    categorias,
    isLoading
  };
};
