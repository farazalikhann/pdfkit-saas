import type { LucideIcon } from "lucide-react";

/**
 * Like ToolHeader, but for keyword landing pages whose H1/description are
 * written for a specific search intent rather than pulled from ToolDefinition.
 */
export function LandingHeader({
  icon: Icon,
  h1,
  description,
}: {
  icon: LucideIcon;
  h1: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold leading-tight">{h1}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
