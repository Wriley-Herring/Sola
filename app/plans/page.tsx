import { PlanCard } from "@/components/PlanCard";
import { getReadingPlans } from "@/lib/repositories/reading-repository";

export default async function PlansPage() {
  const plans = await getReadingPlans();

  return (
    <div className="space-y-6 pt-2">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate">Reading plans</p>
        <h1 className="font-serif text-4xl">Choose your reading path</h1>
        <p className="max-w-xl text-sm text-charcoal/70">Start with one plan and let each day build quiet confidence in the story of Scripture.</p>
      </header>

      <section className="grid gap-4">
        {plans.map((plan) => (
          <PlanCard key={plan.id} id={plan.id} title={plan.title} description={plan.description} duration={plan.duration} />
        ))}
      </section>
    </div>
  );
}
