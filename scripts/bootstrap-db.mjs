import { execFileSync } from "node:child_process";

const DB_URL_CANDIDATES = ["POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "POSTGRES_PRISMA_URL"];
const REQUIRED_TABLES = [
  "users",
  "reading_plans",
  "reading_plan_days",
  "user_plan_enrollments",
  "user_progress_days",
  "passage_insight_cache"
];
const REQUIRED_PLAN_SLUGS = ["life-of-jesus", "foundations-of-scripture", "psalms-for-prayer"];

function resolveConnectionString() {
  console.log(`[db:bootstrap] Resolving database URL. Checking: ${DB_URL_CANDIDATES.join(" -> ")}`);

  for (const name of DB_URL_CANDIDATES) {
    const value = process.env[name];
    console.log(`[db:bootstrap] - ${name}: ${value ? "present" : "missing"}`);
    if (value) {
      console.log(`[db:bootstrap] Selected ${name} for database bootstrap.`);
      return { name, value };
    }
  }

  throw new Error(
    `[db:bootstrap] No database URL found. Checked ${DB_URL_CANDIDATES.join(", ")}. ` +
      "Install/configure the Vercel Supabase integration so one of these is injected."
  );
}

function runPrismaDbExecute(args, options = {}) {
  execFileSync("npx", ["prisma", "db", "execute", ...args], {
    stdio: "inherit",
    ...options
  });
}

function runSqlFile(connectionString, file) {
  console.log(`[db:bootstrap] Applying ${file}...`);
  runPrismaDbExecute([`--url=${connectionString}`, "--file", file]);
}

function runSqlStatement(connectionString, sql) {
  runPrismaDbExecute([`--url=${connectionString}`, "--stdin"], { input: sql });
}

function verifyBootstrap(connectionString) {
  console.log("[db:bootstrap] Verifying required tables...");

  runSqlStatement(
    connectionString,
    `DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM unnest(ARRAY[${REQUIRED_TABLES.map((table) => `'${table}'`).join(", ")}]) AS required_table
    WHERE to_regclass('public.' || required_table) IS NULL
  ) THEN
    RAISE EXCEPTION '[db:bootstrap] Missing required tables after bootstrap.';
  END IF;
END
$$;`
  );

  console.log("[db:bootstrap] Required tables verified.");
  console.log("[db:bootstrap] Verifying baseline reading plan seed rows...");

  runSqlStatement(
    connectionString,
    `DO $$
DECLARE
  expected_slugs text[] := ARRAY[${REQUIRED_PLAN_SLUGS.map((slug) => `'${slug}'`).join(", ")}];
BEGIN
  IF EXISTS (
    SELECT 1
    FROM unnest(expected_slugs) AS slug
    WHERE NOT EXISTS (SELECT 1 FROM reading_plans WHERE reading_plans.slug = slug)
  ) THEN
    RAISE EXCEPTION '[db:bootstrap] Missing baseline reading plans after seed.';
  END IF;
END
$$;`
  );

  console.log("[db:bootstrap] Baseline seed rows verified.");
}

function main() {
  console.log("[db:bootstrap] Starting database bootstrap.");
  const { value: connectionString } = resolveConnectionString();

  console.log("[db:bootstrap] Stage 1/4: connectivity check.");
  runSqlStatement(connectionString, "select 1;");

  console.log("[db:bootstrap] Stage 2/4: apply schema SQL.");
  runSqlFile(connectionString, "supabase/schema.sql");

  console.log("[db:bootstrap] Stage 3/4: apply seed SQL.");
  runSqlFile(connectionString, "supabase/seed.sql");

  console.log("[db:bootstrap] Stage 4/4: post-bootstrap verification.");
  verifyBootstrap(connectionString);

  console.log("[db:bootstrap] Completed successfully. Database schema and baseline seed are ready.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : "[db:bootstrap] Unexpected bootstrap error.");
  process.exit(1);
}
