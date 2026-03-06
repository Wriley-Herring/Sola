import { generatePassageInsights } from "@/lib/ai/generate-passage-insights";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PassageInsights } from "@/types/insights";

export const normalizeReference = (reference: string) => reference.replace(/\s+/g, " ").trim().toLowerCase();

type InsightRow = {
  historical_context: string;
  cultural_context: string;
  literary_context: string;
  key_themes: unknown;
  reflection_question: string;
};

function mapInsightRow(row: InsightRow): PassageInsights {
  return {
    historicalContext: row.historical_context,
    culturalContext: row.cultural_context,
    literaryContext: row.literary_context,
    keyThemes: Array.isArray(row.key_themes) ? (row.key_themes as string[]) : [],
    reflectionQuestion: row.reflection_question
  };
}

export async function getOrCreatePassageInsights(reference: string, passageText: string): Promise<PassageInsights> {
  const supabase = createServerSupabaseClient();
  const normalizedReference = normalizeReference(reference);

  const { data: cached, error: cacheError } = await supabase
    .from("passage_insight_cache")
    .select("historical_context, cultural_context, literary_context, key_themes, reflection_question")
    .eq("normalized_reference", normalizedReference)
    .maybeSingle();

  if (cacheError) throw cacheError;
  if (cached) {
    console.info("cache_hit", { normalizedReference });
    return mapInsightRow(cached);
  }

  console.info("cache_miss", { normalizedReference });

  try {
    const generated = await generatePassageInsights(reference, passageText);
    console.info("insight_generated", { normalizedReference });

    const { error: insertError } = await supabase.from("passage_insight_cache").insert({
      normalized_reference: normalizedReference,
      historical_context: generated.historicalContext,
      cultural_context: generated.culturalContext,
      literary_context: generated.literaryContext,
      key_themes: generated.keyThemes,
      reflection_question: generated.reflectionQuestion,
      model: "gpt-5-mini",
      prompt_version: "v1"
    });

    if (!insertError) return generated;

    if (insertError.code === "23505") {
      const { data: retried, error: retryError } = await supabase
        .from("passage_insight_cache")
        .select("historical_context, cultural_context, literary_context, key_themes, reflection_question")
        .eq("normalized_reference", normalizedReference)
        .single();

      if (retryError) throw retryError;

      console.info("duplicate_insert_recovered", { normalizedReference });
      return mapInsightRow(retried);
    }

    throw insertError;
  } catch (error) {
    console.error("generation_error", { normalizedReference, error });
    throw error;
  }
}
