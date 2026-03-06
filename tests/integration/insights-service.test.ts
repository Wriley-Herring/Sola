import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeAiResponse, makeInsightCacheRow } from "@/tests/factories/domain";

const mockGenerate = vi.fn();
const mockSupabase = { from: vi.fn() };

vi.mock("@/lib/ai/generate-passage-insights", () => ({
  generatePassageInsights: (...args: unknown[]) => mockGenerate(...args)
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => mockSupabase
}));

describe("getOrCreatePassageInsights", () => {
  beforeEach(() => {
    mockGenerate.mockReset();
    mockSupabase.from.mockReset();
  });

  it("returns cache hit without generating", async () => {
    const row = makeInsightCacheRow();

    const selectBuilder = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: row, error: null }))
    };

    mockSupabase.from.mockReturnValueOnce(selectBuilder);

    const { getOrCreatePassageInsights } = await import("@/lib/insights/service");
    const result = await getOrCreatePassageInsights("John 3:16", "text");

    expect(result.historicalContext).toBe(row.historical_context);
    expect(mockGenerate).not.toHaveBeenCalled();
  });

  it("generates and inserts on cache miss", async () => {
    const generated = makeAiResponse();
    mockGenerate.mockResolvedValue(generated);

    const first = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: null, error: null }))
    };

    const insert = {
      insert: vi.fn(async () => ({ error: null }))
    };

    mockSupabase.from.mockReturnValueOnce(first).mockReturnValueOnce(insert);

    const { getOrCreatePassageInsights } = await import("@/lib/insights/service");
    const result = await getOrCreatePassageInsights("John 3:16", "text");

    expect(result).toEqual(generated);
  });

  it("recovers duplicate insert races", async () => {
    const generated = makeAiResponse();
    const cached = makeInsightCacheRow({ historical_context: "Recovered" });
    mockGenerate.mockResolvedValue(generated);

    const first = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: null, error: null }))
    };

    const insert = {
      insert: vi.fn(async () => ({ error: { code: "23505", message: "duplicate" } }))
    };

    const retry = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(async () => ({ data: cached, error: null }))
    };

    mockSupabase.from.mockReturnValueOnce(first).mockReturnValueOnce(insert).mockReturnValueOnce(retry);

    const { getOrCreatePassageInsights } = await import("@/lib/insights/service");
    const result = await getOrCreatePassageInsights("John 3:16", "text");

    expect(result.historicalContext).toBe("Recovered");
  });
});
