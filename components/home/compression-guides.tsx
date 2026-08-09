import Link from "next/link";
import { Minimize2 } from "lucide-react";

const GUIDES = [
  { href: "/compress-pdf", label: "Compress PDF", hint: "Presets or an exact size" },
  { href: "/compress-pdf-to-100kb", label: "To 100KB", hint: "For strict portal caps" },
  { href: "/compress-pdf-to-200kb", label: "To 200KB", hint: "For exam & university forms" },
] as const;

/** Discoverability links to the compression keyword-landing-page cluster, alongside the auto-generated tool grid. */
export function CompressionGuides() {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <span aria-hidden>📏</span>
        Compress to an exact size
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
                backgroundColor: "color-mix(in oklch, var(--cat-optimize) 15%, transparent)",
                color: "var(--cat-optimize)",
              }}
            >
              <Minimize2 className="h-5 w-5" />
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
