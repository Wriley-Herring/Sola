import Link from "next/link";

const features = [
  {
    title: "Daily reading plans",
    body: "Move through Scripture with structure that feels spacious, not rushed."
  },
  {
    title: "Layered context",
    body: "Unfold historical, cultural, and literary insight without overwhelming your reading."
  },
  {
    title: "Saved progress",
    body: "Pick up where you left off with a gentle rhythm that respects real life."
  }
];

export default function HomePage() {
  return (
    <div className="space-y-16 pb-8 pt-8 sm:space-y-24 sm:pt-16">
      <section className="space-y-6 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-slate">Context-first Bible study</p>
        <h1 className="mx-auto max-w-3xl font-serif text-5xl leading-tight sm:text-6xl">Read Scripture slowly, with wisdom that meets the moment.</h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-charcoal/75 sm:text-lg">
          Sola pairs daily readings with calm, layered insight so understanding grows alongside devotion.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/plans" className="rounded-full bg-charcoal px-6 py-3 text-sm text-white transition hover:bg-charcoal/90">
            Start your plan
          </Link>
          <Link href="/dashboard" className="rounded-full border border-charcoal/20 px-6 py-3 text-sm text-charcoal hover:bg-white/60">
            View today
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-xl2 border border-charcoal/10 bg-white/70 p-6 shadow-soft">
            <h2 className="font-serif text-2xl">{feature.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-charcoal/70">{feature.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
