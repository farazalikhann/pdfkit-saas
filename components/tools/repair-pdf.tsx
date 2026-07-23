"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ClientSideBadge } from "@/components/tool-shell/client-badge";
import { ResultPanel, type ResultFile } from "@/components/tool-shell/result-panel";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import type { RepairResult } from "@/lib/pdf/repair";
import type { ToolDefinition } from "@/lib/tools";

export function RepairPdfTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<RepairResult | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function handleFiles(files: File[]) {
    const f = files[0] ?? null;
    setFile(f);
    setResult(null);
    setState("idle");
    if (f) {
      const risk = checkFileMemoryRisk(f);
      if (risk) toast.warning(risk);
    }
  }

  async function handleRepair() {
    if (!file) return;
    setState("processing");
    setProgress(0);
    setErrorMessage(null);
    try {
      const { repairPdf } = await import("@/lib/pdf/repair");
      const res = await repairPdf(file, setProgress);
      setResult(res);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Repair failed unexpectedly.");
    }
  }

  const results: ResultFile[] | null =
    result?.bytes && result.recoveredPages > 0
      ? [{ name: "repaired.pdf", blob: new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }) }]
      : null;

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
          This is a best-effort recovery, not magic: it can often fix structural
          damage (a broken index, a corrupted trailer) and salvage pages that are
          still readable. It cannot reconstruct data that&apos;s genuinely gone —
          if a page is truly destroyed, it will be left out and we&apos;ll tell you.
        </p>
      </div>

      {state === "done" && result ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            {result.recoveredPages === 0 ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                  <XCircle className="h-7 w-7" />
                </div>
                <h3 className="mt-3 text-lg font-semibold">Nothing could be recovered</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This file is too damaged for this tool to salvage any pages, or it
                  isn&apos;t a valid PDF. We&apos;re not going to hand you back a
                  broken file.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mt-3 text-lg font-semibold">
                  Recovered {result.recoveredPages} of {result.totalPages} pages
                </h3>
                {result.recoveredPages < result.totalPages && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {result.totalPages - result.recoveredPages} page
                    {result.totalPages - result.recoveredPages === 1 ? "" : "s"}{" "}
                    couldn&apos;t be read even in the fallback pass — they&apos;re
                    left out of the repaired file.
                  </p>
                )}
                {result.usedRasterFallback && (
                  <p className="mt-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
                    The document structure was too damaged to preserve as real
                    text/vectors, so recovered pages were rescued as images
                    instead — text on them won&apos;t be selectable.
                  </p>
                )}
              </>
            )}
          </div>

          {results && <ResultPanel tool={tool} results={results} />}

          <button
            type="button"
            onClick={() => {
              setFile(null);
              setResult(null);
              setState("idle");
            }}
            className="mx-auto block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Try another file
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
              <p className="text-sm text-muted-foreground">Attempting recovery…</p>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-3">
              <p className="truncate text-sm font-medium">{file.name}</p>
            </div>
          )}

          {errorMessage && state === "error" && (
            <p className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              {errorMessage}
            </p>
          )}
        </div>
      )}

      {state !== "done" && (
        <ActionBar
          state={!file ? "idle" : state === "idle" ? "ready" : state}
          label="Attempt repair"
          progress={progress}
          onAction={handleRepair}
          disabledReason={!file ? "Upload a PDF to get started" : undefined}
        />
      )}
    </div>
  );
}
