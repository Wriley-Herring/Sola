# Sola

Sola is a simple app with one core flow:

1. User signs in.
2. User chooses a reading plan.
3. User opens today’s reading.
4. App returns cached AI insights (or generates and caches once).
5. User marks progress.

This repository treats database readiness as a hard prerequisite.

## Official Vercel + Supabase environment contract

When using the Vercel Supabase Marketplace integration, Vercel provides:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`

## Which variables Sola uses

### Browser/client auth

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Server auth/admin

- Cookie-backed auth client: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service/admin client (when needed): `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

### Database bootstrap

`npm run db:bootstrap` resolves DB URL in this order:

1. `POSTGRES_URL_NON_POOLING`
2. `POSTGRES_URL`
3. `POSTGRES_PRISMA_URL`

`SUPABASE_DB_URL` is **not required**.

## Local setup

```bash
cp .env.example .env.local
npm install
```

Minimum required runtime variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Bootstrap flow

Run:

```bash
npm run db:bootstrap
```

The bootstrap script is idempotent and will:

1. Resolve DB URL from Vercel-compatible variables.
2. Check DB connectivity.
3. Apply `supabase/schema.sql`.
4. Apply `supabase/seed.sql`.
5. Verify required tables exist.
6. Verify baseline `reading_plans` rows exist.
7. Exit non-zero with diagnostics if any stage fails.

## Verification

```bash
npm run verify:env
npm run verify
```

## Deployment readiness rule

A deployment is not considered healthy unless:

1. Required environment variables are present.
2. Schema bootstrap succeeds.
3. Seed verification succeeds.
4. Healthcheck passes (`/api/health` returns `status: "ok"`).

## Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.
