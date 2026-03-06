import { generatePassageInsights } from "@/lib/insights/generator";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PassageInsights } from "@/types/insights";

export const normalizeReference = (reference: string) => reference.replace(/\s+/g, " ").trim().toLowerCase();

function mapInsightRow(row: {
  historical_context: string;
  cultural_context: string;
  literary_context: string;
  key_themes: unknown;
  reflection_question: string;
}): PassageInsights {
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
    .eq("normalized_passage_reference", normalizedReference)
    .maybeSingle();

  if (cacheError) throw cacheError;
  if (cached) return mapInsightRow(cached);

  const generated = await generatePassageInsights(reference, passageText);

  const { error: insertError } = await supabase.from("passage_insight_cache").insert({
    normalized_passage_reference: normalizedReference,
    historical_context: generated.historicalContext,
    cultural_context: generated.culturalContext,
    literary_context: generated.literaryContext,
    key_themes: generated.keyThemes,
    reflection_question: generated.reflectionQuestion
  });

  if (!insertError) return generated;

  if (insertError.code === "23505") {
    const { data: retried, error: retryError } = await supabase
      .from("passage_insight_cache")
      .select("historical_context, cultural_context, literary_context, key_themes, reflection_question")
      .eq("normalized_passage_reference", normalizedReference)
      .single();

    if (retryError) throw retryError;
    return mapInsightRow(retried);
  }

  throw insertError;
}
