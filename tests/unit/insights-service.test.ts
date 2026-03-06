import { describe, expect, it } from "vitest";
import { normalizeReference } from "@/lib/insights/service";

describe("normalizeReference", () => {
  it("normalizes casing and whitespace", () => {
    expect(normalizeReference("  John   3:16 ")).toBe("john 3:16");
  });
});
