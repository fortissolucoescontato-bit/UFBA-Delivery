-- 1. ADICIONA COLUNA DA CHAVE PIX NO PERFIL DO VENDEDOR
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pix_key TEXT;

-- 2. CRIA A TABELA DE BATE-PAPO (CHATS)
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id) on delete cascade,
    seller_id UUID NOT NULL REFERENCES public.profiles(id) on delete cascade,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    -- Impede de criar múltiplos chats pro mesmo comprador/vendedor (Mantém 1 conversa única por loja)
    CONSTRAINT unique_chat_per_buyer_seller UNIQUE(buyer_id, seller_id)
);

-- ATIVA RLS PARA CHATS
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- POLICY: Participante (Buyer ou Seller) pode VER seus chats
CREATE POLICY "Participantes podem ver seus proprios chats" ON public.chats
    FOR SELECT USING (
        (select auth.uid()) = buyer_id OR (select auth.uid()) = seller_id
    );

-- POLICY: Comprador pode CRIAR um novo chat com o Vendedor
CREATE POLICY "Compradores podem criar chats" ON public.chats
    FOR INSERT WITH CHECK (
        (select auth.uid()) = buyer_id
    );


-- 3. CRIA A TABELA DE MENSAGENS (MESSAGES)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) on delete cascade,
    sender_id UUID NOT NULL REFERENCES public.profiles(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ATIVA RLS PARA MENSAGENS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- POLICY: Usuários só podem acessar mensagens de Chats onde eles são participantes
CREATE POLICY "Participantes podem interagir com as mensagens do proprio chat" ON public.messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.chats c
            WHERE c.id = messages.chat_id
            AND (c.buyer_id = (select auth.uid()) OR c.seller_id = (select auth.uid()))
        )
    );

-- 4. HABILITA REALTIME PARA A TABELA MESSAGES 
-- (Obrigatório para o frontend receber atualizações via WebSockets)
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
