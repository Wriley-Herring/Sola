# Sola Production Checklist

## 1) Environment integrity

- [ ] `NEXT_PUBLIC_SUPABASE_URL` points to intended production project.
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is present.
- [ ] `OPENAI_API_KEY` is present.
- [ ] `SUPABASE_DB_URL` points to the **same** project ref as `NEXT_PUBLIC_SUPABASE_URL`.
- [ ] `SITE_URL` set to production domain.
- [ ] `HEALTHCHECK_URL` set to `https://<domain>/api/health`.

Run:

```bash
npm run verify:env
```

## 2) Database compatibility

Apply canonical schema and seed:

```bash
psql "$SUPABASE_DB_URL" -f supabase/schema.sql
psql "$SUPABASE_DB_URL" -f supabase/seed.sql
```

For legacy environments, also apply migration stabilization:

```bash
psql "$SUPABASE_DB_URL" -f supabase/migrations/004_stabilize_foundation.sql
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

If degraded:

- inspect `missingTables` and `missingSeedData`
- re-apply `schema.sql` then `seed.sql`
- confirm Supabase project ref alignment
