"use client";

import { ToolShell } from "@/components/tool-shell/tool-shell";
import type { ToolDefinition } from "@/lib/tools";

export function ExtractDataCsvTool({ tool }: { tool: ToolDefinition }) {
  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Extract to CSV"}
      onProcess={async (files) => {
        const form = new FormData();
        form.append("file", files[0]);

        const res = await fetch("/api/ai/extract", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Extraction failed");

        return [
          {
            name: "data.csv",
            blob: new Blob([data.csv], { type: "text/csv" }),
          },
        ];
      }}
    />
  );
}
