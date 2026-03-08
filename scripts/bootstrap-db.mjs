function main() {
  console.error("[db:bootstrap] Intentionally disabled: automated DB bootstrap is not part of this repo's runtime/build flow.");
  console.error("[db:bootstrap] Apply SQL manually using supabase/schema.sql then supabase/seed.sql (for example via Supabase SQL editor or psql).");
  process.exit(1);
}

main();
