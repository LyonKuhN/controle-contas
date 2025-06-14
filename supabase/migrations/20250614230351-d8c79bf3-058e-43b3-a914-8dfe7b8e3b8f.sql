
-- Primeiro, vamos remover a constraint de foreign key se ela existir
-- e permitir que categorias padrão tenham user_id como NULL
ALTER TABLE public.categorias ALTER COLUMN user_id DROP NOT NULL;

-- Inserir categorias padrão do sistema (com user_id NULL para indicar que são do sistema)
INSERT INTO public.categorias (id, nome, tipo, cor, user_id) VALUES
-- Categorias de Despesa Padrão
('00000000-0000-0000-0000-000000000001', 'Alimentação', 'despesa', '#ef4444', NULL),
('00000000-0000-0000-0000-000000000002', 'Transporte', 'despesa', '#f97316', NULL),
('00000000-0000-0000-0000-000000000003', 'Moradia', 'despesa', '#eab308', NULL),
('00000000-0000-0000-0000-000000000004', 'Saúde', 'despesa', '#22c55e', NULL),
('00000000-0000-0000-0000-000000000005', 'Educação', 'despesa', '#3b82f6', NULL),
('00000000-0000-0000-0000-000000000006', 'Lazer', 'despesa', '#8b5cf6', NULL),
('00000000-0000-0000-0000-000000000007', 'Roupas', 'despesa', '#ec4899', NULL),
('00000000-0000-0000-0000-000000000008', 'Outros', 'despesa', '#6b7280', NULL),

-- Categorias de Receita Padrão  
('00000000-0000-0000-0000-000000000101', 'Salário', 'receita', '#10b981', NULL),
('00000000-0000-0000-0000-000000000102', 'Freelance', 'receita', '#059669', NULL),
('00000000-0000-0000-0000-000000000103', 'Investimentos', 'receita', '#0d9488', NULL),
('00000000-0000-0000-0000-000000000104', 'Vendas', 'receita', '#0891b2', NULL),
('00000000-0000-0000-0000-000000000105', 'Outros', 'receita', '#6366f1', NULL)

ON CONFLICT (id) DO NOTHING;
