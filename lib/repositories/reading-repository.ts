import { createServerSupabaseClient } from "@/lib/supabase/server";

const MVP_USER_ID = "00000000-0000-0000-0000-000000000001";

export type ReadingPlan = {
  id: string;
  slug: string;
  title: string;
  description: string;
  duration_days: number;
};

export type UserProgress = {
  id: string;
  user_id: string;
  reading_plan_id: string;
  current_day: number;
  completed_days: number[];
  started_at: string;
  updated_at: string;
};

export type ReadingPlanDay = {
  id: string;
  day_number: number;
  passage_reference: string;
  passage_text: string;
};

export async function getOrCreateMvpUser() {
  const supabase = createServerSupabaseClient();

  const { data: existing, error: fetchError } = await supabase
    .from("users")
    .select("id, created_at")
    .eq("id", MVP_USER_ID)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabase
    .from("users")
    .insert({ id: MVP_USER_ID })
    .select("id, created_at")
    .single();

  if (createError) throw createError;
  return created;
}

export async function listReadingPlans(): Promise<ReadingPlan[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("reading_plans")
    .select("id, slug, title, description, duration_days")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function enrollUserInPlan(userId: string, planId: string) {
  const supabase = createServerSupabaseClient();

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: userId,
      reading_plan_id: planId,
      current_day: 1,
      completed_days: []
    },
    { onConflict: "user_id,reading_plan_id" }
  );

  if (error) throw error;

  const { error: cleanupError } = await supabase
    .from("user_progress")
    .delete()
    .eq("user_id", userId)
    .neq("reading_plan_id", planId);

  if (cleanupError) throw cleanupError;
}

export async function getUserActivePlan(userId: string) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("user_progress")
    .select(
      "id, user_id, reading_plan_id, current_day, completed_days, started_at, updated_at, reading_plans!inner(id, slug, title, description, duration_days)"
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    progress: {
      id: data.id,
      user_id: data.user_id,
      reading_plan_id: data.reading_plan_id,
      current_day: data.current_day,
      completed_days: data.completed_days ?? [],
      started_at: data.started_at,
      updated_at: data.updated_at
    } satisfies UserProgress,
    plan: Array.isArray(data.reading_plans) ? data.reading_plans[0] : data.reading_plans
  };
}

export async function getCurrentDayReading(planId: string, dayNumber: number): Promise<ReadingPlanDay | null> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("reading_plan_days")
    .select("id, day_number, passage_reference, passage_text")
    .eq("reading_plan_id", planId)
    .eq("day_number", dayNumber)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function markDayComplete(progressId: string, completedDay: number, totalDays: number) {
  const supabase = createServerSupabaseClient();

  const { data: progress, error: loadError } = await supabase
    .from("user_progress")
    .select("completed_days")
    .eq("id", progressId)
    .single();

  if (loadError) throw loadError;

  const completedDays = Array.isArray(progress.completed_days)
    ? Array.from(new Set([...(progress.completed_days as number[]), completedDay])).sort((a, b) => a - b)
    : [completedDay];

  const nextDay = Math.min(totalDays, completedDay + 1);

  const { error: updateError } = await supabase
    .from("user_progress")
    .update({
      completed_days: completedDays,
      current_day: nextDay,
      updated_at: new Date().toISOString()
    })
    .eq("id", progressId);

  if (updateError) throw updateError;
}
