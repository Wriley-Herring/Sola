create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.reading_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  duration_days integer not null check (duration_days > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.reading_plan_days (
  id uuid primary key default gen_random_uuid(),
  reading_plan_id uuid not null references public.reading_plans(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  passage_reference text not null,
  passage_text text not null,
  created_at timestamptz not null default now(),
  unique (reading_plan_id, day_number)
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  reading_plan_id uuid not null references public.reading_plans(id) on delete cascade,
  current_day integer not null default 1 check (current_day > 0),
  completed_days integer[] not null default '{}',
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, reading_plan_id)
);

create table if not exists public.passage_insight_cache (
  id uuid primary key default gen_random_uuid(),
  normalized_passage_reference text not null unique,
  historical_context text not null,
  cultural_context text not null,
  literary_context text not null,
  key_themes jsonb not null default '[]'::jsonb,
  reflection_question text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reading_plan_days_plan_day_idx on public.reading_plan_days(reading_plan_id, day_number);
create index if not exists user_progress_user_updated_idx on public.user_progress(user_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_progress_updated_at on public.user_progress;
create trigger set_user_progress_updated_at
before update on public.user_progress
for each row
execute function public.set_updated_at();

drop trigger if exists set_passage_insight_cache_updated_at on public.passage_insight_cache;
create trigger set_passage_insight_cache_updated_at
before update on public.passage_insight_cache
for each row
execute function public.set_updated_at();
