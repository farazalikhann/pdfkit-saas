"use client";

import * as React from "react";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ClientSideBadge } from "@/components/tool-shell/client-badge";
import { ResultPanel, type ResultFile } from "@/components/tool-shell/result-panel";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PagePicker } from "@/components/page-picker/page-picker";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { OCR_LANGUAGES } from "@/lib/ocr/languages";
import type { ToolDefinition } from "@/lib/tools";

export function OcrPdfTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageCount, setPageCount] = React.useState(0);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [lang, setLang] = React.useState("eng");
  const [pickerError, setPickerError] = React.useState<string | null>(null);

  const [state, setState] = React.useState<ActionState>("idle");
  const [statusText, setStatusText] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<ResultFile[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const isMobile = useIsNarrowViewport();

  function handleFiles(files: File[]) {
    const f = files[0] ?? null;
    setFile(f);
    setSelected(new Set());
    setPageCount(0);
    setResults(null);
    setState("idle");
    if (f) {
      const risk = checkFileMemoryRisk(f);
      if (risk) toast.warning(risk);
    }
  }

  async function handleRun() {
    if (!file || selected.size === 0) return;
    setState("processing");
    setProgress(0);
    setStatusText("Preparing…");
    setErrorMessage(null);
    try {
      const { buildSearchablePdf } = await import("@/lib/pdf/ocr/build-searchable-pdf");
      const result = await buildSearchablePdf(file, selected, lang, (p) => {
        if (p.phase === "loading-language") {
          setStatusText("Downloading language data (first time only)…");
          setProgress(p.fraction * 15); // small slice of the bar — the real work is recognition
        } else {
          setStatusText(
            p.ordinal ? `Page ${p.ordinal} of ${p.totalPagesToOcr} selected pages` : "Finishing up…"
          );
          setProgress(15 + p.fraction * 85);
        }
      });

      setResults([
        {
          name: "searchable.pdf",
          blob: new Blob([new Uint8Array(result.pdfBytes)], { type: "application/pdf" }),
        },
        {
          name: "extracted-text.txt",
          blob: new Blob([result.plainText || "(No text was recognized.)"], { type: "text/plain" }),
        },
      ]);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "OCR failed. Please try again.");
      toast.error("OCR failed", {
        description: err instanceof Error ? err.message : "Please try a different file.",
      });
    }
  }

  const ready = selected.size > 0 && !pickerError;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-4 md:pb-16">
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <tool.icon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <ClientSideBadge />
        <p className="text-xs text-muted-foreground">
          Makes scanned pages searchable by placing an invisible text layer over
          them — the visible page is a re-rendered copy of the original, so it may
          look very slightly different at the pixel level. The first OCR run
          downloads a small language model (~15MB); it&apos;s cached after that.
        </p>
        {isMobile && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
            <Smartphone className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            OCR is slow on phones — for large files, OCR just a few pages here, or
            switch to a desktop browser.
          </div>
        )}
      </div>

      {state === "done" && results ? (
        <div className="space-y-3">
          <ResultPanel tool={tool} results={results} />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setResults(null);
              setState("idle");
            }}
            className="mx-auto block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            OCR another file
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {!file ? (
            <UploadZone
              accept={tool.accept}
              multiple={false}
              maxFiles={1}
              onFiles={handleFiles}
              acceptHint="One file at a time"
            />
          ) : state === "processing" ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
              <ProgressRing progress={progress} />
              <p className="text-sm font-medium text-muted-foreground">{statusText}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select value={lang} onValueChange={setLang}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OCR_LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <PagePicker
                mode="select"
                file={file}
                selected={selected}
                onSelectedChange={setSelected}
                variant="default"
                onPageCountChange={(count) => {
                  setPageCount(count);
                  setSelected((prev) => (prev.size === 0 ? new Set(Array.from({ length: count }, (_, i) => i + 1)) : prev));
                }}
                onError={setPickerError}
              />

              {errorMessage && state === "error" && (
                <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorMessage}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {state !== "done" && (
        <ActionBar
          state={!file ? "idle" : !ready ? "idle" : state === "idle" ? "ready" : state}
          label={
            selected.size > 0 && selected.size !== pageCount
              ? `OCR ${selected.size} of ${pageCount} pages`
              : "OCR this PDF"
          }
          progress={progress}
          onAction={handleRun}
          disabledReason={!file ? "Upload a PDF to get started" : !ready ? "Select at least one page" : undefined}
        />
      )}
    </div>
  );
}

function useIsNarrowViewport(): boolean {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    setNarrow(mql.matches);
    const listener = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mql.addEventListener("change", listener);
    return () => mql.removeEventListener("change", listener);
  }, []);
  return narrow;
}
