const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SITE_URL",
  "OPENAI_API_KEY"
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`[verify:env] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

for (const variableName of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL", "SITE_URL"]) {
  const value = process.env[variableName];
  try {
    new URL(value);
  } catch {
    console.error(`[verify:env] ${variableName} is not a valid URL: ${value}`);
    process.exit(1);
  }
}

for (const variableName of ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]) {
  const value = process.env[variableName];
  const parsed = new URL(value);
  if (!parsed.hostname.endsWith(".supabase.co")) {
    console.warn(`[verify:env] Warning: ${variableName} does not look like a Supabase project URL: ${value}`);
  }
}

if (process.env.SUPABASE_URL !== process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("[verify:env] Warning: SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL differ. Confirm this is intentional.");
}

console.log("[verify:env] Environment variables look valid.");
