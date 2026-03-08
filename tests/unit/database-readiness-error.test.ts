import { describe, expect, it } from "vitest";
import { DatabaseNotReadyError } from "@/lib/system/ensure-database-ready";

describe("DatabaseNotReadyError", () => {
  it("includes failure reason with fix guidance", () => {
    const error = new DatabaseNotReadyError("PostgREST health check failed with status 503.");

    expect(error.message).toContain("Sola database is not ready.");
    expect(error.message).toContain("PostgREST health check failed with status 503.");
    expect(error.message).toContain("NEXT_PUBLIC_SUPABASE_URL");
  });
});
