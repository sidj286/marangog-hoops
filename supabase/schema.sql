-- ==============================================================================
-- MARANGOG HOOPS PWA — DATABASE SCHEMA & REAL-TIME SETUP
-- Barangay Marangog, Bogo City, Cebu Basketball Board
-- Run this in the Supabase SQL Editor: Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  purok text not null, -- User-entered Purok or Sitio (e.g. Purok 3, Sitio Ilaya)
  monicker text,        -- Optional player moniker/nickname (e.g. "Alas", "The Flash")
  created_at timestamptz default now()
);

-- 2. Posts Table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  category text not null check (category in ('Magduwa Hapon', 'Naa Nanulong', 'Need Player', 'Manong sa Court')),
  court_name text not null default 'Marangog Main Court',
  message text not null,
  players_needed int default 0,
  is_concluded boolean default false,
  created_at timestamptz default now()
);

-- 3. Comments Table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  comment_text text not null,
  created_at timestamptz default now()
);

-- 4. Headcounts Table ("Mo-apil Ko" / I'm In)
create table if not exists public.headcounts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Helpful Indexing for Real-Time & 12-Hour Expiration Query Performance
create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_comments_post_id on public.comments (post_id, created_at asc);
create index if not exists idx_headcounts_post_id on public.headcounts (post_id);

-- Enable Row-Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.headcounts enable row level security;

-- ------------------------------------------------------------------------------
-- PROFILES POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Public can view profiles" on public.profiles;
create policy "Public can view profiles" on public.profiles 
  for select using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles 
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles 
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Automatic Profile Creation Trigger on auth.users (Runs as Superuser / SECURITY DEFINER)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, purok)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'display_name',
      'Marangog Baller'
    ),
    coalesce(new.raw_user_meta_data->>'purok', '')
  )
  on conflict (id) do update set
    display_name = coalesce(
      excluded.display_name,
      public.profiles.display_name
    ),
    purok = case when public.profiles.purok is null or public.profiles.purok = '' then excluded.purok else public.profiles.purok end;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- POSTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Public can view posts" on public.posts;
create policy "Public can view posts" on public.posts 
  for select using (true);

drop policy if exists "Only logged-in users with profiles can insert posts" on public.posts;
create policy "Only logged-in users with profiles can insert posts" on public.posts 
  for insert with check (
    auth.uid() = user_id and exists (select 1 from public.profiles where id = auth.uid())
  );

drop policy if exists "Users can update own posts" on public.posts;
create policy "Users can update own posts" on public.posts 
  for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own posts" on public.posts;
create policy "Users can delete own posts" on public.posts 
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- COMMENTS POLICIES
-- ------------------------------------------------------------------------------
drop policy if exists "Public can view comments" on public.comments;
create policy "Public can view comments" on public.comments 
  for select using (true);

drop policy if exists "Only logged-in users with profiles can insert comments" on public.comments;
create policy "Only logged-in users with profiles can insert comments" on public.comments 
  for insert with check (
    auth.uid() = user_id and exists (select 1 from public.profiles where id = auth.uid())
  );

drop policy if exists "Users can delete own comments" on public.comments;
create policy "Users can delete own comments" on public.comments 
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- HEADCOUNTS POLICIES ("Mo-apil Ko")
-- ------------------------------------------------------------------------------
drop policy if exists "Public can view headcounts" on public.headcounts;
create policy "Public can view headcounts" on public.headcounts 
  for select using (true);

drop policy if exists "Only logged-in users with profiles can insert headcounts" on public.headcounts;
create policy "Only logged-in users with profiles can insert headcounts" on public.headcounts 
  for insert with check (
    auth.uid() = user_id and exists (select 1 from public.profiles where id = auth.uid())
  );

drop policy if exists "Users can delete own headcounts" on public.headcounts;
create policy "Users can delete own headcounts" on public.headcounts 
  for delete using (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. ENABLE REALTIME REPLICATION
-- ------------------------------------------------------------------------------
-- Note: Run in Supabase SQL editor to ensure realtime events broadcast
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'comments'
  ) then
    alter publication supabase_realtime add table public.comments;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'headcounts'
  ) then
    alter publication supabase_realtime add table public.headcounts;
  end if;
end $$;

