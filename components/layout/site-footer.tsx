import Link from "next/link";
import { categories } from "@/lib/categories";
import { SITE_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    // Extra bottom clearance on mobile: tool pages stack a fixed ActionBar
    // (~76px) on top of the fixed bottom tab bar (56px), and the footer is the
    // last thing on the page, so it needs enough padding to fully clear both
    // rather than just the tab bar alone.
    <footer className="mt-auto border-t border-border pb-[calc(132px+env(safe-area-inset-bottom))] md:pb-0">
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 text-sm text-muted-foreground">
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href="/tools" className="hover:text-foreground">
            All Tools
          </Link>
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="hover:text-foreground">
              {c.name}
            </Link>
          ))}
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
        </nav>
        <p className="text-xs">
          © {new Date().getFullYear()} {SITE_NAME}. Free PDF tools that run in your browser.
        </p>
        <p className="text-xs">A product by Faraz Ali Khan</p>
      </div>
    </footer>
  );
}
