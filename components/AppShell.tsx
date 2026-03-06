import type { ReactNode } from "react";
import { MobileHeader } from "@/components/MobileHeader";
import { BottomTabBar } from "@/components/BottomTabBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-[#ece7dc] text-charcoal">
      <MobileHeader />
      <main className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5">{children}</main>
      <BottomTabBar />
    </div>
  );
}
