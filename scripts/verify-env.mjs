const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPENAI_API_KEY"
];

const dbCandidates = ["POSTGRES_URL_NON_POOLING", "POSTGRES_URL", "POSTGRES_PRISMA_URL"];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`[verify:env] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

for (const variableName of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]) {
  const value = process.env[variableName];
  try {
    const parsed = new URL(value);
    if (!parsed.hostname.endsWith(".supabase.co")) {
      console.warn(`[verify:env] Warning: ${variableName} does not look like a Supabase project URL: ${value}`);
    }
  } catch {
    console.error(`[verify:env] ${variableName} is not a valid URL: ${value}`);
    process.exit(1);
  }
}

if (process.env.SUPABASE_URL !== process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("[verify:env] Warning: SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL differ. Confirm this is intentional.");
}

const selectedDbVar = dbCandidates.find((name) => process.env[name]);
if (!selectedDbVar) {
  console.error(
    `[verify:env] Missing database URL. Checked: ${dbCandidates.join(", ")}. ` +
      "Vercel Supabase integration should provide one of these automatically."
  );
  process.exit(1);
}

console.log(`[verify:env] Database bootstrap URL source: ${selectedDbVar}`);
console.log("[verify:env] Environment variables look valid.");
