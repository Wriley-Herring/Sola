import { logEvent } from "@/lib/observability/log";
import { DATABASE_NOT_READY_PREFIX } from "@/lib/system/ensure-database-ready";

const MISSING_SCHEMA_ERROR = `${DATABASE_NOT_READY_PREFIX} Required schema objects are missing. Run schema setup.`;

type PostgrestLikeError = {
  code?: string;
  message?: string;
};

function isSchemaCacheMissingTableError(error: PostgrestLikeError | null) {
  if (!error) return false;

  const message = error.message?.toLowerCase() ?? "";

  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    message.includes("schema cache") ||
    message.includes("could not find the table") ||
    message.includes("relation")
  );
}

export function mapSupabaseError(error: PostgrestLikeError | null): Error | null {
  if (!error) return null;

  if (isSchemaCacheMissingTableError(error)) {
    logEvent("schema_missing", { code: error.code, message: error.message });
    return new Error(MISSING_SCHEMA_ERROR);
  }

  return new Error("Database query failed. See server logs for details.");
}

export function throwIfSupabaseError(error: PostgrestLikeError | null): void {
  const mapped = mapSupabaseError(error);
  if (mapped) {
    throw mapped;
  }
}

export { MISSING_SCHEMA_ERROR };
