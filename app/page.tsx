import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[calc(100dvh-11rem)] flex-col justify-between gap-10 py-3">
      <section className="space-y-5 pt-4">
        <p className="text-xs uppercase tracking-[0.25em] text-slate">Context-first Bible study</p>
        <h1 className="max-w-sm font-serif text-5xl leading-[1.05] text-charcoal">Understand Scripture one quiet day at a time.</h1>
        <p className="max-w-md text-base leading-relaxed text-charcoal/75">
          Sola pairs daily readings with layered insight so you can read deeply without feeling overloaded.
        </p>
      </section>

      <section className="space-y-3">
        <Link
          href="/plans"
          className="block w-full rounded-2xl bg-charcoal px-5 py-4 text-center text-base font-medium text-white shadow-soft transition hover:bg-charcoal/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/60"
        >
          Choose a reading plan
        </Link>
        <Link
          href="/today"
          className="block w-full rounded-2xl border border-charcoal/15 bg-white/60 px-5 py-4 text-center text-base text-charcoal transition hover:bg-white"
        >
          Continue today&apos;s reading
        </Link>
      </section>
    </div>
  );
}
