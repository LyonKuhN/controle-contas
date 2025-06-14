
-- Primeiro, vamos verificar as políticas atuais e recriá-las corretamente
-- Remover todas as políticas existentes da tabela categorias
DROP POLICY IF EXISTS "Users can view their own categories and system categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can update their own categories" ON public.categorias;
DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categorias;

-- Remover todas as políticas existentes da tabela despesas
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.despesas;
DROP POLICY IF EXISTS "Users can create their own expenses" ON public.despesas;
DROP POLICY IF EXISTS "Users can update their own expenses" ON public.despesas;
DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.despesas;

-- Habilitar RLS nas tabelas se ainda não estiver habilitado
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

-- Criar políticas para categorias
CREATE POLICY "Users can view their own categories and system categories" 
  ON public.categorias 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own categories" 
  ON public.categorias 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Users can update their own categories" 
  ON public.categorias 
  FOR UPDATE 
  USING (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Users can delete their own categories" 
  ON public.categorias 
  FOR DELETE 
  USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Criar políticas para despesas
CREATE POLICY "Users can view their own expenses" 
  ON public.despesas 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" 
  ON public.despesas 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
  ON public.despesas 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
  ON public.despesas 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Verificar se existem despesas sem user_id correto e corrigi-las
-- (isso só deve ser executado se você souber que há dados problemáticos)
-- UPDATE public.despesas SET user_id = (SELECT id FROM auth.users LIMIT 1) WHERE user_id IS NULL;
