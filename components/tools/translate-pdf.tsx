"use client";

import * as React from "react";
import Link from "next/link";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { ServerSideNotice } from "@/components/tool-shell/client-badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { extractPdfText } from "@/lib/pdf/extract-text";
import type { ResultFile } from "@/components/tool-shell/result-panel";
import type { ToolDefinition } from "@/lib/tools";

const LIMITS = { maxPages: 50, maxCharacters: 100_000 };

const LANGUAGES = [
  "English",
  "Hindi",
  "Spanish",
  "Arabic",
  "French",
  "Mandarin Chinese",
  "Bengali",
  "Portuguese",
  "Russian",
  "Urdu",
  "Indonesian",
  "German",
  "Japanese",
] as const;

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function TranslatePdfTool({ tool }: { tool: ToolDefinition }) {
  const [sourceLanguage, setSourceLanguage] = React.useState("auto");
  const [targetLanguage, setTargetLanguage] = React.useState<string>("English");
  const [alsoMakePdf, setAlsoMakePdf] = React.useState(false);

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Translate with AI"}
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
      options={() => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Source language</Label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Translate to</Label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={alsoMakePdf} onCheckedChange={(v) => setAlsoMakePdf(v === true)} />
            Also generate a PDF of the translation
          </label>
        </div>
      )}
      onProcess={async (files, reportProgress) => {
        // Extraction happens entirely in the browser — only the resulting text
        // (never the file) is sent to the server.
        const { text } = await extractPdfText(files[0], LIMITS, (fraction) =>
          reportProgress(fraction * 0.5)
        );

        if (!text.trim()) {
          throw new Error(
            "Couldn't find any text in this PDF — it may be a scanned image without OCR."
          );
        }

        const res = await fetch("/api/ai/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            targetLanguage,
            sourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
          }),
        });
        reportProgress(0.7);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Translation failed");

        const results: ResultFile[] = [
          {
            name: `translation-${targetLanguage.toLowerCase().replace(/\s+/g, "-")}.txt`,
            blob: new Blob([data.translation], { type: "text/plain" }),
          },
        ];

        if (alsoMakePdf) {
          // Rendered via the same HTML->PDF pipeline used elsewhere on the site
          // (html2canvas + jsPDF) rather than pdf-lib's built-in fonts, which only
          // cover Latin/WinAnsi text — that would silently mangle Hindi, Arabic,
          // Bengali, Russian, Urdu, or Japanese output. Rasterizing through the
          // browser's own font stack renders whatever script is actually there.
          const { renderHtmlToPdf } = await import("@/lib/pdf/html-to-pdf-render");
          const html =
            `<pre style="white-space:pre-wrap;word-break:break-word;font-family:sans-serif;font-size:13px;line-height:1.7;margin:0;">` +
            escapeHtml(data.translation) +
            `</pre>`;
          const pdfBytes = await renderHtmlToPdf(
            html,
            { pageSize: "a4", orientation: "portrait", marginMm: 20 },
            (fraction) => reportProgress(0.7 + fraction * 0.3)
          );
          results.push({
            name: `translation-${targetLanguage.toLowerCase().replace(/\s+/g, "-")}.pdf`,
            blob: new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" }),
          });
        }

        reportProgress(1);
        return results;
      }}
    />
  );
}
