create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reading_plans (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  duration integer not null check (duration > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.reading_plan_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.reading_plans(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  passage_reference text not null,
  normalized_ref text not null,
  passage_text text not null,
  created_at timestamptz not null default now(),
  unique (plan_id, day_number)
);

create table if not exists public.user_plan_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references public.reading_plans(id) on delete cascade,
  current_day integer not null default 1 check (current_day > 0),
  completed boolean not null default false,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_id)
);

create table if not exists public.user_progress_days (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.user_plan_enrollments(id) on delete cascade,
  day_number integer not null check (day_number > 0),
  completed_at timestamptz not null default now(),
  unique (enrollment_id, day_number)
);

create table if not exists public.passage_insight_cache (
  id uuid primary key default gen_random_uuid(),
  normalized_reference text not null unique,
  historical_context text not null,
  cultural_context text not null,
  literary_context text not null,
  key_themes jsonb not null default '[]'::jsonb,
  reflection_question text not null,
  model text not null,
  prompt_version text not null,
  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);


create index if not exists reading_plan_days_plan_day_idx on public.reading_plan_days(plan_id, day_number);
create index if not exists reading_plan_days_normalized_ref_idx on public.reading_plan_days(normalized_ref);
create index if not exists user_plan_enrollments_user_updated_idx on public.user_plan_enrollments(user_id, updated_at desc);
create index if not exists user_progress_days_enrollment_idx on public.user_progress_days(enrollment_id, day_number);
create index if not exists passage_insight_cache_generated_at_idx on public.passage_insight_cache(generated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at before update on public.users for each row execute function public.set_updated_at();

drop trigger if exists set_user_plan_enrollments_updated_at on public.user_plan_enrollments;
create trigger set_user_plan_enrollments_updated_at before update on public.user_plan_enrollments for each row execute function public.set_updated_at();

drop trigger if exists set_passage_insight_cache_updated_at on public.passage_insight_cache;
create trigger set_passage_insight_cache_updated_at before update on public.passage_insight_cache for each row execute function public.set_updated_at();

alter table public.users enable row level security;
alter table public.reading_plans enable row level security;
alter table public.reading_plan_days enable row level security;
alter table public.user_plan_enrollments enable row level security;
alter table public.user_progress_days enable row level security;
alter table public.passage_insight_cache enable row level security;

grant select on public.reading_plans, public.reading_plan_days, public.passage_insight_cache to anon, authenticated;
grant select, insert, update on public.users to authenticated;
grant select, insert, update, delete on public.user_plan_enrollments, public.user_progress_days to authenticated;

drop policy if exists "public read reading_plans" on public.reading_plans;
create policy "public read reading_plans" on public.reading_plans for select using (true);

drop policy if exists "public read reading_plan_days" on public.reading_plan_days;
create policy "public read reading_plan_days" on public.reading_plan_days for select using (true);

drop policy if exists "public read passage_insight_cache" on public.passage_insight_cache;
create policy "public read passage_insight_cache" on public.passage_insight_cache for select using (true);

drop policy if exists "users can read own profile" on public.users;
create policy "users can read own profile" on public.users for select using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.users;
create policy "users can insert own profile" on public.users for insert with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.users;
create policy "users can update own profile" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "users can read own enrollments" on public.user_plan_enrollments;
create policy "users can read own enrollments" on public.user_plan_enrollments for select using (auth.uid() = user_id);

drop policy if exists "users can mutate own enrollments" on public.user_plan_enrollments;
create policy "users can mutate own enrollments" on public.user_plan_enrollments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "users can access own progress days" on public.user_progress_days;
create policy "users can access own progress days" on public.user_progress_days
for all
using (
  exists (
    select 1
    from public.user_plan_enrollments e
    where e.id = enrollment_id
      and e.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.user_plan_enrollments e
    where e.id = enrollment_id
      and e.user_id = auth.uid()
  )
);
