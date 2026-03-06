export function DailyReadingHeader({
  planTitle,
  day,
  totalDays,
  reference
}: {
  planTitle: string;
  day: number;
  totalDays: number;
  reference: string;
}) {
  return (
    <section className="space-y-3">
      <p className="text-xs uppercase tracking-[0.2em] text-slate">{planTitle}</p>
      <h1 className="font-serif text-4xl text-charcoal sm:text-5xl">{reference}</h1>
      <p className="text-sm text-charcoal/70">Day {day} of {totalDays}</p>
    </section>
  );
}
