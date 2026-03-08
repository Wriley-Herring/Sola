import { getDatabaseReadiness } from "@/lib/system/database-readiness";

export const DATABASE_NOT_READY_PREFIX = "Sola database is not ready.";

export class DatabaseNotReadyError extends Error {
  readonly reason?: string;

  constructor(reason?: string) {
    const details = [
      DATABASE_NOT_READY_PREFIX,
      reason ?? "Database is unavailable.",
      "Fix: verify Supabase is reachable and schema/seed setup has been applied for the project used by NEXT_PUBLIC_SUPABASE_URL."
    ].join(" ");

    super(details);
    this.name = "DatabaseNotReadyError";
    this.reason = reason;
  }
}

export async function ensureDatabaseReady() {
  const readiness = await getDatabaseReadiness();
  if (!readiness.isReady) {
    throw new DatabaseNotReadyError(readiness.reason);
  }

  return readiness;
}
