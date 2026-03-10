-- OTIMIZAÇÃO: @postgres-best-practices (auth_rls_initplan & security)
-- Substituição do auth.uid() e auth.role() por (select auth.uid()) 
-- Isso força o Postgres Planner a tratar a função Auth como uma constante (InitPlan O(1))
-- em vez de avaliá-la repetidamente linha por linha (O(N²)) e causar scans absurdamente pesados.

-- 1. Profiles
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK ((SELECT auth.uid()) = id);

-- 2. Reviews
DROP POLICY IF EXISTS "Apenas compradores reais podem avaliar" ON public.reviews;
CREATE POLICY "Apenas compradores reais podem avaliar" ON public.reviews FOR INSERT WITH CHECK (((SELECT auth.uid()) = student_id) AND (EXISTS ( SELECT 1 FROM orders WHERE ((orders.buyer_id = (SELECT auth.uid())) AND (orders.seller_id = reviews.seller_id) AND (orders.status = 'completed'::text)))));

DROP POLICY IF EXISTS "Estudantes atualizam proprias reviews" ON public.reviews;
CREATE POLICY "Estudantes atualizam proprias reviews" ON public.reviews FOR UPDATE USING ((SELECT auth.uid()) = student_id) WITH CHECK (((SELECT auth.uid()) = student_id) AND (is_verified_purchase = false));

DROP POLICY IF EXISTS "Estudantes deletam proprias reviews" ON public.reviews;
CREATE POLICY "Estudantes deletam proprias reviews" ON public.reviews FOR DELETE USING ((SELECT auth.uid()) = student_id);

-- 3. Page Views
DROP POLICY IF EXISTS "Vendedores veem apenas suas métricas" ON public.page_views;
CREATE POLICY "Vendedores veem apenas suas métricas" ON public.page_views FOR SELECT USING ((SELECT auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Registro de visualização restrito" ON public.page_views;
CREATE POLICY "Registro de visualização restrito" ON public.page_views FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated'::text);

-- 4. Orders
DROP POLICY IF EXISTS "Sellers can view their own orders" ON public.orders;
CREATE POLICY "Sellers can view their own orders" ON public.orders FOR SELECT USING ((SELECT auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Leitura restrita aos participantes do pedido" ON public.orders;
CREATE POLICY "Leitura restrita aos participantes do pedido" ON public.orders FOR SELECT USING (((SELECT auth.uid()) = buyer_id) OR ((SELECT auth.uid()) = seller_id));

DROP POLICY IF EXISTS "Comprador lanca novo pedido" ON public.orders;
CREATE POLICY "Comprador lanca novo pedido" ON public.orders FOR INSERT WITH CHECK ((SELECT auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Apenas vendedor atualiza o andamento do pedido" ON public.orders;
CREATE POLICY "Apenas vendedor atualiza o andamento do pedido" ON public.orders FOR UPDATE USING ((SELECT auth.uid()) = seller_id) WITH CHECK ((SELECT auth.uid()) = seller_id);

DROP POLICY IF EXISTS "Clientes veem apenas seus pedidos" ON public.orders;
CREATE POLICY "Clientes veem apenas seus pedidos" ON public.orders FOR SELECT USING ((SELECT auth.uid()) = customer_id);

DROP POLICY IF EXISTS "Vendedores veem pedidos da sua loja" ON public.orders;
CREATE POLICY "Vendedores veem pedidos da sua loja" ON public.orders FOR SELECT USING ((SELECT auth.uid()) = seller_id);

-- 5. User Achievements
DROP POLICY IF EXISTS "user_achievements_own_read" ON public.user_achievements;
CREATE POLICY "user_achievements_own_read" ON public.user_achievements FOR SELECT USING ((SELECT auth.uid()) = user_id);

-- 6. Messages
DROP POLICY IF EXISTS "Apenas autor manipula suas mensagens" ON public.messages;
CREATE POLICY "Apenas autor manipula suas mensagens" ON public.messages FOR UPDATE USING (sender_id = (SELECT auth.uid())) WITH CHECK (sender_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Apenas autor deleta suas mensagens" ON public.messages;
CREATE POLICY "Apenas autor deleta suas mensagens" ON public.messages FOR DELETE USING (sender_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Participantes escrevem apenas nos próprios chats" ON public.messages;
CREATE POLICY "Participantes escrevem apenas nos próprios chats" ON public.messages FOR INSERT WITH CHECK (((SELECT auth.uid()) = sender_id) AND (EXISTS ( SELECT 1 FROM chats WHERE ((chats.id = messages.chat_id) AND ((chats.buyer_id = (SELECT auth.uid())) OR (chats.seller_id = (SELECT auth.uid())))))));

DROP POLICY IF EXISTS "Participantes podem interagir com as mensagens do proprio chat" ON public.messages;
CREATE POLICY "Participantes podem interagir com as mensagens do proprio chat" ON public.messages FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.chats c
            WHERE c.id = messages.chat_id
            AND (c.buyer_id = (SELECT auth.uid()) OR c.seller_id = (SELECT auth.uid()))
        )
    );

-- 7. Profile MP Credentials
DROP POLICY IF EXISTS "Owner manages own MP credentials" ON public.profile_mp_credentials;
CREATE POLICY "Owner manages own MP credentials" ON public.profile_mp_credentials FOR ALL USING (profile_id = (SELECT auth.uid())) WITH CHECK (profile_id = (SELECT auth.uid()));

-- 8. Chats
DROP POLICY IF EXISTS "Users can view own chats" ON public.chats;
CREATE POLICY "Users can view own chats" ON public.chats FOR SELECT USING (((SELECT auth.uid()) = buyer_id) OR ((SELECT auth.uid()) = seller_id));

DROP POLICY IF EXISTS "Compradores podem criar chats" ON public.chats;
CREATE POLICY "Compradores podem criar chats" ON public.chats FOR INSERT WITH CHECK (((SELECT auth.role()) = 'authenticated'::text) AND ((SELECT auth.uid()) = buyer_id));

DROP POLICY IF EXISTS "Participantes podem ver seus proprios chats" ON public.chats;
CREATE POLICY "Participantes podem ver seus proprios chats" ON public.chats FOR SELECT USING ((SELECT auth.uid()) = buyer_id OR (SELECT auth.uid()) = seller_id);

-- 9. Admin Actions
DROP POLICY IF EXISTS "Admins can view all actions" ON public.admin_actions;
CREATE POLICY "Admins can view all actions" ON public.admin_actions FOR SELECT USING (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = (SELECT auth.uid())) AND (profiles.role = 'admin'::app_role))));

-- 10. Clean Duplicated Index from advisor warnings
DROP INDEX IF EXISTS public.idx_chats_seller_id;
