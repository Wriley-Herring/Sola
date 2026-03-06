import { EmptyState } from "@/components/EmptyState";
import { ProgressCard } from "@/components/ProgressCard";
import { getOrCreateMvpUser, getUserActivePlan } from "@/lib/repositories/reading-repository";
export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getOrCreateMvpUser();
  const active = await getUserActivePlan(user.id);

  if (!active) {
    return (
      <EmptyState
        title="No progress yet"
        description="Your progress will appear here once you begin a reading plan."
        ctaHref="/plans"
        ctaLabel="Find a plan"
      />
    );
  }

  const completedDays = active.progress.completed_days.length;
  const completionPercentage = Math.round((completedDays / active.plan.duration_days) * 100);

  return (
    <div className="space-y-8 pt-2">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate">Progress</p>
        <h1 className="font-serif text-4xl">Your rhythm</h1>
      </header>

      <ProgressCard
        currentPlan={active.plan.title}
        completionPercentage={completionPercentage}
        completedDays={completedDays}
        totalDays={active.plan.duration_days}
      />
    </div>
  );
}
