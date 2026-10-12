# Marangog Hoops PWA 🏀

> **Real-time daily basketball communication board and interactive coordination hub for Barangay Marangog, Bogo City, Cebu.**

Built with **React 19**, **Vite**, **Tailwind CSS v4**, **Supabase Realtime**, and **Progressive Web App (PWA)** capabilities.

---

## 🌟 Overview & Giunsa Pag-gana sa UX

Marangog Hoops PWA serves the basketball community of Barangay Marangog, Bogo City. It provides real-time awareness of active games, incoming dayo/visitors, shortages of players, and court queue rotations.

### User Journey & Access Control:
1. **Bisita (Walay Account / Public Visitors):**
   - Maka-browse sa tibuok feed, makabasa kinsay nanulong, kinsay kulang ug player, ug unsa ang mga tubag sa live comment threads (Read-Only).
2. **Mo-click ug "Tubag / Comment", "Magduwa Ta (+)", o "Mo-apil Ko":**
   - Motungha dayon ang sleek, non-intrusive **Auth Modal**: *"Paghimo'g account o log in aron makatubag, makapost, o maka-apil sa duwa!"*
3. **Zero-Friction Signup:**
   - Email ug Password lamang.
   - Ang Supabase Auth email confirmation gi-disable aron diretso dayon ang session.
4. **Automatic Profile Setup:**
   - Human sa signup, motungha dayon ang **Profile Setup Modal** para ibutang ang ilang **Ngalan** ug **Purok/Sitio** (e.g. *Purok 1, Purok 2, Purok 3, Sitio Ilaya, Riverside*).
5. **Intended Action Restoration:**
   - Inig human og save sa profile, diretso dayon silang ma-redirect balik sa ilang gustong buhaton (auto-submit sa "Mo-apil Ko", auto-abli sa comment box, o create post).

---

## 🏀 Core Features

1. **Real-time Game Feed & 12-Hour Auto-Expiration:**
   - Active posts sorted by `created_at DESC`.
   - **12-Hour Expiration:** Automatic filter para sa mga posts nga sobra na sa 12 ka oras (`created_at >= NOW() - INTERVAL '12 hours'`).
   - 4 ka Kategoriya:
     - 🏀 `Magduwa Hapon` (Pick-up game invite)
     - ⚔️ `Naa Nanulong` (Visitors / dayo arrived)
     - 🙋‍♂️ `Need Player` (Short of players, e.g. "Kulang 1")
     - ⏳ `Manong sa Court` (Current queue / rotation)

2. **Auth-Gated Real-time Comments (Court Chat):**
   - Expandable slide-up drawer (`CommentDrawer.tsx`).
   - Live comment count badge (`💬 3 tubag`).
   - Real-time updates pinaagi sa `supabase.channel('public:comments')`.
   - Nagpakita sa Player Name ug ilang Purok badge (e.g. `Juan Dela Cruz • Purok 3`).

3. **"Mo-apil Ko" (I'm In / Headcount):**
   - 1-tap participation tracker nga naay live headcount tally, avatar roster, ug confetti burst.

4. **Fast Post Creation Drawer (<20 Seconds):**
   - Floating Action Button (+) sa ubos.
   - 1-tap category selection pills, default court selection, ug 140-char live counter.

5. **Self-Governing Community (Zero-Admin):**
   - Bisan kinsang rehistrado nga player makapost freely.
   - Ang author makapili ug "Game Done / Human Na" o mag-delete sa ilang post.
   - Ang mga user makapapas sa ilang kaugalingong comments.

---

## 🛠️ Database Schema & Security Policies (Supabase SQL)

I-run kini nga script sa **Supabase SQL Editor** (`Project -> SQL Editor -> New Query`):

```sql
-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text not null,
  purok text not null, -- User-entered Purok or Sitio
  monicker text,
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

-- 4. Headcounts Table ("Mo-apil Ko")
create table if not exists public.headcounts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- Row-Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.headcounts enable row level security;

-- Profiles Policies
create policy "Public can view profiles" on public.profiles for select using (true);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Posts Policies
create policy "Public can view posts" on public.posts for select using (true);
create policy "Only logged-in users with profiles can insert posts" on public.posts 
  for insert with check (auth.uid() = user_id and exists (select 1 from public.profiles where id = auth.uid()));
create policy "Users can update own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- Comments Policies
create policy "Public can view comments" on public.comments for select using (true);
create policy "Only logged-in users with profiles can insert comments" on public.comments 
  for insert with check (auth.uid() = user_id and exists (select 1 from public.profiles where id = auth.uid()));
create policy "Users can delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- Headcounts Policies
create policy "Public can view headcounts" on public.headcounts for select using (true);
create policy "Only logged-in users with profiles can insert headcounts" on public.headcounts 
  for insert with check (auth.uid() = user_id and exists (select 1 from public.profiles where id = auth.uid()));
create policy "Users can delete own headcounts" on public.headcounts for delete using (auth.uid() = user_id);

-- 5. Enable Realtime Replication
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.headcounts;
```

---

## 🚀 Setup & Local Development

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Kopyaha ang `.env.example` ngadto sa `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Hinumdomi:** Kung wala pay Supabase credentials, ang app mo-operate automatic sa **Local Preview Mode** gamit ang authentic mock community data para sa Barangay Marangog, aron ma-test dayon nimo ang tibuok user flow!

### 3. Start Development Server
```bash
npm run dev
```

### 4. Build Production Bundle & PWA
```bash
npm run build
```

---

## 📱 PWA Features & Vercel Deployment

- **Standalone Mode:** Naay full PWA Web App Manifest (`/manifest.webmanifest`), 192x192 ug 512x512 icons, theme color `#ea580c`.
- **Offline Caching:** Powered by `vite-plugin-pwa` with Workbox service worker caching assets and pages.
- **Vercel Deploy:** Naa nay `vercel.json` nga naay Single Page Application (SPA) rewrite rules para seamless client-side navigation.
