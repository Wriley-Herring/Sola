import { execFileSync } from "node:child_process";

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  if (process.env.VERCEL === "1") {
    console.error("[db:bootstrap] Missing SUPABASE_DB_URL. Set it in Vercel project environment variables.");
    process.exit(1);
  }

  console.log("[db:bootstrap] SUPABASE_DB_URL not set; skipping schema bootstrap.");
  process.exit(0);
}

function runSql(file) {
  console.log(`[db:bootstrap] Applying ${file}...`);
  execFileSync("npx", ["prisma", "db", "execute", `--url=${connectionString}`, "--file", file], {
    stdio: "inherit"
  });
}

try {
  runSql("supabase/schema.sql");
  runSql("supabase/seed.sql");
  console.log("[db:bootstrap] Database schema and seed are up to date.");
} catch {
  console.error("[db:bootstrap] Failed to apply database bootstrap SQL.");
  process.exit(1);
}
