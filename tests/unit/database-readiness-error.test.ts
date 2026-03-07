import { describe, expect, it } from "vitest";
import { DatabaseNotReadyError } from "@/lib/system/ensure-database-ready";

describe("DatabaseNotReadyError", () => {
  it("includes missing table and seed details with fix guidance", () => {
    const error = new DatabaseNotReadyError(["reading_plans"], ["reading_plans:life-of-jesus"]);

    expect(error.message).toContain("Sola database is not initialized.");
    expect(error.message).toContain("reading_plans");
    expect(error.message).toContain("reading_plans:life-of-jesus");
    expect(error.message).toContain("supabase/schema.sql");
  });
});
