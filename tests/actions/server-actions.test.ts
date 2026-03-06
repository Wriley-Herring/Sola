import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const requireAuthUser = vi.fn();
const enrollUserInPlan = vi.fn();
const getUserActivePlan = vi.fn();
const markDayComplete = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/auth/get-current-user", () => ({ requireAuthUser }));
vi.mock("@/lib/repositories/reading-repository", () => ({
  enrollUserInPlan,
  getUserActivePlan,
  markDayComplete
}));

describe("server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireAuthUser.mockResolvedValue({ id: "user-1" });
  });

  it("selectPlanAction enforces auth and revalidates", async () => {
    const { selectPlanAction } = await import("@/app/actions");
    const formData = new FormData();
    formData.set("planId", "plan-1");

    await selectPlanAction(formData);

    expect(requireAuthUser).toHaveBeenCalled();
    expect(enrollUserInPlan).toHaveBeenCalledWith("user-1", "plan-1");
    expect(revalidatePath).toHaveBeenCalledWith("/today");
  });

  it("completeCurrentDayAction is graceful when no active plan", async () => {
    getUserActivePlan.mockResolvedValue(null);
    const { completeCurrentDayAction } = await import("@/app/actions");
    const formData = new FormData();
    formData.set("progressId", "progress-1");
    formData.set("dayNumber", "1");

    await completeCurrentDayAction(formData);

    expect(markDayComplete).not.toHaveBeenCalled();
  });
});
