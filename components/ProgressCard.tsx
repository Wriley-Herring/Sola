export function ProgressCard({
  currentPlan,
  completionPercentage,
  completedDays,
  totalDays
}: {
  currentPlan: string;
  completionPercentage: number;
  completedDays: number;
  totalDays: number;
}) {
  return (
    <section className="rounded-xl2 border border-charcoal/10 bg-white/80 p-6 shadow-soft">
      <p className="text-xs uppercase tracking-[0.2em] text-slate">Current plan</p>
      <h2 className="mt-2 font-serif text-3xl">{currentPlan}</h2>
      <p className="mt-2 text-sm text-charcoal/70">{completedDays} of {totalDays} days completed</p>
      <div className="mt-5 h-2 w-full rounded-full bg-charcoal/10">
        <div className="h-2 rounded-full bg-olive" style={{ width: `${completionPercentage}%` }} />
      </div>
      <p className="mt-2 text-xs text-charcoal/60">{completionPercentage}% complete</p>
    </section>
  );
}
