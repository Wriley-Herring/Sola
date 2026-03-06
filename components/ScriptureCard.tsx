export function ScriptureCard({ passageText }: { passageText: string }) {
  return (
    <section className="rounded-xl2 border border-charcoal/10 bg-white/80 p-6 shadow-soft sm:p-8">
      <h2 className="mb-5 font-serif text-2xl text-charcoal">Scripture</h2>
      <div className="prose-scripture whitespace-pre-line">{passageText}</div>
    </section>
  );
}
