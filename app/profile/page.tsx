import { EmptyState } from "@/components/EmptyState";
import { ProgressCard } from "@/components/ProgressCard";
import { getEnrollmentWithPlan } from "@/lib/repositories/reading-repository";

export default async function ProfilePage() {
  const enrollment = await getEnrollmentWithPlan();

  if (!enrollment) {
    return (
      <EmptyState
        title="No progress yet"
        description="Your progress will appear here once you begin a reading plan."
        ctaHref="/plans"
        ctaLabel="Find a plan"
      />
    );
  }

  const completedDays = enrollment.completedDays.length;
  const completionPercentage = Math.round((completedDays / enrollment.plan.duration) * 100);

  return (
    <div className="space-y-8 pt-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate">Profile</p>
        <h1 className="font-serif text-4xl">Your journey</h1>
      </header>

      <ProgressCard
        currentPlan={enrollment.plan.title}
        completionPercentage={completionPercentage}
        completedDays={completedDays}
        totalDays={enrollment.plan.duration}
      />
    </div>
  );
}
