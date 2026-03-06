import Link from "next/link";

const links = [
  { href: "/plans", label: "Plans" },
  { href: "/dashboard", label: "Today" },
  { href: "/profile", label: "Progress" }
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-charcoal/10 bg-parchment/90 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6" aria-label="Primary">
        <Link href="/" className="font-serif text-2xl tracking-tight text-charcoal">
          Sola
        </Link>
        <ul className="flex items-center gap-4 text-sm text-charcoal/80 sm:gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="rounded-full px-3 py-1.5 transition hover:bg-charcoal/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
