"use client";

import { ToolShell } from "@/components/tool-shell/tool-shell";
import type { ToolDefinition } from "@/lib/tools";

export function SummarizePdfTool({ tool }: { tool: ToolDefinition }) {
  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Summarize with AI"}
      onProcess={async (files) => {
        const form = new FormData();
        form.append("file", files[0]);

        const res = await fetch("/api/ai/summarize", {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Summarization failed");

        return [
          {
            name: "summary.txt",
            blob: new Blob([data.summary], { type: "text/plain" }),
          },
        ];
      }}
    />
  );
}
