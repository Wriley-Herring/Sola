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
- `SITE_URL` (server-only canonical app URL; used for auth redirect links)
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
- App profile provisioning is done server-side and idempotent via `upsert` into `public."User"`.
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

`public."User"` stores app-specific profile data used by the app auth profile layer:

- `id text primary key`
- `email text unique not null`
- `name text not null`
- `createdAt timestamp not null default now()`

## RLS enforcement

RLS is enabled for user-owned tables and enforced by policies:

- Ensure profile table access policy for `public."User"` allows the authenticated user to upsert/select their own row by `id` in your deployment.
- Keep user-owned progress tables protected by user identity, and shared content tables globally readable.

## Magic link + OAuth configuration notes

In Supabase Auth settings:

- Add your app URL(s) to **Site URL** / **Redirect URLs**.
- Set `SITE_URL` in your app environment so magic-link and OAuth redirects use your deployed domain.
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

## Testing strategy and harness

Sola uses a layered test strategy to keep feedback fast while covering production-critical flows.

### Test suites

- **Unit (`tests/unit`)**: pure logic and high-signal component behavior.
  - reference normalization
  - AI payload validation helpers
  - middleware route classification logic
  - empty-state rendering behavior
- **Integration (`tests/integration`, `tests/actions`, `tests/middleware`)**: service/repository/server action behavior with mocked Supabase/OpenAI seams.
  - insight cache hit/miss + duplicate insert recovery
  - plan enrollment and progress completion behavior
  - middleware redirects + cookie mutation behavior
  - server action auth enforcement and revalidation side effects
- **E2E (`tests/e2e`)**: route protection + core user journey using Playwright.

### Test commands

- `npm run test` – watch-mode Vitest
- `npm run test:unit` – unit tests
- `npm run test:integration` – integration + middleware + actions
- `npm run test:ci` – full Vitest run with coverage
- `npm run test:e2e` – Playwright suite
- `npm run typecheck` – TypeScript strict check
- `npm run verify` – lint + typecheck + unit + integration

### E2E auth strategy

Email/OAuth flows are intentionally not automated in CI. For deterministic test auth, Sola includes **test-only** bypass endpoints:

- `POST /api/test-auth/login`
- `POST /api/test-auth/logout`

These routes are enabled **only** when:

- `NODE_ENV=test`
- `E2E_AUTH_BYPASS=true`

They set/clear a `sola-e2e-user` cookie that is consumed by `getCurrentAuthUser` in the same guarded test-only mode.

This avoids production auth shortcuts while still enabling maintainable core journey automation.
