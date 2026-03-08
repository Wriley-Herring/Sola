import { describe, expect, it } from "vitest";
import { mapSupabaseError } from "@/lib/supabase/errors";

describe("supabase error mapping", () => {
  it("maps schema cache misses to initialization guidance", () => {
    const mapped = mapSupabaseError({
      code: "PGRST205",
      message: "Could not find the table 'public.reading_plans' in the schema cache"
    });

    expect(mapped?.message).toContain("Sola database is not initialized.");
  });

  it("preserves database error code and message for diagnostics", () => {
    const mapped = mapSupabaseError({ code: "XX000", message: "backend failure" });
    expect(mapped?.message).toBe("Database query failed (XX000): backend failure");
  });

  it("handles unknown code without losing error message", () => {
    const mapped = mapSupabaseError({ message: "permission denied for table users" });
    expect(mapped?.message).toBe("Database query failed: permission denied for table users");
  });
});
