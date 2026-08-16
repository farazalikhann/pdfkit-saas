import Link from "next/link";
import { Scissors, FileCheck2, Rows3, type LucideIcon } from "lucide-react";

const GUIDES: { href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { href: "/split-pdf", label: "Split PDF", hint: "Three ways to split, pick the one you need", icon: Scissors },
  { href: "/extract-pages-from-pdf", label: "Extract Pages", hint: "Original file stays untouched", icon: FileCheck2 },
  { href: "/split-pdf-by-page-range", label: "By Page Range", hint: "Precise ranges like 1-5, 6-10, 11-20", icon: Rows3 },
];

/** Discoverability links to the split keyword-landing-page cluster, alongside the auto-generated tool grid. */
export function SplitGuides() {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <span aria-hidden>✂️</span>
        More ways to split a PDF
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {GUIDES.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group relative flex min-h-[44px] flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:shadow-sm active:bg-accent"
          >
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: "color-mix(in oklch, var(--cat-organize) 15%, transparent)",
                color: "var(--cat-organize)",
              }}
            >
              <guide.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">{guide.label}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{guide.hint}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
