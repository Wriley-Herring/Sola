# Sola

Sola is a simple app with one core flow:

1. User signs in.
2. User chooses a reading plan.
3. User opens today’s reading.
4. App returns cached AI insights (or generates and caches once).
5. User marks progress.

This repository now treats database setup as a **hard prerequisite**, not an optional runtime assumption.

## Root-cause diagnosis (why the app failed end-to-end)

The previous setup mixed incompatible database models:

- Legacy migrations created `user_progress`, `reading_plans.duration_days`, and `reading_plan_days.reading_plan_id`.
- Runtime code queried `user_plan_enrollments`, `user_progress_days`, `reading_plans.duration`, and `reading_plan_days.plan_id`.
- Result: production could be “migrated” but still structurally incompatible with runtime queries, causing schema-cache/table-not-found failures.

Additional operational failures:

- Seed verification was not enforced at runtime.
- Deployments could point app env vars at one Supabase project while DB bootstrap targeted another.
- Failures surfaced as generic runtime exceptions instead of explicit readiness diagnostics.

## Required environment variables

Copy and edit env file:

```bash
cp .env.example .env.local
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `OPENAI_API_KEY`

Required for schema/seed bootstrapping in deploy pipelines:

- `SUPABASE_DB_URL`

Recommended:

- `SITE_URL` (for auth callback generation)
- `HEALTHCHECK_URL` (for deployment verify script)

## Create and initialize Supabase

### 1) Create project

Create a Supabase project and copy:

- Project URL (`https://<project-ref>.supabase.co`)
- Publishable (anon) key
- Postgres connection string

### 2) Apply canonical schema

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
```

### 3) Apply deterministic seed data

```bash
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

Both scripts are idempotent.

### 4) (Legacy deployment fix) Apply migration sequence

If your environment was previously deployed from old migrations, apply:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/001_init.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/002_passage_insight_ai_cache.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/003_auth_profiles_and_rls.sql
psql "$SUPABASE_DB_URL" -f supabase/migrations/004_stabilize_foundation.sql
```

`004_stabilize_foundation.sql` reconciles legacy structure into the canonical runtime model.

## Verify you are targeting the correct Supabase project

1. Confirm `NEXT_PUBLIC_SUPABASE_URL` project ref matches `SUPABASE_DB_URL` host ref.
2. Run:

```bash
npm run verify:env
```

3. Check health endpoint response:

```bash
curl -s http://localhost:3000/api/health | jq
```

Expect:

```json
{
  "status": "ok",
  "databaseReady": true,
  "missingTables": [],
  "missingSeedData": []
}
```

## Run the app

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deployment safety commands

- `npm run db:bootstrap` – applies `supabase/schema.sql` + `supabase/seed.sql`.
- `npm run verify` – env validation, lint, typecheck, tests, and optional remote healthcheck.
- `npm run build` – runs bootstrap before build so deploys fail fast if database bootstrap fails.

See `docs/production-checklist.md` for release procedure.
