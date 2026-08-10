"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wrench, Clock, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

const SIDE_TABS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tools", label: "Tools", icon: Wrench },
] as const;

const RIGHT_TABS = [{ href: "/recent", label: "Recent", icon: Clock }] as const;

export function BottomTabBar() {
  const pathname = usePathname();
  const isMakePdfActive = pathname.startsWith("/tools/make-pdf");

  function renderTab({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: typeof Home;
  }) {
    // "/tools/make-pdf" must NOT also light up the "Tools" tab, it has its
    // own dedicated FAB now, so without this exclusion both the FAB and the
    // adjacent Tools tab render active/red at once, reading as a single
    // smeared red blob instead of two distinct nav items.
    const isActive =
      href === "/"
        ? pathname === "/"
        : href === "/tools"
          ? pathname.startsWith(href) && !pathname.startsWith("/tools/make-pdf")
          : pathname.startsWith(href);
    return (
      <li key={href} className="flex-1">
        <Link
          href={href}
          className={cn(
            "flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium transition-colors",
            isActive ? "text-primary" : "text-muted-foreground active:text-foreground"
          )}
          aria-current={isActive ? "page" : undefined}
        >
          <Icon className={cn("h-5 w-5", isActive && "fill-primary/15")} strokeWidth={isActive ? 2.5 : 2} />
          {label}
        </Link>
      </li>
    );
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-bottom md:hidden"
      aria-label="Primary"
    >
      <ul className="flex items-center">
        {SIDE_TABS.map(renderTab)}

        {/* Make PDF: center FAB, raised above the bar like a primary "create" action.
            Chosen over 4 flat tabs: at 375px, "Home · Tools · Make PDF · Recent" with
            labels crowds each tab under ~90px and buries the app's actual point of
            entry (turning photos into a PDF) as just another equal-weight item. */}
        <li className="flex-1">
          <Link
            href="/tools/make-pdf"
            className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium text-muted-foreground active:text-foreground"
            aria-current={isMakePdfActive ? "page" : undefined}
            // A no-op touch handler: iOS Safari only reliably clears :active
            // styles on elements it considers "interactive enough" to track
            // touch state for; without this, active:scale-95 below can stay
            // stuck at its pressed scale after the tap ends on some devices.
            onTouchStart={() => {}}
          >
            <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95">
              <Camera className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className={cn(isMakePdfActive && "text-primary")}>Make PDF</span>
          </Link>
        </li>

        {RIGHT_TABS.map(renderTab)}
      </ul>
    </nav>
  );
}
