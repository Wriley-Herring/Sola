import type { ReactNode } from "react";
import { TopNav } from "@/components/TopNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-[#efeae0]">
      <TopNav />
      <main className="mx-auto w-full max-w-5xl px-4 pb-20 pt-8 sm:px-6">{children}</main>
    </div>
  );
}
