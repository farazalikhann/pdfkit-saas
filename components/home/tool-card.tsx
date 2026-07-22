import Link from "next/link";
import { Lock } from "lucide-react";
import type { ToolDefinition } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className={cn(
        "group relative flex min-h-[44px] flex-col gap-2.5 rounded-2xl border border-border bg-card p-4 transition-colors active:bg-accent",
        "hover:border-primary/40 hover:shadow-sm"
      )}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in oklch, var(--cat-${tool.category}) 15%, transparent)`,
          color: `var(--cat-${tool.category})`,
        }}
      >
        <tool.icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold leading-tight">{tool.shortName}</p>
        {tool.isClientSide && (
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Lock className="h-3 w-3" />
            On-device
          </span>
        )}
      </div>
    </Link>
  );
}
