import { completeCurrentDayAction } from "@/app/actions";
import { DailyReadingHeader } from "@/components/DailyReadingHeader";
import { EmptyState } from "@/components/EmptyState";
import { InsightAccordion } from "@/components/InsightAccordion";
import { ScriptureCard } from "@/components/ScriptureCard";
import { getOrCreatePassageInsights } from "@/lib/insights/service";
import {
  getCurrentDayReading,
  getOrCreateMvpUser,
  getUserActivePlan
} from "@/lib/repositories/reading-repository";

export default async function TodayPage() {
  const user = await getOrCreateMvpUser();
  const active = await getUserActivePlan(user.id);

  if (!active) {
    return (
      <EmptyState
        title="No active plan yet"
        description="Choose a reading plan to begin your daily Scripture rhythm."
        ctaHref="/plans"
        ctaLabel="Browse plans"
      />
    );
  }

  const currentDay = await getCurrentDayReading(active.plan.id, active.progress.current_day);

  if (!currentDay) {
    return (
      <EmptyState
        title="Plan complete"
        description="You have reached the end of this plan. Start another one to continue reading."
        ctaHref="/plans"
        ctaLabel="Start another plan"
      />
    );
  }

  const insights = await getOrCreatePassageInsights(currentDay.passage_reference, currentDay.passage_text);

  return (
    <div className="space-y-8 pt-2">
      <DailyReadingHeader
        planTitle={active.plan.title}
        day={currentDay.day_number}
        totalDays={active.plan.duration_days}
        reference={currentDay.passage_reference}
      />

      <ScriptureCard passageText={currentDay.passage_text} />
      <InsightAccordion insights={insights} />

      <form action={completeCurrentDayAction}>
        <input type="hidden" name="progressId" value={active.progress.id} />
        <input type="hidden" name="dayNumber" value={currentDay.day_number} />
        <button
          type="submit"
          className="rounded-2xl bg-olive px-5 py-3.5 text-base font-medium text-white transition hover:bg-olive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Mark today complete
        </button>
      </form>
    </div>
  );
}
