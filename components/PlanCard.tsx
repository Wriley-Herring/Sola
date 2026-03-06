import { selectPlanAction } from "@/app/actions";

type PlanCardProps = {
  id: string;
  title: string;
  description: string;
  duration: number;
};

export function PlanCard({ id, title, description, duration }: PlanCardProps) {
  return (
    <article className="rounded-[1.4rem] border border-charcoal/10 bg-white/75 p-6 shadow-soft">
      <p className="text-xs uppercase tracking-[0.2em] text-slate">Reading plan</p>
      <h3 className="mt-3 font-serif text-[2rem] leading-tight text-charcoal">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-charcoal/75">{description}</p>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="rounded-full bg-olive/10 px-3 py-1 text-xs font-medium text-olive">{duration} days</span>
        <form action={selectPlanAction}>
          <input type="hidden" name="planId" value={id} />
          <button
            type="submit"
            className="rounded-xl bg-charcoal px-4 py-3 text-sm text-white transition hover:bg-charcoal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            aria-label={`Start the ${title} plan`}
          >
            Start plan
          </button>
        </form>
      </div>
    </article>
  );
}
