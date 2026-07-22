"use client";

import { toast } from "sonner";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { validateDocx } from "@/lib/files/validate-file";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { useToolWorker } from "@/hooks/use-tool-worker";
import type { WordToPdfRequest, WordToPdfResult } from "@/lib/workers/word-to-pdf.types";
import type { ToolDefinition } from "@/lib/tools";

function createWorker() {
  return new Worker(new URL("../../lib/workers/word-to-pdf.worker.ts", import.meta.url));
}

export function WordToPdfTool({ tool }: { tool: ToolDefinition }) {
  const { run } = useToolWorker<WordToPdfRequest, WordToPdfResult>(createWorker);

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Convert to PDF"}
      onFilesChange={(files) => {
        const file = files[0];
        if (!file) return;
        const risk = checkFileMemoryRisk(file);
        if (risk) toast.warning(risk);
      }}
      notice={() => (
        <p className="text-xs text-muted-foreground">
          Preserves headings, bold/italic, lists, tables and images. Complex
          layouts, columns, and text boxes won&apos;t survive. Links are shown
          styled but aren&apos;t clickable in the exported PDF.
        </p>
      )}
      onProcess={async (files, reportProgress) => {
        await validateDocx(files[0]);
        const fileBuffer = await files[0].arrayBuffer();
        const result = await run({ fileBuffer }, reportProgress, [fileBuffer]);

        return [
          {
            name: "converted.pdf",
            blob: new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
