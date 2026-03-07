import { execFileSync } from "node:child_process";
import { Prisma, PrismaClient } from "@prisma/client";

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

function runSql(connectionString, file) {
  console.log(`[db:bootstrap] Applying ${file}...`);
  execFileSync("npx", ["prisma", "db", "execute", `--url=${connectionString}`, "--file", file], {
    stdio: "inherit"
  });
}

async function verifyBootstrap(connectionString) {
  console.log("[db:bootstrap] Verifying required tables...");
  const prisma = new PrismaClient({ datasourceUrl: connectionString });

  try {
    const tableRows = await prisma.$queryRaw`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
    `;

    const existingTables = new Set(tableRows.map((row) => row.table_name));
    const missingTables = REQUIRED_TABLES.filter((name) => !existingTables.has(name));

    if (missingTables.length > 0) {
      throw new Error(`[db:bootstrap] Missing required tables after bootstrap: ${missingTables.join(", ")}`);
    }

    console.log("[db:bootstrap] Required tables verified.");
    console.log("[db:bootstrap] Verifying baseline reading plan seed rows...");

    const slugRows = await prisma.$queryRaw`
      select slug
      from reading_plans
      where slug in (${Prisma.join(REQUIRED_PLAN_SLUGS)})
    `;

    const existingSlugs = new Set(slugRows.map((row) => row.slug));
    const missingSlugs = REQUIRED_PLAN_SLUGS.filter((slug) => !existingSlugs.has(slug));

    if (missingSlugs.length > 0) {
      throw new Error(`[db:bootstrap] Missing baseline reading plans after seed: ${missingSlugs.join(", ")}`);
    }

    console.log("[db:bootstrap] Baseline seed rows verified.");
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log("[db:bootstrap] Starting database bootstrap.");
  const { value: connectionString } = resolveConnectionString();

  console.log("[db:bootstrap] Stage 1/4: connectivity check.");
  const prisma = new PrismaClient({ datasourceUrl: connectionString });
  try {
    await prisma.$queryRaw`select 1`;
  } finally {
    await prisma.$disconnect();
  }

  console.log("[db:bootstrap] Stage 2/4: apply schema SQL.");
  runSql(connectionString, "supabase/schema.sql");

  console.log("[db:bootstrap] Stage 3/4: apply seed SQL.");
  runSql(connectionString, "supabase/seed.sql");

  console.log("[db:bootstrap] Stage 4/4: post-bootstrap verification.");
  await verifyBootstrap(connectionString);

  console.log("[db:bootstrap] Completed successfully. Database schema and baseline seed are ready.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "[db:bootstrap] Unexpected bootstrap error.");
  process.exit(1);
});
