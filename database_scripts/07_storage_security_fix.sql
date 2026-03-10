-- CORREÇÃO DE VULNERABILIDADE CRÍTICA (OWASP: Broken Access Control / IDOR)
-- As políticas anteriores na tabela storage.objects para o bucket 'profiles'
-- permitiam que qualquer usuário autenticado deletasse ou alterasse arquivos
-- de QUALQUER OUTRO usuário.

DROP POLICY IF EXISTS "Users can update their own profile images." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images." ON storage.objects;

-- Recriamos as políticas exigindo que o owner (ID do usuário que fez o upload) 
-- seja extritamente igual ao usuário que está tentando deletar/atualizar a imagem.
CREATE POLICY "Users can update their own profile images." 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profiles' AND
  (select auth.uid()) = owner
);

CREATE POLICY "Users can delete their own profile images." 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profiles' AND
  (select auth.uid()) = owner
);
