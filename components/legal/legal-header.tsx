import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** Shared back-link + H1 + subtitle header, matching the existing site's legal-page style. */
export function LegalHeader({
  title,
  subtitle,
  lastUpdated,
}: {
  title: string;
  subtitle: string;
  lastUpdated?: string;
}) {
  return (
    <>
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        {lastUpdated && (
          <p className="mt-2 text-xs text-muted-foreground">{lastUpdated}</p>
        )}
      </div>
    </>
  );
}
