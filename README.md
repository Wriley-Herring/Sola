# Sola MVP

Sola is a context-first Bible study app built for a calm daily Scripture rhythm. The MVP focuses on:

- selecting a reading plan
- reading the current day with a polished scripture experience
- viewing layered contextual insights
- caching insights by passage for cross-plan reuse
- tracking and persisting progress over time

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for local development (swap to PostgreSQL by changing Prisma datasource)

## Project Structure

```txt
app/
  actions.ts                # server actions for plan selection + completion
  page.tsx                  # landing page
  plans/page.tsx            # reading plans listing
  dashboard/page.tsx        # current daily reading experience
  profile/page.tsx          # progress view
  api/health/route.ts       # simple route handler
components/
  AppShell.tsx
  TopNav.tsx
  PlanCard.tsx
  DailyReadingHeader.tsx
  ScriptureCard.tsx
  InsightAccordion.tsx
  ExpandableInsightCard.tsx
  ProgressCard.tsx
  EmptyState.tsx
  LoadingState.tsx
lib/
  prisma.ts                 # Prisma singleton
  repositories/reading-repository.ts
  insights/generator.ts     # AI abstraction (mock generator)
  insights/service.ts       # cache lookup + persistence
db/
  seed-data.ts              # seed reading plans and passages
prisma/
  schema.prisma             # data model
  seed.ts                   # database seed script
types/
  insights.ts
```

## Data Model

Core tables:

- `User`
- `ReadingPlan`
- `ReadingPlanDay`
- `UserPlanEnrollment`
- `UserProgressDay`
- `PassageInsightCache`

`PassageInsightCache` is keyed by normalized passage reference, so repeated references across plans reuse the same generated insight payload.

## Insight Caching Flow

1. Dashboard loads the current reading day.
2. `getOrCreatePassageInsights(reference, passageText)` normalizes the reference.
3. If a `PassageInsightCache` record exists, it returns cached insights.
4. If not, it calls `generatePassageInsights(...)` from the mock generator abstraction.
5. New insights are persisted and reused for future requests.

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment:

   ```bash
   cp .env.example .env
   ```

3. Create DB + generate Prisma client:

   ```bash
   npm run db:push
   ```

4. Seed plans, passages, and demo user:

   ```bash
   npm run db:seed
   ```

5. Run dev server:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Notes

- MVP uses a mocked single-user mode (`demo@sola.app`) to keep setup simple.
- Route handlers and server actions are used where appropriate for a Vercel-friendly architecture.
- To move to PostgreSQL, update `schema.prisma` datasource and `DATABASE_URL`, then run Prisma migrations.
