import { EmptyState } from "@/components/EmptyState";
import { PlanCard } from "@/components/PlanCard";
import { listReadingPlans } from "@/lib/repositories/reading-repository";
import { requireAppUserProfile } from "@/lib/auth/get-current-user";

export const dynamic = "force-dynamic";

export default async function PlansPage() {
  await requireAppUserProfile();
  const plans = await listReadingPlans();

  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate">Reading plans</p>
        <h1 className="font-serif text-4xl">Choose your reading path</h1>
        <p className="max-w-xl text-sm text-charcoal/70">Start with one plan and let each day build quiet confidence in the story of Scripture.</p>
      </header>

      {plans.length === 0 ? (
        <EmptyState
          title="No plans available"
          description="Reading plans have not been seeded yet. Run the Supabase seed SQL and refresh."
        />
      ) : (
        <section className="grid gap-4">
          {plans.map((plan) => (
            <PlanCard key={plan.id} id={plan.id} title={plan.title} description={plan.description} duration={plan.duration_days} />
          ))}
        </section>
      )}
    </div>
  );
}
