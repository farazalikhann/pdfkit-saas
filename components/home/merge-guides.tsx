import Link from "next/link";
import { Combine, ShieldCheck, Images, type LucideIcon } from "lucide-react";

const GUIDES: { href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { href: "/merge-pdf", label: "Merge PDF", hint: "Combine up to 50 files at once", icon: Combine },
  { href: "/merge-pdf-without-losing-quality", label: "Without Losing Quality", hint: "Merging is not compression, here is why", icon: ShieldCheck },
  { href: "/combine-pdf-and-images", label: "PDF + Photos", hint: "Combine scans, screenshots, and PDFs", icon: Images },
];

/** Discoverability links to the merge keyword-landing-page cluster, alongside the auto-generated tool grid. */
export function MergeGuides() {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <span aria-hidden>🔗</span>
        More ways to merge a PDF
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
