# Sola Production Checklist

## 1) Environment integrity

- [ ] `NEXT_PUBLIC_SUPABASE_URL` points to intended production project.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is present.
- [ ] `SUPABASE_URL` is present and matches the intended project.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is present.
- [ ] At least one DB bootstrap variable is present (preferred order):
  - [ ] `POSTGRES_URL_NON_POOLING`
  - [ ] `POSTGRES_URL`
  - [ ] `POSTGRES_PRISMA_URL`
- [ ] `OPENAI_API_KEY` is present.
- [ ] `SITE_URL` is set to production domain.
- [ ] `HEALTHCHECK_URL` is set to `https://<domain>/api/health`.

Run:

```bash
npm run verify:env
```

## 2) Database bootstrap integrity

Run idempotent bootstrap (schema + seed + verification):

```bash
npm run db:bootstrap
```

Optional manual SQL application:

```bash
psql "$POSTGRES_URL_NON_POOLING" -f supabase/schema.sql
psql "$POSTGRES_URL_NON_POOLING" -f supabase/seed.sql
```

## 3) Application quality gate

Run full verification:

```bash
npm run verify
```

## 4) Post-deploy health

Validate endpoint:

```bash
curl -s "$HEALTHCHECK_URL"
```

Healthy payload:

```json
{
  "status": "ok",
  "databaseReady": true,
  "missingTables": [],
  "missingSeedData": []
}
```

## Deployment-readiness rule

A deployment is not healthy unless all of the following are true:

1. Required environment variables are present.
2. Schema bootstrap succeeds.
3. Seed verification succeeds.
4. Healthcheck returns `status: "ok"`.
