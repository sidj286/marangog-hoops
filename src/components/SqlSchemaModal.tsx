import React, { useState } from 'react';
import { X, Copy, Check, Database, Key, RefreshCw } from 'lucide-react';
import { getSupabaseCredentials, saveCustomSupabaseConfig, clearCustomSupabaseConfig } from '../lib/supabase';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_MIGRATION = `-- 1. Profiles Table
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

-- 4. Headcounts Table (Mo-apil Ko)
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
alter publication supabase_realtime add table public.headcounts;`;

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { url, anonKey, isConfigured } = getSupabaseCredentials();

  const [inputUrl, setInputUrl] = useState(url);
  const [inputAnonKey, setInputAnonKey] = useState(anonKey);
  const [showConfig, setShowConfig] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseConfig(inputUrl, inputAnonKey);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white font-court">
                Supabase SQL & Setup Guide
              </h3>
              <p className="text-[11px] text-slate-400">
                Barangay Marangog, Bogo City Basketball Database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status banner */}
        <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-semibold text-slate-200">
              {isConfigured ? 'Supabase Live Connected' : 'Preview Mode (Local Engine Active)'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="text-[11px] text-orange-400 hover:text-orange-300 font-semibold underline"
          >
            {showConfig ? 'Tago-a ang Config' : 'I-configure ang Keys'}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {showConfig && (
            <form onSubmit={handleSaveCredentials} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-orange-400" />
                I-konektar Imong Supabase Project
              </h4>
              <p className="text-[11px] text-slate-400">
                Puyde nimo isulod direkta ang imong Supabase URL ug Anon Key (o ibutang sa <code className="text-orange-400">.env</code>):
              </p>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">VITE_SUPABASE_URL</label>
                <input
                  type="text"
                  placeholder="https://your-project.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">VITE_SUPABASE_ANON_KEY</label>
                <input
                  type="text"
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  value={inputAnonKey}
                  onChange={(e) => setInputAnonKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  I-save & I-konektar
                </button>
                <button
                  type="button"
                  onClick={() => clearCustomSupabaseConfig()}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs border border-slate-800"
                >
                  I-reset sa Demo Mode
                </button>
              </div>
            </form>
          )}

          {/* Quick instructions */}
          <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-1.5 leading-relaxed">
            <span className="font-bold text-orange-400 block text-xs">Instruksyon sa Supabase Setup:</span>
            <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
              <li>Ablihi ang imong Supabase Dashboard & paghimo og bag-ong proyekto.</li>
              <li>Adto sa <strong>Authentication &rarr; Providers &rarr; Email</strong> ug i-OFF ang <em>"Confirm email"</em>.</li>
              <li>Adto sa <strong>SQL Editor</strong>, i-paste ang script sa ubos, ug i-click ang <strong>Run</strong>.</li>
            </ol>
          </div>

          {/* Code Viewer with 1-click copy */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                SQL Migration Script:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Kopyado na!' : 'Kopyaha ang SQL'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto text-slate-300 font-mono text-[11px] leading-relaxed max-h-64">
              {SQL_MIGRATION}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
