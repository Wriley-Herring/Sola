import { beforeEach, describe, expect, it, vi } from "vitest";

const mockSupabase = { from: vi.fn() };

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: () => mockSupabase
}));

describe("reading repository", () => {
  beforeEach(() => {
    mockSupabase.from.mockReset();
  });

  it("enrollUserInPlan upserts and cleans up other plans", async () => {
    const upsertChain = { upsert: vi.fn(async () => ({ error: null })) };
    const deleteChain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn(async () => ({ error: null }))
    };

    mockSupabase.from.mockReturnValueOnce(upsertChain).mockReturnValueOnce(deleteChain);

    const { enrollUserInPlan } = await import("@/lib/repositories/reading-repository");
    await enrollUserInPlan("user-1", "plan-1");

    expect(upsertChain.upsert).toHaveBeenCalled();
    expect(deleteChain.neq).toHaveBeenCalledWith("reading_plan_id", "plan-1");
  });

  it("markDayComplete is idempotent and advances day", async () => {
    const selectChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(async () => ({ data: { completed_days: [1] }, error: null }))
    };

    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis()
    };
    updateChain.eq.mockResolvedValue({ error: null });

    mockSupabase.from.mockReturnValueOnce(selectChain).mockReturnValueOnce(updateChain);

    const { markDayComplete } = await import("@/lib/repositories/reading-repository");
    await markDayComplete("user-1", "progress-1", 1, 30);

    expect(updateChain.update).toHaveBeenCalledWith({ completed_days: [1], current_day: 2 });
  });
});
