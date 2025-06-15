
-- Corrigir RLS de despesas (auth.uid)
DROP POLICY IF EXISTS "Users can view their own expenses" ON public.despesas;
CREATE POLICY "Users can view their own expenses"
  ON public.despesas
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own expenses" ON public.despesas;
CREATE POLICY "Users can create their own expenses"
  ON public.despesas
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own expenses" ON public.despesas;
CREATE POLICY "Users can update their own expenses"
  ON public.despesas
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own expenses" ON public.despesas;
CREATE POLICY "Users can delete their own expenses"
  ON public.despesas
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Corrigir RLS de categorias se necessário (ajustar auth.uid → select auth.uid())
DROP POLICY IF EXISTS "Users can view their own categories and system categories" ON public.categorias;
CREATE POLICY "Users can view their own categories and system categories" 
  ON public.categorias 
  FOR SELECT 
  USING (((select auth.uid()) = user_id OR user_id IS NULL));

DROP POLICY IF EXISTS "Users can create their own categories" ON public.categorias;
CREATE POLICY "Users can create their own categories" 
  ON public.categorias 
  FOR INSERT 
  WITH CHECK ((select auth.uid()) = user_id AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own categories" ON public.categorias;
CREATE POLICY "Users can update their own categories" 
  ON public.categorias 
  FOR UPDATE 
  USING ((select auth.uid()) = user_id AND user_id IS NOT NULL);

DROP POLICY IF EXISTS "Users can delete their own categories" ON public.categorias;
CREATE POLICY "Users can delete their own categories" 
  ON public.categorias 
  FOR DELETE 
  USING ((select auth.uid()) = user_id AND user_id IS NOT NULL);

-- Corrigir RLS de receitas se necessário (ajustar auth.uid → select auth.uid())
DROP POLICY IF EXISTS "Users can view their own receitas" ON public.receitas;
CREATE POLICY "Users can view their own receitas"
  ON public.receitas
  FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create their own receitas" ON public.receitas;
CREATE POLICY "Users can create their own receitas"
  ON public.receitas
  FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own receitas" ON public.receitas;
CREATE POLICY "Users can update their own receitas"
  ON public.receitas
  FOR UPDATE
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete their own receitas" ON public.receitas;
CREATE POLICY "Users can delete their own receitas"
  ON public.receitas
  FOR DELETE
  USING ((select auth.uid()) = user_id);

-- Criar índices para cobrir fks (se não existirem)
CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON public.despesas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON public.receitas(user_id);

-- (Opcional) Verifique outras tabelas e crie índices nas fks como boa prática
