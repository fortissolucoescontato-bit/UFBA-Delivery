-- 04_performance_indexes.sql
-- OTIMIZAÇÃO: @postgres-best-practices
-- Índices essenciais para chaves estrangeiras (Foreign Keys), cruciais para performance
-- de JOINs e para evitar Sequential Scans nas políticas de Row-Level Security (RLS).
-- Sem esses índices, a consulta de chats e mensagens ficaria progressivamente mais lenta
-- a medida que a plataforma escala.

-- 1. Índices para a tabela de Chats
CREATE INDEX IF NOT EXISTS chats_buyer_id_idx ON public.chats(buyer_id);
CREATE INDEX IF NOT EXISTS chats_seller_id_idx ON public.chats(seller_id);

-- 2. Índices para a tabela de Mensagens
CREATE INDEX IF NOT EXISTS messages_chat_id_idx ON public.messages(chat_id);
CREATE INDEX IF NOT EXISTS messages_sender_id_idx ON public.messages(sender_id);

-- 3. Índices para a tabela de Produtos
CREATE INDEX IF NOT EXISTS products_seller_id_idx ON public.products(seller_id);

-- Nota de Segurança (Security by Design): 
-- Todas as funções com SECURITY DEFINER devem ter o search_path explícito.
-- A função `handle_new_user` no `supa_setup.sql` já implementava
-- 'security definer set search_path = public', seguindo as melhores práticas.
