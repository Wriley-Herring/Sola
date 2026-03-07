const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "OPENAI_API_KEY"
];

const missing = required.filter((name) => !process.env[name]);

if (missing.length > 0) {
  console.error(`[verify:env] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

try {
  const parsed = new URL(supabaseUrl);
  if (!parsed.hostname.endsWith(".supabase.co")) {
    console.warn(`[verify:env] Warning: NEXT_PUBLIC_SUPABASE_URL does not look like a Supabase project URL: ${supabaseUrl}`);
  }
} catch {
  console.error(`[verify:env] NEXT_PUBLIC_SUPABASE_URL is not a valid URL: ${supabaseUrl}`);
  process.exit(1);
}

console.log("[verify:env] Environment variables look valid.");
