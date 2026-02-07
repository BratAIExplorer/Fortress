-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. STOCKS TABLE (The Core Reference)
create table public.stocks (
  id uuid primary key default uuid_generate_v4(),
  symbol text not null unique, -- e.g. TATASTEEL
  name text not null, -- e.g. Tata Steel Ltd.
  sector text not null, -- e.g. Metals & Mining
  logo_url text, -- URL to company logo
  
  -- Filters (Layer 1 & 2)
  current_price numeric,
  quality_score int,
  market_cap_crores numeric,
  pe_ratio numeric,
  roce_5yr_avg numeric,
  debt_to_equity numeric,
  megatrend text[], -- Array of strings
  
  -- Status
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. THESES TABLE (The "Why" - Educational Layer)
create table public.theses (
  id uuid primary key default uuid_generate_v4(),
  stock_id uuid references public.stocks(id) on delete cascade not null,
  
  one_liner text not null, -- "The lowest cost producer in the world."
  
  -- Structured Analysis
  megatrend text array, -- ["Infra", "China+1"]
  moat_source text, -- "Switching Costs", "Scale", "Brand"
  financial_strength_score int, -- 1-10
  
  -- Long form content (Markdown)
  investment_logic text not null, 
  risks text not null,
  
  -- Metadata
  author_id uuid references auth.users(id), -- If using Supabase Auth
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. COLLECTIONS TABLE (The Lists)
-- This allows a stock to be in "Fortress 30" AND "Momentum" etc.
create table public.collections (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique, -- "Fortress 30", "Velocity", "Moonshot"
  slug text not null unique, -- "fortress-30"
  description text
);

create table public.collection_members (
  collection_id uuid references public.collections(id) on delete cascade,
  stock_id uuid references public.stocks(id) on delete cascade,
  
  -- Weighting for Portfolio Construction
  weight_conservative numeric default 0,
  weight_balanced numeric default 0,
  weight_aggressive numeric default 0,
  
  added_at timestamptz default now(),
  primary key (collection_id, stock_id)
);

-- 4. CHANGELOG TABLE (Transparency Engine)
create table public.changelog (
  id uuid primary key default uuid_generate_v4(),
  stock_id uuid references public.stocks(id) on delete cascade,
  collection_id uuid references public.collections(id),
  
  action_type text not null check (action_type in ('ENTRY', 'EXIT', 'REBALANCE', 'UPDATE')),
  reason text not null, -- "Governance issue detected", "Thesis broken", "Better opportunity"
  
  old_weight numeric,
  new_weight numeric,
  
  occurred_at timestamptz default now()
);

-- RLS POLICIES (Security)
alter table public.stocks enable row level security;
alter table public.theses enable row level security;
alter table public.collections enable row level security;
alter table public.collection_members enable row level security;
alter table public.changelog enable row level security;

-- Public Read Access
create policy "Allow public read access" on public.stocks for select using (true);
create policy "Allow public read access" on public.theses for select using (true);
create policy "Allow public read access" on public.collections for select using (true);
create policy "Allow public read access" on public.collection_members for select using (true);
create policy "Allow public read access" on public.changelog for select using (true);

-- Admin Write Access (Update with specific User ID later)
-- create policy "Allow admin write access" on public.stocks for all using (auth.uid() = 'YOUR_ADMIN_UUID');
