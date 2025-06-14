
-- Adicionar user_id na tabela categorias
ALTER TABLE public.categorias ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Atualizar categorias existentes com um user_id padrão (opcional - pode ser removido se preferir)
-- UPDATE public.categorias SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;

-- Habilitar RLS na tabela categorias
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Criar política para que usuários vejam apenas suas próprias categorias
CREATE POLICY "Users can view their own categories" 
  ON public.categorias 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Criar política para que usuários possam criar suas próprias categorias
CREATE POLICY "Users can create their own categories" 
  ON public.categorias 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar política para que usuários possam atualizar suas próprias categorias
CREATE POLICY "Users can update their own categories" 
  ON public.categorias 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Criar política para que usuários possam deletar suas próprias categorias
CREATE POLICY "Users can delete their own categories" 
  ON public.categorias 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar campo para indicar se uma despesa é modelo
ALTER TABLE public.despesas ADD COLUMN is_modelo BOOLEAN DEFAULT FALSE;
