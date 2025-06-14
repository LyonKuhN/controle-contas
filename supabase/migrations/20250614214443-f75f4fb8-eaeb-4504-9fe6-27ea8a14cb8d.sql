
-- Criar tabela para armazenar mensagens de suporte
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar trigger para atualizar updated_at
CREATE TRIGGER update_support_messages_updated_at
  BEFORE UPDATE ON public.support_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Política para administradores visualizarem todas as mensagens
CREATE POLICY "Admin can view all support messages"
  ON public.support_messages
  FOR SELECT
  USING (true);

-- Política para inserção de mensagens (qualquer usuário autenticado ou não)
CREATE POLICY "Anyone can create support messages"
  ON public.support_messages
  FOR INSERT
  WITH CHECK (true);

-- Política para usuários visualizarem suas próprias mensagens
CREATE POLICY "Users can view their own support messages"
  ON public.support_messages
  FOR SELECT
  USING (auth.uid() = user_id OR auth.email() = user_email);
