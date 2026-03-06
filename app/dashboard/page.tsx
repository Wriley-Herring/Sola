import { completeCurrentDayAction } from "@/app/actions";
import { DailyReadingHeader } from "@/components/DailyReadingHeader";
import { EmptyState } from "@/components/EmptyState";
import { InsightAccordion } from "@/components/InsightAccordion";
import { ScriptureCard } from "@/components/ScriptureCard";
import { getOrCreatePassageInsights } from "@/lib/insights/service";
import { getCurrentReadingDay, getEnrollmentWithPlan } from "@/lib/repositories/reading-repository";

export default async function DashboardPage() {
  const enrollment = await getEnrollmentWithPlan();

  if (!enrollment) {
    return (
      <EmptyState
        title="No active plan yet"
        description="Choose a reading plan to begin your daily Scripture rhythm."
        ctaHref="/plans"
        ctaLabel="Browse plans"
      />
    );
  }

  const currentDay = await getCurrentReadingDay(enrollment.id, enrollment.plan.id, enrollment.currentDay);

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

  const insights = await getOrCreatePassageInsights(currentDay.passageReference, currentDay.passageText);

  return (
    <div className="space-y-8 pt-6">
      <DailyReadingHeader
        planTitle={enrollment.plan.title}
        day={currentDay.dayNumber}
        totalDays={enrollment.plan.duration}
        reference={currentDay.passageReference}
      />

      <ScriptureCard passageText={currentDay.passageText} />
      <InsightAccordion insights={insights} />

      <form action={completeCurrentDayAction}>
        <input type="hidden" name="enrollmentId" value={enrollment.id} />
        <input type="hidden" name="dayNumber" value={currentDay.dayNumber} />
        <button
          type="submit"
          className="rounded-full bg-olive px-5 py-3 text-sm text-white transition hover:bg-olive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          Mark day complete
        </button>
      </form>
    </div>
  );
}
