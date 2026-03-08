# Sola

Sola is a Next.js app backed by Supabase Auth, Supabase Postgres, and OpenAI.

## Architecture (current)

Core runtime pieces:

1. **Web app (Next.js App Router)** serves UI and server actions/routes.
2. **Supabase Auth** handles login (magic link + Google OAuth).
3. **Supabase Postgres** stores user profile, reading plans, progress, and cached insights.
4. **OpenAI** generates insights when cache misses occur.

There is no Prisma runtime in this codebase.

## Environment contract

### Required at runtime

These variables are required for the app to run correctly:

- `SITE_URL` (canonical app URL used to build auth callback URLs)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

`npm run verify:env` validates these variables and checks URL format.

### Optional for checks/admin scripts

- `HEALTHCHECK_URL` (used by `npm run verify:health`; if missing, health check is skipped)
- `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL` (read by helper code, but **not required** for app runtime)

## Auth flow (high level)

1. User starts on `/login`.
2. User signs in via:
   - magic link email (`signInWithOtp`), or
   - Google OAuth (`signInWithOAuth`).
3. Supabase redirects to `/auth/callback` with an auth code.
4. Callback exchanges code for session and stores session cookies.
5. App ensures a local `users` profile row exists for authenticated users.
6. Middleware refreshes session cookies and route-guards protected pages:
   - unauthenticated users are redirected to `/login`
   - authenticated users are redirected away from `/login` to `/today`

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create local env file:

   ```bash
   cp .env.example .env.local
   ```

3. Fill required variables in `.env.local`.

4. Apply DB SQL manually to your Supabase project (SQL editor or `psql`):

   ```bash
   psql "$POSTGRES_URL_NON_POOLING" -f supabase/schema.sql
   psql "$POSTGRES_URL_NON_POOLING" -f supabase/seed.sql
   ```

5. Validate env and run the app:

   ```bash
   npm run verify:env
   npm run dev
   ```

6. (Optional) run checks:

   ```bash
   npm run verify
   ```

Open `http://localhost:3000`.

## Deploy process (real flow)

1. Configure runtime env vars in your host (for example Vercel).
2. Apply `supabase/schema.sql` and `supabase/seed.sql` to the target Supabase database.
3. Deploy app build (`npm run build`, then run/start in your platform).
4. Run verification checks (`npm run verify:env` and `npm run verify`).
5. If `HEALTHCHECK_URL` is set, `npm run verify:health` confirms `/api/health` returns `status: "ok"` with `checks.app: "up"` and `checks.database: "up"`.

### Important notes

- `npm run build` does **not** bootstrap or migrate the database.
- `npm run db:bootstrap` is intentionally disabled and exits non-zero with manual SQL instructions.
- Database setup is an explicit operator step: run `supabase/schema.sql` and `supabase/seed.sql` yourself.

## Supabase dashboard manual setup checklist

You still need to configure these in Supabase dashboard for a working deploy:

1. **Auth URL settings**
   - Set Site URL to your app domain.
   - Add redirect URL(s):
     - `https://<your-domain>/auth/callback`
     - `http://localhost:3000/auth/callback` (local dev)
2. **Auth providers**
   - Enable Email provider (magic link).
   - Enable Google provider if Google sign-in is used, and provide Google OAuth credentials.
3. **Database schema/data**
   - Run `supabase/schema.sql`.
   - Run `supabase/seed.sql`.
