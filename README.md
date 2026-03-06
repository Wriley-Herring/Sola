# Sola (Supabase + Next.js)

Sola is a context-first Bible study app built with Next.js App Router and Supabase.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase Postgres + Supabase Auth
- `@supabase/ssr` + `@supabase/supabase-js`
- OpenAI Node SDK (`openai`) for passage insights cache generation

## Required environment variables

Create `.env.local` for local development:

```bash
cp .env.example .env.local
```

Then set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, only needed for privileged admin scripts; not used in normal app auth flows)
- `OPENAI_API_KEY` (server-only)

## Auth wiring summary

### Route model

Public routes:

- `/`
- `/login`
- `/auth/callback`

Protected routes:

- `/today`
- `/plans`
- `/progress`
- `/profile`

### How auth works

- `middleware.ts` performs optimistic cookie/session route checks and redirects unauthenticated users to `/login`.
- Real auth checks happen in server code (`requireAuthUser` / `requireAppUserProfile`).
- App profile provisioning is done server-side and idempotent via `upsert` into `public.users`.
- Login supports email magic link as primary path plus optional Google OAuth.
- Callback route exchanges auth code for session and redirects to `/today` (or `next` query param).

### Supabase client usage

- `lib/supabase/server.ts`: server component/action/route handler client with cookie support.
- `lib/supabase/client.ts`: browser client factory for client components when needed.
- `lib/supabase/middleware.ts`: middleware session refresh helper.

## Database setup (Supabase SQL)

Run migrations in order:

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_passage_insight_ai_cache.sql`
3. `supabase/migrations/003_auth_profiles_and_rls.sql`
4. `supabase/seed.sql`

## Profile table model

`public.users` stores app-specific profile data and is separate from `auth.users`:

- `id uuid primary key references auth.users(id) on delete cascade`
- `email text unique not null`
- `full_name text null`
- `onboarding_completed boolean not null default false`
- `created_at timestamptz not null default now()`

## RLS enforcement

RLS is enabled for user-owned tables and enforced by policies:

- `public.users`: users can read/insert/update only their own row (`auth.uid() = id`).
- `public.user_progress`: users can read/write/delete only rows where `auth.uid() = user_id`.
- Shared content tables remain globally readable (`reading_plans`, `reading_plan_days`, `passage_insight_cache`).

## Magic link + OAuth configuration notes

In Supabase Auth settings:

- Add your app URL(s) to **Site URL** / **Redirect URLs**.
- Include callback path, e.g.:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback`
- Configure Google provider in Supabase if you want Google sign-in enabled.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## AI insight generation + cache behavior

- Generator module: `lib/ai/generate-passage-insights.ts`
- Model currently used: `gpt-5-mini`
- Prompt/version metadata written to cache rows: `model`, `prompt_version`

Cache key is normalized passage reference (`normalized_reference`) with a unique constraint.

Flow on Today page:

1. Normalize passage reference.
2. Query `passage_insight_cache`.
3. If found, return cached payload.
4. If missing, generate insights server-side.
5. Insert generated insights into cache with model/version metadata.
6. If insert races another request, recover via unique-constraint retry/select.

This keeps passage insights globally shared while user progress remains user-owned.
