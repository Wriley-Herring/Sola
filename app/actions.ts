"use server";

import { revalidatePath } from "next/cache";
import {
  enrollUserInPlan,
  getOrCreateMvpUser,
  getUserActivePlan,
  markDayComplete
} from "@/lib/repositories/reading-repository";

export async function selectPlanAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  if (!planId) return;

  const user = await getOrCreateMvpUser();
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

  const user = await getOrCreateMvpUser();
  const active = await getUserActivePlan(user.id);
  if (!active) return;

  await markDayComplete(progressId, dayNumber, active.plan.duration_days);

  revalidatePath("/today");
  revalidatePath("/progress");
  revalidatePath("/profile");
}
