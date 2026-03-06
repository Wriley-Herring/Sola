import type { PassageInsights } from "@/types/insights";
import { ExpandableInsightCard } from "@/components/ExpandableInsightCard";

export function InsightAccordion({ insights }: { insights: PassageInsights }) {
  return (
    <section className="space-y-3" aria-label="Passage insights">
      <h2 className="font-serif text-2xl">Layered context</h2>
      <ExpandableInsightCard title="Historical Context" defaultOpen>
        {insights.historicalContext}
      </ExpandableInsightCard>
      <ExpandableInsightCard title="Cultural Context">{insights.culturalContext}</ExpandableInsightCard>
      <ExpandableInsightCard title="Literary Context">{insights.literaryContext}</ExpandableInsightCard>
      <ExpandableInsightCard title="Key Themes">{insights.keyThemes.join(" • ")}</ExpandableInsightCard>
      <ExpandableInsightCard title="Reflection Question">{insights.reflectionQuestion}</ExpandableInsightCard>
    </section>
  );
}
