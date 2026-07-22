"use client";

import { Sparkles } from "lucide-react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import type { ToolDefinition } from "@/lib/tools";

export function GenericTool({
  tool,
  categoryName,
}: {
  tool: ToolDefinition;
  categoryName: string;
}) {
  return (
    <ToolShell
      tool={tool}
      actionLabel={() => `Run ${tool.name}`}
      options={() => (
        <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {tool.name} options will appear here once this {categoryName}{" "}
            tool ships. The upload flow, preview and result screen already
            work end-to-end — only the transformation itself is pending.
          </p>
        </div>
      )}
      onProcess={async () => {
        // TODO: implement processing for this tool.
        // Swap this rejection for the real transformation, e.g.:
        //   const bytes = await someLib.transform(files[0], options);
        //   return [{ name: tool.resultFileName, blob: new Blob([bytes]) }];
        throw new Error(
          `${tool.name} is coming soon — this tool isn't implemented in the demo yet.`
        );
      }}
    />
  );
}
