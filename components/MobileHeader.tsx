import Link from "next/link";

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-charcoal/10 bg-parchment/90 backdrop-blur supports-[backdrop-filter]:bg-parchment/75">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4 pt-[max(env(safe-area-inset-top),0px)]">
        <Link href="/today" className="font-serif text-3xl tracking-tight text-charcoal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/60 rounded-md px-1">
          Sola
        </Link>
        <p className="text-xs uppercase tracking-[0.2em] text-slate">Daily Scripture</p>
      </div>
    </header>
  );
}
