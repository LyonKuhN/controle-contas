-- Script SQL para recriar a base de dados no phpMyAdmin/MySQL
-- Criado a partir do esquema Supabase

-- Criar base de dados
CREATE DATABASE IF NOT EXISTS sistema_financeiro;
USE sistema_financeiro;

-- Tabela: categorias
CREATE TABLE categorias (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    cor VARCHAR(7) DEFAULT '#8b5cf6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(36) NULL
);

-- Inserir categorias padrão do sistema
INSERT INTO categorias (id, nome, tipo, cor, user_id) VALUES
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
('00000000-0000-0000-0000-000000000105', 'Outros', 'receita', '#6366f1', NULL);

-- Tabela: profiles (perfis de usuários)
CREATE TABLE profiles (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL UNIQUE,
    display_name VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela: despesas
CREATE TABLE despesas (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    categoria_id VARCHAR(36) NULL,
    data_vencimento DATE NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento DATE NULL,
    observacoes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    tipo VARCHAR(50) DEFAULT 'variavel',
    numero_parcelas INT NULL,
    valor_total DECIMAL(15,2) NULL,
    parcela_atual INT DEFAULT 1,
    is_modelo BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (user_id) REFERENCES profiles(user_id)
);

-- Tabela: receitas
CREATE TABLE receitas (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    categoria_id VARCHAR(36) NULL,
    data_recebimento DATE NOT NULL,
    recebido BOOLEAN DEFAULT FALSE,
    observacoes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    FOREIGN KEY (user_id) REFERENCES profiles(user_id)
);

-- Tabela: contas_pagar
CREATE TABLE contas_pagar (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    pago BOOLEAN DEFAULT FALSE,
    data_pagamento DATE NULL,
    tipo VARCHAR(50) DEFAULT 'conta',
    observacoes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES profiles(user_id)
);

-- Tabela: subscribers (assinantes/pagamentos)
CREATE TABLE subscribers (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    stripe_customer_id VARCHAR(255) NULL,
    subscribed BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_tier VARCHAR(100) NULL,
    subscription_end TIMESTAMP NULL,
    display_name VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: support_messages (mensagens de suporte)
CREATE TABLE support_messages (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    user_id VARCHAR(36) NULL,
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255) NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_despesas_user_id ON despesas(user_id);
CREATE INDEX idx_despesas_categoria_id ON despesas(categoria_id);
CREATE INDEX idx_despesas_data_vencimento ON despesas(data_vencimento);
CREATE INDEX idx_receitas_user_id ON receitas(user_id);
CREATE INDEX idx_receitas_categoria_id ON receitas(categoria_id);
CREATE INDEX idx_receitas_data_recebimento ON receitas(data_recebimento);
CREATE INDEX idx_contas_pagar_user_id ON contas_pagar(user_id);
CREATE INDEX idx_contas_pagar_data_vencimento ON contas_pagar(data_vencimento);
CREATE INDEX idx_categorias_user_id ON categorias(user_id);
CREATE INDEX idx_categorias_tipo ON categorias(tipo);

-- Observações importantes:
-- 1. No MySQL não há suporte nativo para UUID como no PostgreSQL, então usamos VARCHAR(36)
-- 2. As políticas RLS (Row Level Security) não existem no MySQL, você precisará implementar 
--    a segurança a nível de aplicação
-- 3. Os campos TIMESTAMP são equivalentes aos timestamp with time zone do PostgreSQL
-- 4. As categorias padrão do sistema têm user_id = NULL
-- 5. Para replicar a funcionalidade do Supabase Auth, você precisará criar sua própria 
--    tabela de usuários ou usar um sistema de autenticação externo