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

  it("maps unknown errors without leaking internals", () => {
    const mapped = mapSupabaseError({ code: "XX000", message: "backend failure" });
    expect(mapped?.message).toBe("Database query failed. See server logs for details.");
  });
});
