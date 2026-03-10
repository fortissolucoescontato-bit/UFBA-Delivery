-- 1. Create the 'products' bucket
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- 2. Allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'products' );

-- 3. Allow authenticated users (sellers) to upload images
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'products' and (select auth.role()) = 'authenticated' );

-- 4. Allow users to update/delete their own images
create policy "Users can update own images"
  on storage.objects for update
  using ( (select auth.uid()) = owner );

create policy "Users can delete own images"
  on storage.objects for delete
  using ( (select auth.uid()) = owner );
