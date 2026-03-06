"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl2 border border-red-200 bg-red-50 p-6">
      <h2 className="font-serif text-2xl">Something went wrong</h2>
      <p className="mt-2 text-sm text-charcoal/70">Please try again. If this persists, refresh the page.</p>
      <button className="mt-4 rounded-full bg-charcoal px-4 py-2 text-sm text-white" onClick={() => reset()}>
        Try again
      </button>
    </div>
  );
}
