# Sola (Supabase + Next.js)

Sola is a context-first Bible study app built with Next.js App Router. This version uses Supabase Postgres for persistence and server-side data access.

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase Postgres (`@supabase/supabase-js`)
- OpenAI Node SDK (`openai`)
- Vercel deployment (Supabase Marketplace integration)

## Required environment variables

Vercel Marketplace usually syncs these automatically:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (optional right now, needed if/when browser client auth is added)
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never expose in browser code)
- `OPENAI_API_KEY` (server-only; used in `lib/ai/generate-passage-insights.ts`)

For local development, create `.env.local`:

```bash
cp .env.example .env.local
```

## Database setup (Supabase SQL)

Run these SQL files in order in the Supabase SQL editor (or via CLI):

1. `supabase/migrations/001_init.sql`
2. `supabase/migrations/002_passage_insight_ai_cache.sql`
3. `supabase/seed.sql`

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

## AI insight generation + cache behavior

- Generator module: `lib/ai/generate-passage-insights.ts`
- Model currently used: `gpt-5-mini`
- Prompt/version metadata written to cache rows: `model`, `prompt_version`

Cache key is normalized passage reference (`normalized_reference`) with a unique constraint.

Flow on Today page:

1. Normalize passage reference.
2. Query `passage_insight_cache`.
3. If found, return cached payload (no AI call).
4. If missing, call `generatePassageInsights(reference, passageText)` server-side.
5. Insert generated insights into cache with model/version metadata.
6. If insert races another request, recover via unique-constraint retry/select.

This guarantees one stored insight payload per passage across all users/plans.

## Changing the model later

Update `MODEL` in:

- `lib/ai/generate-passage-insights.ts`

If the prompt behavior changes significantly, also increment `PROMPT_VERSION` in the same file so new generations can be tracked.

## Regenerating cached passages after prompt/model changes

Because cache rows are keyed by `normalized_reference`, existing passages will keep prior generations until removed.

To force regeneration for all passages:

```sql
truncate table public.passage_insight_cache;
```

To force regeneration for one passage:

```sql
delete from public.passage_insight_cache
where normalized_reference = lower(trim('Luke 10:25-37'));
```

## Single-user MVP mode

Auth is intentionally deferred. The app auto-creates/uses one fixed development user:

- `00000000-0000-0000-0000-000000000001`

This logic is isolated in the repository layer so real auth can replace it later.
