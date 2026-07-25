import type { ReactNode } from "react";
import { TopBar } from "./top-bar";
import { BottomTabBar } from "./bottom-tab-bar";
import { SiteFooter } from "./site-footer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <main className="flex-1 pb-[calc(56px+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <SiteFooter />
      <BottomTabBar />
    </div>
  );
}
