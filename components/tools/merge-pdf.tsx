"use client";

import { ToolShell } from "@/components/tool-shell/tool-shell";
import { mergePdfs } from "@/lib/pdf/merge";
import type { ToolDefinition } from "@/lib/tools";

export function MergePdfTool({ tool }: { tool: ToolDefinition }) {
  return (
    <ToolShell
      tool={tool}
      canRun={({ files }) => files.length >= 2}
      actionLabel={({ files }) =>
        files.length >= 2 ? `Merge ${files.length} PDFs` : "Add at least 2 PDFs"
      }
      onProcess={async (files) => {
        const bytes = await mergePdfs(files);
        return [
          {
            name: "merged.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
