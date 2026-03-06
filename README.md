# Sola MVP

Sola is a context-first daily Bible study app designed to feel calm, premium, and native on mobile web.

## Stack

- Next.js 14 (App Router + TypeScript)
- Tailwind CSS
- Prisma ORM
- SQLite for local MVP (PostgreSQL-ready schema)

## Project structure

```txt
app/
  page.tsx                  # onboarding / landing
  today/page.tsx            # core daily reading screen
  plans/page.tsx            # reading plan selection
  progress/page.tsx         # progress dashboard
  profile/page.tsx          # future settings shell
  actions.ts                # server actions (select plan, complete day)
  api/health/route.ts       # simple route handler
components/
  AppShell.tsx
  MobileHeader.tsx
  BottomTabBar.tsx
  PlanCard.tsx
  DailyReadingHeader.tsx
  ScriptureCard.tsx
  ExpandableInsightCard.tsx
  ProgressCard.tsx
  EmptyState.tsx
  LoadingState.tsx
lib/
  prisma.ts
  repositories/reading-repository.ts
  insights/generator.ts
  insights/service.ts
db/
  seed-data.ts
prisma/
  schema.prisma
  seed.ts
types/
  insights.ts
```

## Data model

- `User`
- `ReadingPlan`
- `ReadingPlanDay`
- `UserPlanEnrollment`
- `UserProgressDay`
- `PassageInsightCache`

`PassageInsightCache` is keyed by normalized passage reference so insights are generated once per passage and reused across plans/users.

## Insight caching flow

1. Today screen loads active plan day.
2. `getOrCreatePassageInsights(reference, passageText)` normalizes reference.
3. If cached, return persisted insight JSON.
4. If missing, call `generatePassageInsights(...)` mock AI abstraction.
5. Save to `PassageInsightCache` and reuse on future requests.

## Seed data

Included plans:

- Life of Jesus (30 days)
- Foundations of Scripture (30 days)
- Psalms for Prayer (14 days)

Passages are intentionally reused across plans to demonstrate shared insight caching by normalized reference.

## Local setup

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Architecture notes

- Single-user demo mode for MVP simplicity (`demo@sola.app`).
- Server components render primary screens.
- Server actions handle plan enrollment + day completion.
- Database/repository boundaries keep persistence swappable.
- Mocked AI service is isolated and replaceable with real LLM calls later.
