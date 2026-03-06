import { prisma } from "@/lib/prisma";
import { generatePassageInsights } from "@/lib/insights/generator";
import type { PassageInsights } from "@/types/insights";

export const normalizeReference = (reference: string) => reference.replace(/\s+/g, " ").trim().toLowerCase();

export async function getOrCreatePassageInsights(reference: string, passageText: string): Promise<PassageInsights> {
  const normalizedReference = normalizeReference(reference);

  const cached = await prisma.passageInsightCache.findUnique({
    where: { normalizedReference }
  });

  if (cached) {
    return {
      historicalContext: cached.historicalContext,
      culturalContext: cached.culturalContext,
      literaryContext: cached.literaryContext,
      keyThemes: cached.keyThemes as string[],
      reflectionQuestion: cached.reflectionQuestion
    };
  }

  const generated = await generatePassageInsights(reference, passageText);

  await prisma.passageInsightCache.create({
    data: {
      normalizedReference,
      historicalContext: generated.historicalContext,
      culturalContext: generated.culturalContext,
      literaryContext: generated.literaryContext,
      keyThemes: generated.keyThemes,
      reflectionQuestion: generated.reflectionQuestion
    }
  });

  return generated;
}
