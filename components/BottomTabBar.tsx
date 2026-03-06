"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const tabs = [
  { href: "/today", label: "Today" },
  { href: "/plans", label: "Plans" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" }
];

export function BottomTabBar() {
  const pathname = usePathname();

  const hiddenRoutes = ["/", "/login", "/auth/callback"];

  if (hiddenRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return null;
  }

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-charcoal/10 bg-parchment/95 backdrop-blur supports-[backdrop-filter]:bg-parchment/80"
    >
      <ul className="mx-auto grid h-16 w-full max-w-2xl grid-cols-4 px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <li key={tab.href} className="flex">
              <Link
                href={tab.href}
                className={clsx(
                  "flex w-full items-center justify-center rounded-xl text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive/60",
                  active ? "bg-charcoal text-white shadow-soft" : "text-charcoal/75 hover:bg-charcoal/5"
                )}
                aria-current={active ? "page" : undefined}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
