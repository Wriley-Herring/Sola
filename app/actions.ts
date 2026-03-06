"use server";

import { revalidatePath } from "next/cache";
import { requireAuthUser } from "@/lib/auth/get-current-user";
import { enrollUserInPlan, getUserActivePlan, markDayComplete } from "@/lib/repositories/reading-repository";

export async function selectPlanAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  if (!planId) return;

  const user = await requireAuthUser();
  await enrollUserInPlan(user.id, planId);

  revalidatePath("/plans");
  revalidatePath("/today");
  revalidatePath("/progress");
  revalidatePath("/profile");
}

export async function completeCurrentDayAction(formData: FormData) {
  const progressId = String(formData.get("progressId") ?? "");
  const dayNumber = Number(formData.get("dayNumber") ?? NaN);

  if (!progressId || Number.isNaN(dayNumber)) return;

  const user = await requireAuthUser();
  const active = await getUserActivePlan(user.id);
  if (!active) return;

  await markDayComplete(user.id, progressId, dayNumber, active.plan.duration_days);

  revalidatePath("/today");
  revalidatePath("/progress");
  revalidatePath("/profile");
}
