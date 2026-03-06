export function LoadingState({ label = "Preparing your reading..." }: { label?: string }) {
  return (
    <div className="animate-pulse rounded-xl2 border border-charcoal/10 bg-white/60 p-6 shadow-soft">
      <div className="h-4 w-40 rounded bg-charcoal/10" />
      <div className="mt-4 h-3 w-full rounded bg-charcoal/10" />
      <div className="mt-2 h-3 w-5/6 rounded bg-charcoal/10" />
      <p className="mt-6 text-xs text-charcoal/50">{label}</p>
    </div>
  );
}
