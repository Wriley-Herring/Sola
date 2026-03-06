import Link from "next/link";

type EmptyStateProps = {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export function EmptyState({ title, description, ctaHref, ctaLabel }: EmptyStateProps) {
  return (
    <section className="rounded-xl2 border border-dashed border-charcoal/20 bg-white/40 p-8 text-center">
      <h2 className="font-serif text-3xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal/70">{description}</p>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref} className="mt-6 inline-block rounded-full bg-charcoal px-5 py-2.5 text-sm text-white">
          {ctaLabel}
        </Link>
      ) : null}
    </section>
  );
}
