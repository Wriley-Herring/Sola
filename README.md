# Sola (Supabase + Next.js)

Sola is a context-first Bible study app built with Next.js App Router. This version uses Supabase Postgres for persistence and server-side data access.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase Postgres (`@supabase/supabase-js`)
- Vercel deployment (Supabase Marketplace integration)

## Required environment variables

Vercel Marketplace usually syncs these automatically:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional right now, needed if/when browser client auth is added)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose in browser code)

For local development, create `.env.local`:

```bash
cp .env.example .env.local
```

## Database setup (Supabase SQL)

Run these SQL files in the Supabase SQL editor (or via CLI):

1. `supabase/migrations/001_init.sql`
2. `supabase/seed.sql`

The seed script is idempotent and safe to rerun.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## How Supabase is used

- `lib/supabase/server.ts`: server-only Supabase client using service role key.
- `lib/repositories/reading-repository.ts`: reading plans, enrollment, active plan lookup, today reading, and progress updates.
- `lib/insights/service.ts`: cache-first insight retrieval against `passage_insight_cache`.
- `app/actions.ts`: server actions for selecting plan and completing current day.

## Passage insight cache behavior

Cache key is normalized passage reference (`normalized_passage_reference`).

Flow on Today page:

1. Normalize passage reference.
2. Query `passage_insight_cache`.
3. If found, return cached payload.
4. If missing, generate deterministic mock insights.
5. Insert into cache.
6. If insert races another request, recover via unique-constraint retry/select.

This guarantees one stored insight payload per passage across all users/plans.

## Single-user MVP mode

Auth is intentionally deferred. The app auto-creates/uses one fixed development user:

- `00000000-0000-0000-0000-000000000001`

This logic is isolated in the repository layer so real auth can replace it later.

## Replacing mock insights with a real LLM later

Replace internals of `generatePassageInsights(reference, passageText)` in:

- `lib/insights/generator.ts`

Keep `lib/insights/service.ts` unchanged so cache behavior remains stable.
