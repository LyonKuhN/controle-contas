
-- Habilitar RLS na tabela categorias se ainda não estiver habilitado
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can view their own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categorias;

-- Criar política para que usuários vejam suas próprias categorias E as categorias padrão do sistema
CREATE POLICY "Users can view their own categories and system categories" 
  ON public.categorias 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Criar política para que usuários possam criar apenas suas próprias categorias
CREATE POLICY "Users can create their own categories" 
  ON public.categorias 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Criar política para que usuários possam atualizar apenas suas próprias categorias (não as do sistema)
CREATE POLICY "Users can update their own categories" 
  ON public.categorias 
  FOR UPDATE 
  USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Criar política para que usuários possam deletar apenas suas próprias categorias (não as do sistema)
CREATE POLICY "Users can delete their own categories" 
  ON public.categorias 
  FOR DELETE 
  USING (auth.uid() = user_id AND user_id IS NOT NULL);
