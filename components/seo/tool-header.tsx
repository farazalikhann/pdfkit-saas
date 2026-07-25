import type { ToolDefinition } from "@/lib/tools";

/**
 * The icon + H1 + description block, server-rendered directly in the tool page
 * rather than inside the client-only tool component (which mounts with
 * `ssr: false` because it touches browser-only APIs — canvas, Web Workers,
 * FileReader). Crawlers and link-preview bots that don't execute JS would
 * otherwise never see the page's H1 at all.
 */
export function ToolHeader({ tool }: { tool: ToolDefinition }) {
  return (
    <div className="mx-auto max-w-2xl px-4 pt-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <tool.icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-xl font-bold leading-tight">{tool.h1}</h1>
          <p className="text-sm text-muted-foreground">{tool.description}</p>
        </div>
      </div>
    </div>
  );
}
