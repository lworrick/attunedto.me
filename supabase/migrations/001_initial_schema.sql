-- Attune: body-neutral wellness tracking schema
-- Run this in Supabase SQL editor or via supabase db push

-- Enable UUID extension if not already
create extension if not exists "uuid-ossp";

-- Users are managed by Supabase Auth; we only reference auth.uid()
-- Optional: profiles table if you want to store display name, etc.
-- create table if not exists public.profiles (
--   id uuid primary key references auth.users(id) on delete cascade,
--   email text,
--   created_at timestamptz default now()
-- );

-- Food logs
create table if not exists public.food_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  text text not null,
  meal_tag text,
  calories_min int,
  calories_max int,
  protein_g numeric(6,1),
  carbs_g numeric(6,1),
  fat_g numeric(6,1),
  fiber_g numeric(6,1),
  confidence text,
  supportive_note text,
  created_at timestamptz default now()
);

-- Water logs
create table if not exists public.water_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  ounces numeric(6,1) not null,
  created_at timestamptz default now()
);

-- Craving logs
create table if not exists public.craving_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  craving_text text not null,
  intensity int,
  craving_category text,
  suggestion_text text,
  alternatives_json jsonb,
  created_at timestamptz default now()
);

-- Movement logs
create table if not exists public.movement_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  activity_type text,
  duration_min int,
  intensity text,
  estimated_burn_min int,
  estimated_burn_max int,
  supportive_note text,
  raw_text text,
  created_at timestamptz default now()
);

-- Sleep logs
create table if not exists public.sleep_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  sleep_quality int not null check (sleep_quality between 1 and 5),
  hours_slept numeric(4,1),
  notes text,
  created_at timestamptz default now()
);

-- Stress logs
create table if not exists public.stress_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  timestamp timestamptz not null default now(),
  stress_level int not null check (stress_level between 1 and 5),
  notes text,
  created_at timestamptz default now()
);

-- User preferences (settings)
create table if not exists public.user_preferences (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  dietary_vegetarian boolean default false,
  avoid_weight_language boolean default true,
  units_oz boolean default true,
  updated_at timestamptz default now()
);

-- RLS: enable and policies
alter table public.food_logs enable row level security;
alter table public.water_logs enable row level security;
alter table public.craving_logs enable row level security;
alter table public.movement_logs enable row level security;
alter table public.sleep_logs enable row level security;
alter table public.stress_logs enable row level security;
alter table public.user_preferences enable row level security;

drop policy if exists "Users can CRUD own food_logs" on public.food_logs;
drop policy if exists "Users can CRUD own water_logs" on public.water_logs;
drop policy if exists "Users can CRUD own craving_logs" on public.craving_logs;
drop policy if exists "Users can CRUD own movement_logs" on public.movement_logs;
drop policy if exists "Users can CRUD own sleep_logs" on public.sleep_logs;
drop policy if exists "Users can CRUD own stress_logs" on public.stress_logs;
drop policy if exists "Users can CRUD own user_preferences" on public.user_preferences;

create policy "Select own food_logs" on public.food_logs for select using (auth.uid() = user_id);
create policy "Insert own food_logs" on public.food_logs for insert with check (auth.uid() = user_id);
create policy "Update own food_logs" on public.food_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own food_logs" on public.food_logs for delete using (auth.uid() = user_id);

create policy "Select own water_logs" on public.water_logs for select using (auth.uid() = user_id);
create policy "Insert own water_logs" on public.water_logs for insert with check (auth.uid() = user_id);
create policy "Update own water_logs" on public.water_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own water_logs" on public.water_logs for delete using (auth.uid() = user_id);

create policy "Select own craving_logs" on public.craving_logs for select using (auth.uid() = user_id);
create policy "Insert own craving_logs" on public.craving_logs for insert with check (auth.uid() = user_id);
create policy "Update own craving_logs" on public.craving_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own craving_logs" on public.craving_logs for delete using (auth.uid() = user_id);

create policy "Select own movement_logs" on public.movement_logs for select using (auth.uid() = user_id);
create policy "Insert own movement_logs" on public.movement_logs for insert with check (auth.uid() = user_id);
create policy "Update own movement_logs" on public.movement_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own movement_logs" on public.movement_logs for delete using (auth.uid() = user_id);

create policy "Select own sleep_logs" on public.sleep_logs for select using (auth.uid() = user_id);
create policy "Insert own sleep_logs" on public.sleep_logs for insert with check (auth.uid() = user_id);
create policy "Update own sleep_logs" on public.sleep_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own sleep_logs" on public.sleep_logs for delete using (auth.uid() = user_id);

create policy "Select own stress_logs" on public.stress_logs for select using (auth.uid() = user_id);
create policy "Insert own stress_logs" on public.stress_logs for insert with check (auth.uid() = user_id);
create policy "Update own stress_logs" on public.stress_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own stress_logs" on public.stress_logs for delete using (auth.uid() = user_id);

create policy "Select own user_preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Insert own user_preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Update own user_preferences" on public.user_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Delete own user_preferences" on public.user_preferences for delete using (auth.uid() = user_id);

-- Daily rollups: one row per user per day where they have any log data
create or replace view public.daily_rollups as
with all_dates as (
  select user_id, timestamp::date as date from public.food_logs
  union select user_id, timestamp::date from public.water_logs
  union select user_id, timestamp::date from public.movement_logs
  union select user_id, timestamp::date from public.sleep_logs
  union select user_id, timestamp::date from public.stress_logs
  union select user_id, timestamp::date from public.craving_logs
),
distinct_dates as (
  select distinct user_id, date from all_dates
)
select
  dd.date,
  dd.user_id,
  coalesce((select sum(calories_min) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::int as calories_min_total,
  coalesce((select sum(calories_max) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::int as calories_max_total,
  coalesce((select sum(protein_g) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::numeric(10,1) as protein_total,
  coalesce((select sum(fiber_g) from public.food_logs f where f.user_id = dd.user_id and f.timestamp::date = dd.date), 0)::numeric(10,1) as fiber_total,
  coalesce((select sum(ounces) from public.water_logs w where w.user_id = dd.user_id and w.timestamp::date = dd.date), 0)::numeric(10,1) as water_total,
  coalesce((select sum(duration_min) from public.movement_logs m where m.user_id = dd.user_id and m.timestamp::date = dd.date), 0)::int as movement_min_total,
  coalesce((select sum(estimated_burn_min) from public.movement_logs m where m.user_id = dd.user_id and m.timestamp::date = dd.date), 0)::int as burn_min_total,
  coalesce((select sum(estimated_burn_max) from public.movement_logs m where m.user_id = dd.user_id and m.timestamp::date = dd.date), 0)::int as burn_max_total,
  (select count(*) from public.craving_logs c where c.user_id = dd.user_id and c.timestamp::date = dd.date)::int as cravings_count,
  (select avg(intensity) from public.craving_logs c where c.user_id = dd.user_id and c.timestamp::date = dd.date) as cravings_avg_intensity,
  (select avg(sleep_quality) from public.sleep_logs s where s.user_id = dd.user_id and s.timestamp::date = dd.date) as sleep_quality_avg,
  (select avg(stress_level) from public.stress_logs s where s.user_id = dd.user_id and s.timestamp::date = dd.date) as stress_level_avg
from distinct_dates dd;

-- RLS: View uses underlying tables; filter by user_id = auth.uid() in app.

create index if not exists food_logs_user_time_idx on public.food_logs(user_id, timestamp);
create index if not exists water_logs_user_time_idx on public.water_logs(user_id, timestamp);
create index if not exists craving_logs_user_time_idx on public.craving_logs(user_id, timestamp);
create index if not exists movement_logs_user_time_idx on public.movement_logs(user_id, timestamp);
create index if not exists sleep_logs_user_time_idx on public.sleep_logs(user_id, timestamp);
create index if not exists stress_logs_user_time_idx on public.stress_logs(user_id, timestamp);
