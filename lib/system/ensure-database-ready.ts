import { getDatabaseReadiness } from "@/lib/system/database-readiness";

export const DATABASE_NOT_READY_PREFIX = "Sola database is not initialized.";

export class DatabaseNotReadyError extends Error {
  readonly missingTables: string[];
  readonly missingSeedData: string[];

  constructor(missingTables: string[], missingSeedData: string[]) {
    const details = [
      `${DATABASE_NOT_READY_PREFIX} Missing tables: ${missingTables.length ? missingTables.join(", ") : "none"}.`,
      `Missing seed data: ${missingSeedData.length ? missingSeedData.join(", ") : "none"}.`,
      "Fix: apply supabase/schema.sql, then supabase/seed.sql against the same Supabase project used by NEXT_PUBLIC_SUPABASE_URL."
    ].join(" ");

    super(details);
    this.name = "DatabaseNotReadyError";
    this.missingTables = missingTables;
    this.missingSeedData = missingSeedData;
  }
}

export async function ensureDatabaseReady() {
  const readiness = await getDatabaseReadiness();
  if (!readiness.isReady) {
    throw new DatabaseNotReadyError(readiness.missingTables, readiness.missingSeedData);
  }

  return readiness;
}
