-- 1. Create Enum for Roles
create type public.app_role as enum ('buyer', 'seller', 'admin');

-- 2. Create Profiles Table (Public information for users)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  full_name text,
  role public.app_role default 'buyer'::public.app_role,
  whatsapp text,
  avatar_url text,
  is_online boolean default true,
  current_location text,
  created_at timestamptz default now(),
  
  primary key (id),
  constraint username_length check (char_length(full_name) >= 3)
);

-- 3. Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 4. Create Policies for Profiles
-- Public can view profiles (to see seller info)
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Users can insert their own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- Users can update own profile
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 5. Trigger to create profile on signup (Optional but recommended)
-- This ensures every auth user has a corresponding profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id, 
    new.raw_user_meta_data ->> 'full_name', 
    case 
      when (new.raw_user_meta_data ->> 'role') = 'seller' then 'seller'::public.app_role 
      else 'buyer'::public.app_role 
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Setup Products Table (Example for future)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) not null,
  name text not null,
  price numeric not null,
  image text,
  is_boosted boolean default false,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

create policy "Products are viewable by everyone."
  on products for select
  using ( true );

create policy "Sellers can manage their own products."
  on products for all
  using ( auth.uid() = seller_id );
