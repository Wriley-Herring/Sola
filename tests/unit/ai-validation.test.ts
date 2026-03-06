import { describe, expect, it } from "vitest";
import { trimAndValidateString, validateInsights } from "@/lib/ai/generate-passage-insights";

describe("AI insight validation", () => {
  it("accepts valid payloads", () => {
    const parsed = validateInsights({
      historicalContext: " A ",
      culturalContext: "B",
      literaryContext: "C",
      keyThemes: ["one", "two", "three"],
      reflectionQuestion: "Question?"
    });

    expect(parsed.historicalContext).toBe("A");
  });

  it("rejects invalid key themes length", () => {
    expect(() =>
      validateInsights({
        historicalContext: "A",
        culturalContext: "B",
        literaryContext: "C",
        keyThemes: ["one"],
        reflectionQuestion: "Question?"
      })
    ).toThrow("keyThemes length");
  });

  it("rejects non-string fields", () => {
    expect(() => trimAndValidateString(42, "field")).toThrow("must be a string");
  });
});
