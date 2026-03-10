-- OTIMIZAÇÃO O(1): @postgres-best-practices (Multiple Permissive Policies)
-- Ter várias políticas de mesma ação (ex: SELECT) na mesma tabela para a mesma role obriga
-- o Postgres a executar cada cláusula combinando-as com OR, causando vazamento de performance.
-- Refatorando as políticas múltiplas e fragmentadas para uma única unificada e poderosa.

-- 1. Unificando políticas em `chats` (SELECT)
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
DROP POLICY IF EXISTS "Participantes acessam chats" ON public.chats;
DROP POLICY IF EXISTS "Participantes podem ver seus proprios chats" ON public.chats;

CREATE POLICY "Participantes leem seus chats" ON public.chats
FOR SELECT USING (
  (SELECT auth.uid()) = buyer_id OR (SELECT auth.uid()) = seller_id
);


-- 2. Unificando políticas em `orders` (SELECT)
DROP POLICY IF EXISTS "Clientes veem apenas seus pedidos" ON public.orders;
DROP POLICY IF EXISTS "Leitura restrita aos participantes do pedido" ON public.orders;
DROP POLICY IF EXISTS "Sellers can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Vendedores veem pedidos da sua loja" ON public.orders;

CREATE POLICY "Envolvidos leem pedidos" ON public.orders
FOR SELECT USING (
  (SELECT auth.uid()) = buyer_id OR 
  (SELECT auth.uid()) = seller_id OR 
  (SELECT auth.uid()) = customer_id
);


-- 3. Limpando redundância All vs Específico em `messages`
-- Havia uma policy "FOR ALL" ("Participantes podem interagir com as mensagens do proprio chat")
-- chocando e rodando duas vezes com policies individuais.
DROP POLICY IF EXISTS "Participantes acessam mensagens" ON public.messages;
DROP POLICY IF EXISTS "Participantes podem interagir com as mensagens do proprio chat" ON public.messages;

-- Substituindo a FOR ALL por uma explícita estrita de leitura
CREATE POLICY "Leitura de mensagens do chat" ON public.messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.chats c
        WHERE c.id = messages.chat_id
        AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
    )
);


-- 4. Unificando políticas em `products` (SELECT)
-- Havia uma de leitura pública e outra redundante apenas pra vendedores lerem.
DROP POLICY IF EXISTS "Leitura pública de produtos" ON public.products;
DROP POLICY IF EXISTS "Products are viewable by everyone." ON public.products;
DROP POLICY IF EXISTS "Vendedores gerenciam próprios produtos" ON public.products;

CREATE POLICY "Leitura irrestrita dos produtos globais" ON public.products
FOR SELECT USING (true);

-- Mantendo a de UPDATE/INSERT/DELETE para os vendedores (caso deletada com a de cima)
-- Certifique-se que existe policies operacionais para os donos:
DROP POLICY IF EXISTS "Sellers can manage their own products." ON public.products;
CREATE POLICY "Painel de gerencia do vendedor" ON public.products
FOR ALL USING ((SELECT auth.uid()) = seller_id) WITH CHECK ((SELECT auth.uid()) = seller_id);
