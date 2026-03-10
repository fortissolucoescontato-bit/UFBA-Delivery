-- 1. Add new columns for the Premium Storefront
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_description TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS store_banner_url TEXT;

-- 2. Ensure the storage bucket exists
-- Note: 'avatars' or 'profiles' bucket. Let's use 'profiles' as a generic bucket for both avatar and banner.
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profiles', 'profiles', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Setup Storage Access Policies for the 'profiles' bucket
-- Drop existing ones if you are re-running this
DROP POLICY IF EXISTS "Public profiles images are viewable by everyone." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images." ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images." ON storage.objects;

-- Allow public read access
CREATE POLICY "Public profiles images are viewable by everyone." 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profiles');

-- Allow authenticated users to upload
CREATE POLICY "Users can upload their own profile images." 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profiles' AND
  (select auth.role()) = 'authenticated'
);

-- Allow authenticated users to update
CREATE POLICY "Users can update their own profile images." 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profiles' AND
  (select auth.uid()) = owner
);

-- Allow authenticated users to delete
CREATE POLICY "Users can delete their own profile images." 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profiles' AND
  (select auth.uid()) = owner
);
