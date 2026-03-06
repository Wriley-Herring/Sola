"use client";

import { useState } from "react";

export function ExpandableInsightCard({ title, children, defaultOpen = false }: { title: string; children: string; defaultOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <article className="rounded-xl2 border border-charcoal/10 bg-white/70 shadow-soft">
      <button
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-charcoal">{title}</span>
        <span className="text-sm text-slate">{isOpen ? "Hide" : "Open"}</span>
      </button>
      {isOpen ? <p className="border-t border-charcoal/10 px-5 pb-5 pt-4 text-sm leading-7 text-charcoal/80">{children}</p> : null}
    </article>
  );
}
