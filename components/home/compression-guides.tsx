import Link from "next/link";
import { Minimize2, Mail, ScanText, BadgeCheck, HardDrive, type LucideIcon } from "lucide-react";

const GUIDES: { href: string; label: string; hint: string; icon: LucideIcon }[] = [
  { href: "/compress-pdf", label: "Compress PDF", hint: "Presets or an exact size", icon: Minimize2 },
  { href: "/compress-pdf-to-100kb", label: "To 100KB", hint: "For strict portal caps", icon: Minimize2 },
  { href: "/compress-pdf-to-200kb", label: "To 200KB", hint: "For exam & university forms", icon: Minimize2 },
  { href: "/compress-pdf-to-500kb", label: "To 500KB", hint: "For scanned reports & portfolios", icon: Minimize2 },
  { href: "/compress-pdf-to-1mb", label: "To 1MB", hint: "For job & university uploads", icon: Minimize2 },
  { href: "/compress-pdf-for-email", label: "For Email", hint: "Fit Gmail & Outlook limits", icon: Mail },
  { href: "/compress-scanned-pdf", label: "Scanned PDF", hint: "Keep text readable at the right DPI", icon: ScanText },
  { href: "/compress-pdf-without-losing-quality", label: "Without Losing Quality", hint: "The honest lossless vs lossy breakdown", icon: BadgeCheck },
  { href: "/compress-large-pdf", label: "Large PDF Files", hint: "No 10MB or 20MB upload cap", icon: HardDrive },
];

/** Discoverability links to the compression keyword-landing-page cluster, alongside the auto-generated tool grid. */
export function CompressionGuides() {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-base font-bold">
        <span aria-hidden>📏</span>
        More ways to compress a PDF
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
