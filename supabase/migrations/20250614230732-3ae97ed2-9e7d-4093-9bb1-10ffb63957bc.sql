
-- Primeiro, vamos verificar se há despesas/receitas usando categorias antigas
-- e atualizar suas referências para as novas categorias padrão correspondentes

-- Atualizar despesas que usam categorias antigas do sistema para usar as novas categorias padrão
UPDATE public.despesas 
SET categoria_id = CASE 
  WHEN (SELECT nome FROM public.categorias WHERE id = despesas.categoria_id) = 'Alimentação' 
    THEN '00000000-0000-0000-0000-000000000001'
  WHEN (SELECT nome FROM public.categorias WHERE id = despesas.categoria_id) = 'Transporte' 
    THEN '00000000-0000-0000-0000-000000000002'
  WHEN (SELECT nome FROM public.categorias WHERE id = despesas.categoria_id) = 'Moradia' 
    THEN '00000000-0000-0000-0000-000000000003'
  WHEN (SELECT nome FROM public.categorias WHERE id = despesas.categoria_id) = 'Saúde' 
    THEN '00000000-0000-0000-0000-000000000004'
  WHEN (SELECT nome FROM public.categorias WHERE id = despesas.categoria_id) = 'Educação' 
    THEN '00000000-0000-0000-0000-000000000005'
  WHEN (SELECT nome FROM public.categorias WHERE id = despesas.categoria_id) = 'Lazer' 
    THEN '00000000-0000-0000-0000-000000000006'
  WHEN (SELECT nome FROM public.categorias WHERE id = despesas.categoria_id) = 'Roupas' 
    THEN '00000000-0000-0000-0000-000000000007'
  WHEN (SELECT nome FROM public.categorias WHERE id = despesas.categoria_id) = 'Outros' 
    THEN '00000000-0000-0000-0000-000000000008'
  ELSE categoria_id
END
WHERE categoria_id IN (
  SELECT id FROM public.categorias 
  WHERE user_id IS NULL 
  AND tipo = 'despesa'
  AND id NOT IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000007',
    '00000000-0000-0000-0000-000000000008'
  )
);

-- Atualizar receitas que usam categorias antigas do sistema para usar as novas categorias padrão
UPDATE public.receitas 
SET categoria_id = CASE 
  WHEN (SELECT nome FROM public.categorias WHERE id = receitas.categoria_id) = 'Salário' 
    THEN '00000000-0000-0000-0000-000000000101'
  WHEN (SELECT nome FROM public.categorias WHERE id = receitas.categoria_id) = 'Freelance' 
    THEN '00000000-0000-0000-0000-000000000102'
  WHEN (SELECT nome FROM public.categorias WHERE id = receitas.categoria_id) = 'Investimentos' 
    THEN '00000000-0000-0000-0000-000000000103'
  WHEN (SELECT nome FROM public.categorias WHERE id = receitas.categoria_id) = 'Vendas' 
    THEN '00000000-0000-0000-0000-000000000104'
  WHEN (SELECT nome FROM public.categorias WHERE id = receitas.categoria_id) = 'Outros' 
    THEN '00000000-0000-0000-0000-000000000105'
  ELSE categoria_id
END
WHERE categoria_id IN (
  SELECT id FROM public.categorias 
  WHERE user_id IS NULL 
  AND tipo = 'receita'
  AND id NOT IN (
    '00000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000104',
    '00000000-0000-0000-0000-000000000105'
  )
);

-- Agora podemos remover as categorias duplicadas antigas com segurança
DELETE FROM public.categorias 
WHERE user_id IS NULL 
AND id NOT IN (
  '00000000-0000-0000-0000-000000000001', -- Alimentação (despesa)
  '00000000-0000-0000-0000-000000000002', -- Transporte (despesa)
  '00000000-0000-0000-0000-000000000003', -- Moradia (despesa)
  '00000000-0000-0000-0000-000000000004', -- Saúde (despesa)
  '00000000-0000-0000-0000-000000000005', -- Educação (despesa)
  '00000000-0000-0000-0000-000000000006', -- Lazer (despesa)
  '00000000-0000-0000-0000-000000000007', -- Roupas (despesa)
  '00000000-0000-0000-0000-000000000008', -- Outros (despesa)
  '00000000-0000-0000-0000-000000000101', -- Salário (receita)
  '00000000-0000-0000-0000-000000000102', -- Freelance (receita)
  '00000000-0000-0000-0000-000000000103', -- Investimentos (receita)
  '00000000-0000-0000-0000-000000000104', -- Vendas (receita)
  '00000000-0000-0000-0000-000000000105'  -- Outros (receita)
);
