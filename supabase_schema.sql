-- ================================================
-- ASCEND90 — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ================================================

-- PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  start_date date,
  goal_weight numeric(5,1),
  stripe_customer_id text,
  subscription_status text default 'free',
  is_premium boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- WEIGHTS
create table if not exists public.weights (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  val numeric(5,1) not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- WAKEUPS
create table if not exists public.wakeups (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- WORKOUTS
create table if not exists public.workouts (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  dur integer not null,
  type text not null,
  notes text,
  created_at timestamptz default now()
);

-- HABITS
create table if not exists public.habits (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  cat text not null default 'personal',
  created_at timestamptz default now()
);

-- HABIT LOG
create table if not exists public.habit_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id bigint references public.habits(id) on delete cascade not null,
  date date not null,
  created_at timestamptz default now(),
  unique(user_id, habit_id, date)
);

-- GOALS
create table if not exists public.goals (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  cat text not null,
  status text not null default 'not-started',
  notes text,
  created_at timestamptz default now()
);

-- TASKS
create table if not exists public.tasks (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  cat text not null,
  priority text not null default 'medium',
  done boolean default false,
  created_at timestamptz default now()
);

-- JOURNAL
create table if not exists public.journal (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  text text,
  win text,
  energy integer,
  mood integer,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- ================================================
-- ROW LEVEL SECURITY — users only see their own data
-- ================================================
alter table public.profiles enable row level security;
alter table public.weights enable row level security;
alter table public.wakeups enable row level security;
alter table public.workouts enable row level security;
alter table public.habits enable row level security;
alter table public.habit_log enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.journal enable row level security;

-- Profiles policy
create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = id);

-- Generic user-scoped policy for all other tables
do $$
declare t text;
begin
  foreach t in array array['weights','wakeups','workouts','habits','habit_log','goals','tasks','journal']
  loop
    execute format('create policy "Users manage own %s" on public.%s for all using (auth.uid() = user_id)', t, t);
  end loop;
end $$;

-- Add wakeup target time to profiles (run this if you already ran the schema)
alter table public.profiles add column if not exists wakeup_target_time text default '04:00';

-- New tables for v2 features
alter table public.profiles add column if not exists birthday date;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists water_goal integer default 64;
alter table public.profiles add column if not exists wakeup_target_time text default '04:00';

create table if not exists public.progress_photos (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  url text not null,
  path text not null,
  created_at timestamptz default now()
);

create table if not exists public.measurements (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  waist numeric(5,1),
  hips numeric(5,1),
  chest numeric(5,1),
  arms numeric(5,1),
  thighs numeric(5,1),
  neck numeric(5,1),
  created_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists public.water_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  oz integer not null default 0,
  created_at timestamptz default now(),
  unique(user_id, date)
);

create table if not exists public.sleep_log (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date date not null,
  hours numeric(4,1) not null,
  quality integer,
  created_at timestamptz default now(),
  unique(user_id, date)
);

alter table public.progress_photos enable row level security;
alter table public.measurements enable row level security;
alter table public.water_log enable row level security;
alter table public.sleep_log enable row level security;

create policy if not exists "Users manage own progress_photos" on public.progress_photos for all using (auth.uid() = user_id);
create policy if not exists "Users manage own measurements" on public.measurements for all using (auth.uid() = user_id);
create policy if not exists "Users manage own water_log" on public.water_log for all using (auth.uid() = user_id);
create policy if not exists "Users manage own sleep_log" on public.sleep_log for all using (auth.uid() = user_id);
