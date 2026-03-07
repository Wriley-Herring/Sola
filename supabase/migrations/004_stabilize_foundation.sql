-- Stabilization migration: aligns legacy deployments with canonical schema used by runtime code.
create extension if not exists "pgcrypto";

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reading_plans' and column_name = 'duration_days'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reading_plans' and column_name = 'duration'
  ) then
    alter table public.reading_plans rename column duration_days to duration;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reading_plan_days' and column_name = 'reading_plan_id'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reading_plan_days' and column_name = 'plan_id'
  ) then
    alter table public.reading_plan_days rename column reading_plan_id to plan_id;
  end if;
end
$$;

alter table public.reading_plans
  add column if not exists duration integer;

alter table public.reading_plans
  alter column duration set not null;

alter table public.reading_plan_days
  add column if not exists normalized_ref text;

update public.reading_plan_days
set normalized_ref = lower(trim(regexp_replace(passage_reference, '\\s+', ' ', 'g')))
where normalized_ref is null;

alter table public.reading_plan_days
  alter column normalized_ref set not null;

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

-- Migrate legacy user_progress data when that table exists.
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'user_progress'
  ) then
    insert into public.user_plan_enrollments (user_id, plan_id, current_day, completed, started_at, updated_at)
    select up.user_id,
           up.reading_plan_id,
           up.current_day,
           case
             when exists (select 1 from public.reading_plans rp where rp.id = up.reading_plan_id and up.current_day >= rp.duration) then true
             else false
           end,
           up.started_at,
           up.updated_at
    from public.user_progress up
    on conflict (user_id, plan_id) do update
    set current_day = excluded.current_day,
        completed = excluded.completed,
        started_at = excluded.started_at,
        updated_at = excluded.updated_at;

    insert into public.user_progress_days (enrollment_id, day_number)
    select e.id, completed_day
    from public.user_progress up
    join public.user_plan_enrollments e
      on e.user_id = up.user_id
     and e.plan_id = up.reading_plan_id
    cross join unnest(coalesce(up.completed_days, '{}'::integer[])) as completed_day
    on conflict (enrollment_id, day_number) do nothing;
  end if;
end
$$;

create index if not exists reading_plan_days_plan_day_idx on public.reading_plan_days(plan_id, day_number);
create index if not exists reading_plan_days_normalized_ref_idx on public.reading_plan_days(normalized_ref);
create index if not exists user_plan_enrollments_user_updated_idx on public.user_plan_enrollments(user_id, updated_at desc);
create index if not exists user_progress_days_enrollment_idx on public.user_progress_days(enrollment_id, day_number);

alter table public.user_plan_enrollments enable row level security;
alter table public.user_progress_days enable row level security;

grant select, insert, update, delete on public.user_plan_enrollments, public.user_progress_days to authenticated;

drop policy if exists "users can read own enrollments" on public.user_plan_enrollments;
create policy "users can read own enrollments" on public.user_plan_enrollments
for select using (auth.uid() = user_id);

drop policy if exists "users can mutate own enrollments" on public.user_plan_enrollments;
create policy "users can mutate own enrollments" on public.user_plan_enrollments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

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
