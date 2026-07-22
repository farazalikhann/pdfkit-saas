"use client";

import Link from "next/link";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { ServerSideNotice } from "@/components/tool-shell/client-badge";
import { extractPdfText } from "@/lib/pdf/extract-text";
import type { ToolDefinition } from "@/lib/tools";

const LIMITS = { maxPages: 50, maxCharacters: 100_000 };

export function SummarizePdfTool({ tool }: { tool: ToolDefinition }) {
  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Summarize with AI"}
      notice={() => (
        <ServerSideNotice>
          This tool sends your document&apos;s text to Google&apos;s Gemini API for
          processing. See our{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </ServerSideNotice>
      )}
      onProcess={async (files, reportProgress) => {
        // Extraction happens entirely in the browser — only the resulting text
        // (never the file) is sent to the server.
        const { text } = await extractPdfText(files[0], LIMITS, (fraction) =>
          reportProgress(fraction * 0.7)
        );

        if (!text.trim()) {
          throw new Error(
            "Couldn't find any text in this PDF — it may be a scanned image without OCR."
          );
        }

        const res = await fetch("/api/ai/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        reportProgress(1);
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
