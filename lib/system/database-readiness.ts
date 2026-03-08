import { createServerComponentSupabaseClient } from "@/lib/supabase/server";

export const REQUIRED_TABLES = [
  "users",
  "reading_plans",
  "reading_plan_days",
  "user_plan_enrollments",
  "user_progress_days",
  "passage_insight_cache"
] as const;

const REQUIRED_PLAN_SLUGS = ["life-of-jesus", "foundations-of-scripture", "psalms-for-prayer"] as const;

export type DatabaseReadiness = {
  isReady: boolean;
  missingTables: string[];
  missingSeedData: string[];
};

type SupabaseLikeClient = ReturnType<typeof createServerComponentSupabaseClient>;

type TableReadinessCheckResult = {
  exists: boolean;
  missingTable?: string;
};

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    error.message?.toLowerCase().includes("could not find the table") ||
    error.message?.toLowerCase().includes("schema cache")
  );
}

async function checkTableExists(supabase: SupabaseLikeClient, tableName: string): Promise<TableReadinessCheckResult> {
  const { error } = await supabase.from(tableName).select("*", { count: "exact", head: true });

  if (!error) {
    return { exists: true };
  }

  if (isMissingTableError(error)) {
    return { exists: false, missingTable: tableName };
  }

  throw new Error(`Database readiness check failed for table ${tableName}: ${error.message ?? "unknown error"}`);
}

export async function getDatabaseReadiness(): Promise<DatabaseReadiness> {
  const supabase = createServerComponentSupabaseClient();
  const missingTables: string[] = [];

  for (const tableName of REQUIRED_TABLES) {
    const result = await checkTableExists(supabase, tableName);
    if (!result.exists && result.missingTable) {
      missingTables.push(result.missingTable);
    }
  }

  const missingSeedData: string[] = [];

  if (missingTables.includes("reading_plans")) {
    missingSeedData.push(...REQUIRED_PLAN_SLUGS.map((slug) => `reading_plans:${slug}`));
  } else {
    const { data: plans, error } = await supabase
      .from("reading_plans")
      .select("slug")
      .in("slug", [...REQUIRED_PLAN_SLUGS]);

    if (error) {
      throw new Error(`Database readiness check failed for reading plan seeds: ${error.message ?? "unknown error"}`);
    }

    const existing = new Set((plans ?? []).map((plan) => plan.slug));

    for (const slug of REQUIRED_PLAN_SLUGS) {
      if (!existing.has(slug)) {
        missingSeedData.push(`reading_plans:${slug}`);
      }
    }
  }

  if (missingTables.includes("reading_plan_days")) {
    missingSeedData.push(...REQUIRED_PLAN_SLUGS.map((slug) => `reading_plan_days:${slug}`));
  } else {
    for (const slug of REQUIRED_PLAN_SLUGS) {
      const { data: plan, error: planError } = await supabase
        .from("reading_plans")
        .select("id, duration")
        .eq("slug", slug)
        .maybeSingle();

      if (planError) {
        throw new Error(`Database readiness check failed for plan ${slug}: ${planError.message ?? "unknown error"}`);
      }

      if (!plan) continue;

      const { count, error: daysError } = await supabase
        .from("reading_plan_days")
        .select("id", { count: "exact", head: true })
        .eq("plan_id", plan.id);

      if (daysError) {
        throw new Error(`Database readiness check failed for plan day seeds ${slug}: ${daysError.message ?? "unknown error"}`);
      }

      if ((count ?? 0) < plan.duration) {
        missingSeedData.push(`reading_plan_days:${slug}`);
      }
    }
  }

  return {
    isReady: missingTables.length === 0 && missingSeedData.length === 0,
    missingTables,
    missingSeedData
  };
}
