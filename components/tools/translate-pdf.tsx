"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ServerSideNotice } from "@/components/tool-shell/client-badge";
import { OcrFallbackPrompt } from "@/components/tools/ocr-fallback-prompt";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTextExtraction } from "@/lib/ai/use-text-extraction";
import { downloadBlob } from "@/lib/utils";
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
  const [file, setFile] = React.useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = React.useState("auto");
  const [targetLanguage, setTargetLanguage] = React.useState<string>("English");

  const extraction = useTextExtraction(LIMITS);
  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [translation, setTranslation] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function handleFiles(files: File[]) {
    const f = files[0] ?? null;
    setFile(f);
    setTranslation(null);
    setErrorMessage(null);
    setState("idle");
    extraction.reset();
  }

  async function runTranslate(text: string) {
    setState("processing");
    setProgress(0.9);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Translation failed");
      setTranslation(data.translation);
      setProgress(1);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      toast.error("Couldn't translate this file", {
        description: err instanceof Error ? err.message : undefined,
      });
    }
  }

  async function handleTranslate() {
    if (!file) return;
    setErrorMessage(null);
    const text = await extraction.start(file);
    if (text) await runTranslate(text);
  }

  async function handleRunOcr() {
    const text = await extraction.runOcr();
    if (text) await runTranslate(text);
  }

  const isReading = extraction.phase === "extracting" || extraction.phase === "ocr-running";
  const isBusy = isReading || state === "processing";
  const busyLabel = isReading ? extraction.statusText : "Translating…";
  const busyProgress = isReading ? extraction.progress * 100 : progress * 100;
  const displayError =
    state === "error" ? errorMessage : extraction.phase === "error" ? extraction.error : null;

  function downloadTxt() {
    if (!translation) return;
    downloadBlob(
      new Blob([translation], { type: "text/plain" }),
      `translation-${targetLanguage.toLowerCase().replace(/\s+/g, "-")}.txt`
    );
  }

  async function downloadPdf() {
    if (!translation) return;
    // Rendered via the same HTML->PDF pipeline used elsewhere on the site
    // (html2canvas + jsPDF) rather than pdf-lib's built-in fonts, which only
    // cover Latin/WinAnsi text — that would silently mangle Hindi, Arabic,
    // Bengali, Russian, Urdu, or Japanese output. Rasterizing through the
    // browser's own font stack renders whatever script is actually there.
    const { renderHtmlToPdf } = await import("@/lib/pdf/html-to-pdf-render");
    const html =
      `<pre style="white-space:pre-wrap;word-break:break-word;font-family:sans-serif;font-size:13px;line-height:1.7;margin:0;">` +
      escapeHtml(translation) +
      `</pre>`;
    const bytes = await renderHtmlToPdf(html, {
      pageSize: "a4",
      orientation: "portrait",
      marginMm: 20,
      footer: { showPageNumbers: true },
    });
    downloadBlob(
      new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
      `translation-${targetLanguage.toLowerCase().replace(/\s+/g, "-")}.pdf`
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-4 md:pb-16">
      <div className="mb-4 space-y-2">
        <ServerSideNotice>
          This tool sends your document&apos;s text to Google&apos;s Gemini API for
          processing. See our{" "}
          <Link href="/privacy" className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </ServerSideNotice>
      </div>

      {!file ? (
        <UploadZone accept={tool.accept} multiple={false} maxFiles={1} onFiles={handleFiles} acceptHint="One file at a time" />
      ) : isBusy ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
          <ProgressRing progress={busyProgress} />
          <p className="text-sm text-muted-foreground">{busyLabel}</p>
        </div>
      ) : extraction.phase === "needs-ocr" ? (
        <OcrFallbackPrompt
          onRunOcr={handleRunOcr}
          onCancel={() => {
            setFile(null);
            extraction.reset();
          }}
        />
      ) : translation ? (
        <div className="space-y-4">
          <div className="whitespace-pre-wrap rounded-xl border border-border bg-card p-4 text-sm leading-relaxed">
            {translation}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={downloadTxt}>
              Download .txt
            </Button>
            <Button className="flex-1" onClick={downloadPdf}>
              Download PDF
            </Button>
          </div>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setTranslation(null);
              setState("idle");
            }}
            className="mx-auto block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Translate another file
          </button>
        </div>
      ) : (
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
      )}

      {displayError && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{displayError}</p>
      )}

      {state !== "done" && file && extraction.phase !== "needs-ocr" && !isBusy && (
        <ActionBar
          state={state === "idle" ? "ready" : state}
          label="Translate with AI"
          progress={progress * 100}
          onAction={handleTranslate}
        />
      )}
    </div>
  );
}
