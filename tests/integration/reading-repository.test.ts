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
    expect(deleteChain.neq).toHaveBeenCalledWith("plan_id", "plan-1");
  });

  it("markDayComplete upserts progress day and advances day", async () => {
    const progressInsertChain = {
      upsert: vi.fn(async () => ({ error: null }))
    };

    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis()
    };
    updateChain.eq = vi
      .fn()
      .mockReturnValueOnce(updateChain)
      .mockResolvedValueOnce({ error: null });

    mockSupabase.from.mockReturnValueOnce(progressInsertChain).mockReturnValueOnce(updateChain);

    const { markDayComplete } = await import("@/lib/repositories/reading-repository");
    await markDayComplete("user-1", "enroll-1", 1, 30);

    expect(progressInsertChain.upsert).toHaveBeenCalledWith({ enrollment_id: "enroll-1", day_number: 1 }, { onConflict: "enrollment_id,day_number" });
    expect(updateChain.update).toHaveBeenCalledWith({ current_day: 2, completed: false });
  });

  it("getUserActivePlan throws developer-friendly error when schema is missing", async () => {
    const maybeSingle = vi.fn(async () => ({
      data: null,
      error: {
        code: "PGRST205",
        message: "Could not find the table 'public.user_plan_enrollments' in the schema cache"
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
    await expect(getUserActivePlan("user-1")).rejects.toThrow("Sola database is not initialized. Run schema setup.");
  });
});
