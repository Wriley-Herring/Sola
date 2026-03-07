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
      eq: vi.fn()
    };
    updateChain.eq.mockImplementation(function () {
      if (updateChain.eq.mock.calls.length >= 2) {
        return Promise.resolve({ error: null });
      }
      return this;
    });

    mockSupabase.from.mockReturnValueOnce(selectChain).mockReturnValueOnce(updateChain);

    const { markDayComplete } = await import("@/lib/repositories/reading-repository");
    await markDayComplete("user-1", "progress-1", 1, 30);

    expect(updateChain.update).toHaveBeenCalledWith({ completed_days: [1], current_day: 2 });
  });

  it("getUserActivePlan returns null when user_progress is missing from schema cache", async () => {
    const maybeSingle = vi.fn(async () => ({
      data: null,
      error: {
        code: "PGRST205",
        message: "Could not find the table 'public.user_progress' in the schema cache"
      }
    }));

    const queryChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle
    };

    mockSupabase.from.mockReturnValueOnce(queryChain);

    const { getUserActivePlan } = await import("@/lib/repositories/reading-repository");
    await expect(getUserActivePlan("user-1")).resolves.toBeNull();
  });
});
