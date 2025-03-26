
-- Essa tabela já existe:
-- CREATE TABLE IF NOT EXISTS public.chats (
--   id UUID PRIMARY KEY,
--   title TEXT NOT NULL,
--   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
--   created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
--   updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
--   messages JSONB DEFAULT '[]'::JSONB
-- );

-- Cria a tabela de mensagens para armazenar mensagens individuais:
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY,
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Índice para consultas mais rápidas
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON public.messages(chat_id);

-- Políticas de segurança
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias mensagens
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  USING (
    chat_id IN (
      SELECT id FROM public.chats WHERE user_id = auth.uid()
    )
  );

-- Política para permitir que usuários insiram mensagens em seus próprios chats
CREATE POLICY "Users can insert their own messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    chat_id IN (
      SELECT id FROM public.chats WHERE user_id = auth.uid()
    )
  );

-- Política para permitir que usuários excluam suas próprias mensagens
CREATE POLICY "Users can delete their own messages"
  ON public.messages
  FOR DELETE
  USING (
    chat_id IN (
      SELECT id FROM public.chats WHERE user_id = auth.uid()
    )
  );
