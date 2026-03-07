import { logEvent } from "@/lib/observability/log";

const MISSING_SCHEMA_ERROR = "Sola database is not initialized. Run schema setup.";

type PostgrestLikeError = {
  code?: string;
  message?: string;
};

function isSchemaCacheMissingTableError(error: PostgrestLikeError | null) {
  if (!error) return false;
  return error.code === "PGRST205" && error.message?.includes("schema cache");
}

export function mapSupabaseError(error: PostgrestLikeError | null): Error | null {
  if (!error) return null;

  if (isSchemaCacheMissingTableError(error)) {
    logEvent("schema_missing", { code: error.code, message: error.message });
    return new Error(MISSING_SCHEMA_ERROR);
  }

  return new Error(error.message ?? "Supabase query failed.");
}

export function throwIfSupabaseError(error: PostgrestLikeError | null): void {
  const mapped = mapSupabaseError(error);
  if (mapped) {
    throw mapped;
  }
}

export { MISSING_SCHEMA_ERROR };
