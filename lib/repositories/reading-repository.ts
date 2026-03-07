import { logEvent } from "@/lib/observability/log";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";

export type ReadingPlan = {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration: number;
};

export type UserPlanEnrollment = {
  id: string;
  user_id: string;
  plan_id: string;
  current_day: number;
  completed: boolean;
  started_at: string;
  updated_at: string;
};

export type ReadingPlanDay = {
  id: string;
  day_number: number;
  passage_reference: string;
  passage_text: string;
};

export async function listReadingPlans(): Promise<ReadingPlan[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reading_plans")
    .select("id, slug, title, description, duration")
    .order("created_at", { ascending: true });

  throwIfSupabaseError(error);
  return data ?? [];
}

export async function enrollUserInPlan(userId: string, planId: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("user_plan_enrollments").upsert(
    {
      user_id: userId,
      plan_id: planId,
      current_day: 1,
      completed: false
    },
    { onConflict: "user_id,plan_id" }
  );

  throwIfSupabaseError(error);

  const { error: cleanupError } = await supabase
    .from("user_plan_enrollments")
    .delete()
    .eq("user_id", userId)
    .neq("plan_id", planId);

  throwIfSupabaseError(cleanupError);
  logEvent("plan_selected", { userId, planId });
}

export async function getUserActivePlan(userId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("user_plan_enrollments")
    .select("id, user_id, plan_id, current_day, completed, started_at, updated_at, reading_plans!inner(id, slug, title, description, duration)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  throwIfSupabaseError(error);
  if (!data) return null;

  const { data: progressDays, error: progressDaysError } = await supabase
    .from("user_progress_days")
    .select("day_number")
    .eq("enrollment_id", data.id)
    .order("day_number", { ascending: true });

  throwIfSupabaseError(progressDaysError);

  return {
    progress: {
      id: data.id,
      user_id: data.user_id,
      plan_id: data.plan_id,
      current_day: data.current_day,
      completed: data.completed,
      started_at: data.started_at,
      updated_at: data.updated_at,
      completed_days: (progressDays ?? []).map((row) => row.day_number)
    },
    plan: Array.isArray(data.reading_plans) ? data.reading_plans[0] : data.reading_plans
  };
}

export async function getCurrentDayReading(planId: string, dayNumber: number): Promise<ReadingPlanDay | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("reading_plan_days")
    .select("id, day_number, passage_reference, passage_text")
    .eq("plan_id", planId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  throwIfSupabaseError(error);
  return data;
}

export async function markDayComplete(userId: string, enrollmentId: string, completedDay: number, totalDays: number) {
  const supabase = createServerSupabaseClient();

  const { error: insertError } = await supabase.from("user_progress_days").upsert(
    {
      enrollment_id: enrollmentId,
      day_number: completedDay
    },
    { onConflict: "enrollment_id,day_number" }
  );

  throwIfSupabaseError(insertError);

  const nextDay = Math.min(totalDays, completedDay + 1);
  const { error: updateError } = await supabase
    .from("user_plan_enrollments")
    .update({
      current_day: nextDay,
      completed: nextDay >= totalDays
    })
    .eq("id", enrollmentId)
    .eq("user_id", userId);

  throwIfSupabaseError(updateError);
  logEvent("progress_completed", { userId, enrollmentId, completedDay });
}
