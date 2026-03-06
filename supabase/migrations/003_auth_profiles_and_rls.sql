-- Migrate demo-mode schema to Supabase Auth user ownership.

alter table public.users
  add column if not exists email text,
  add column if not exists full_name text,
  add column if not exists onboarding_completed boolean not null default false;

update public.users u
set email = au.email
from auth.users au
where au.id = u.id
  and u.email is null;

delete from public.user_progress up
where not exists (
  select 1 from auth.users au where au.id = up.user_id
);

delete from public.users u
where not exists (
  select 1 from auth.users au where au.id = u.id
);

alter table public.users
  alter column id drop default,
  alter column email set not null;

alter table public.users
  drop constraint if exists users_id_fkey,
  add constraint users_id_fkey
    foreign key (id)
    references auth.users(id)
    on delete cascade;

create unique index if not exists users_email_idx on public.users(email);
create index if not exists user_progress_user_id_idx on public.user_progress(user_id);

alter table public.users enable row level security;
alter table public.user_progress enable row level security;
alter table public.reading_plans enable row level security;
alter table public.reading_plan_days enable row level security;
alter table public.passage_insight_cache enable row level security;

revoke all on public.users from anon, authenticated;
revoke all on public.user_progress from anon, authenticated;

grant select on public.reading_plans to anon, authenticated;
grant select on public.reading_plan_days to anon, authenticated;
grant select on public.passage_insight_cache to anon, authenticated;

grant select, insert, update on public.users to authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;

drop policy if exists "public read reading_plans" on public.reading_plans;
create policy "public read reading_plans"
on public.reading_plans
for select
using (true);

drop policy if exists "public read reading_plan_days" on public.reading_plan_days;
create policy "public read reading_plan_days"
on public.reading_plan_days
for select
using (true);

drop policy if exists "public read passage_insight_cache" on public.passage_insight_cache;
create policy "public read passage_insight_cache"
on public.passage_insight_cache
for select
using (true);

drop policy if exists "users can read own profile" on public.users;
create policy "users can read own profile"
on public.users
for select
using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.users;
create policy "users can insert own profile"
on public.users
for insert
with check (auth.uid() = id);

drop policy if exists "users can update own profile" on public.users;
create policy "users can update own profile"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users can read own progress" on public.user_progress;
create policy "users can read own progress"
on public.user_progress
for select
using (auth.uid() = user_id);

drop policy if exists "users can insert own progress" on public.user_progress;
create policy "users can insert own progress"
on public.user_progress
for insert
with check (auth.uid() = user_id);

drop policy if exists "users can update own progress" on public.user_progress;
create policy "users can update own progress"
on public.user_progress
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "users can delete own progress" on public.user_progress;
create policy "users can delete own progress"
on public.user_progress
for delete
using (auth.uid() = user_id);
