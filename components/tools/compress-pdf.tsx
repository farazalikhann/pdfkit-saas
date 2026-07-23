"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, Check } from "lucide-react";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ClientSideBadge } from "@/components/tool-shell/client-badge";
import { ResultPanel, type ResultFile } from "@/components/tool-shell/result-panel";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatBytes } from "@/lib/utils";
import { useToolWorker } from "@/hooks/use-tool-worker";
import { loadPdfDocument, renderPageToDataUrl } from "@/lib/pdf/thumbnails";
import { toFriendlyPdfLoadError } from "@/lib/pdf/errors";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { PRESETS, PRESET_ORDER, type PresetKey } from "@/lib/pdf/compress/presets";
import { parseTargetSize } from "@/lib/pdf/compress/target-size";
import type { CompressPdfRequest, CompressPdfResult } from "@/lib/workers/compress-pdf.types";
import type { ToolDefinition } from "@/lib/tools";

function createWorker() {
  return new Worker(new URL("../../lib/workers/compress-pdf.worker.ts", import.meta.url));
}

type Mode = "preset" | "target";

async function renderFirstPage(bytes: ArrayBuffer): Promise<string> {
  const pdf = await loadPdfDocument(bytes);
  const rendered = await renderPageToDataUrl(pdf, 1, 0.9, "image/jpeg", 0.85);
  return rendered.dataUrl;
}

export function CompressPdfTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [beforePreview, setBeforePreview] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [mode, setMode] = React.useState<Mode>("preset");
  const [preset, setPreset] = React.useState<PresetKey>("recommended");
  const [targetText, setTargetText] = React.useState("1 MB");
  const [stripMetadata, setStripMetadata] = React.useState(false);

  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [result, setResult] = React.useState<CompressPdfResult | null>(null);
  const [afterPreview, setAfterPreview] = React.useState<string | null>(null);
  const [keepOriginal, setKeepOriginal] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const { run } = useToolWorker<CompressPdfRequest, CompressPdfResult>(createWorker);

  const parsedTarget = mode === "target" ? parseTargetSize(targetText) : null;
  const ready = !loadError && (mode === "preset" || parsedTarget !== null);

  async function handleFiles(files: File[]) {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setAfterPreview(null);
    setKeepOriginal(false);
    setState("idle");
    setLoadError(null);
    setBeforePreview(null);

    const risk = checkFileMemoryRisk(f);
    if (risk) toast.warning(risk);

    try {
      const buffer = await f.arrayBuffer();
      const preview = await renderFirstPage(buffer);
      setBeforePreview(preview);
      setState("ready");
    } catch (err) {
      setLoadError(toFriendlyPdfLoadError(err));
    }
  }

  async function handleCompress() {
    if (!file || !ready) return;
    setState("processing");
    setProgress(0);
    setErrorMessage(null);
    try {
      const fileBuffer = await file.arrayBuffer();
      const modeArg: CompressPdfRequest["mode"] =
        mode === "preset"
          ? { type: "preset", preset }
          : { type: "target-size", targetBytes: parsedTarget! };

      const res = await run({ fileBuffer, mode: modeArg, stripMetadata }, setProgress, [fileBuffer]);
      setResult(res);
      setKeepOriginal(res.compressedSize >= res.originalSize);

      try {
        const preview = await renderFirstPage(res.bytes.slice(0));
        setAfterPreview(preview);
      } catch {
        setAfterPreview(null);
      }
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Compression failed. Please try again.");
      toast.error("Compression failed", {
        description: err instanceof Error ? err.message : "Please try a different file.",
      });
    }
  }

  const reduction =
    result && result.originalSize > 0
      ? Math.round((1 - result.compressedSize / result.originalSize) * 100)
      : 0;

  const results: ResultFile[] | null = React.useMemo(() => {
    if (!result || !file) return null;
    if (keepOriginal) {
      return [{ name: file.name, blob: file }];
    }
    return [
      {
        name: "compressed.pdf",
        blob: new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
      },
    ];
  }, [result, file, keepOriginal]);

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
          Shrinks embedded images (downsample + re-encode) — real vector text is left
          untouched, so it never gets blurry or unselectable.
        </p>
      </div>

      {state === "done" && results ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 text-center">
            <div className="flex items-center justify-center gap-3 text-lg font-bold">
              <span className="text-muted-foreground line-through decoration-2">
                {formatBytes(result!.originalSize)}
              </span>
              <span>→</span>
              <span
                className={
                  reduction > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : reduction < 0
                    ? "text-destructive"
                    : "text-foreground"
                }
              >
                {formatBytes(result!.compressedSize)}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {reduction > 0
                ? `${reduction}% smaller`
                : reduction < 0
                ? `${Math.abs(reduction)}% larger`
                : "no meaningful change"}{" "}
              ·{" "}
              {PRESETS[result!.presetUsed].label} preset
              {mode === "target" && result!.targetMet === false && " (closest achievable)"}
            </p>
            {result!.imagesProcessed > 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                Recompressed {result!.imagesProcessed} image
                {result!.imagesProcessed === 1 ? "" : "s"}
                {result!.imagesSkipped > 0 &&
                  ` · left ${result!.imagesSkipped} untouched (already-optimal or unsupported format)`}
              </p>
            )}
            {result!.imagesProcessed === 0 && (
              <p className="mt-1 text-xs text-muted-foreground">
                No compressible embedded images found — this file may already be optimized,
                or its content is mostly vector text.
              </p>
            )}
          </div>

          {mode === "target" && result!.targetMet === false && (
            <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
              Couldn&apos;t reach your target — {formatBytes(parsedTarget ?? 0)} isn&apos;t
              achievable for this file. {formatBytes(result!.compressedSize)} is the smallest
              this pipeline could produce.
            </p>
          )}

          {result!.compressedSize >= result!.originalSize && (
            <div className="space-y-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <div className="flex items-start gap-2 font-medium">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                This PDF was already efficiently compressed — compressing it again made it
                larger, so the original is kept below.
              </div>
              <label className="flex items-center gap-2 font-normal">
                <input
                  type="checkbox"
                  checked={!keepOriginal}
                  onChange={(e) => setKeepOriginal(!e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Use the compressed version anyway
              </label>
            </div>
          )}

          {afterPreview && beforePreview && (
            <div className="space-y-1.5">
              <Label>Page 1 — before vs after</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={beforePreview} alt="Before" className="w-full rounded-lg border border-border" />
                  <p className="text-center text-[11px] text-muted-foreground">Before</p>
                </div>
                <div className="space-y-1">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={keepOriginal ? beforePreview : afterPreview}
                    alt="After"
                    className="w-full rounded-lg border border-border"
                  />
                  <p className="text-center text-[11px] text-muted-foreground">
                    {keepOriginal ? "Original (kept)" : "Compressed"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <ResultPanel tool={tool} results={results} />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setResult(null);
              setAfterPreview(null);
              setBeforePreview(null);
              setState("idle");
            }}
            className="mx-auto block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Compress another file
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
          ) : loadError ? (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{loadError}</span>
            </div>
          ) : state === "processing" ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
              <ProgressRing progress={progress} />
              <p className="text-sm text-muted-foreground">Compressing {file.name}…</p>
              <div className="w-full max-w-xs space-y-2 px-6">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                {beforePreview && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={beforePreview} alt="Page 1 preview" className="h-16 w-12 rounded border border-border object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Original size: <span className="font-medium text-foreground">{formatBytes(file.size)}</span>
                  </p>
                </div>
              </div>

              <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preset">Choose a preset</TabsTrigger>
                  <TabsTrigger value="target">Target a size</TabsTrigger>
                </TabsList>
              </Tabs>

              {mode === "preset" ? (
                <div className="space-y-2">
                  {PRESET_ORDER.map((key) => {
                    const p = PRESETS[key];
                    const active = preset === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setPreset(key)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                          active ? "border-primary bg-primary/10" : "border-border"
                        )}
                      >
                        <div>
                          <p className={cn("text-sm font-semibold", active && "text-primary")}>{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.hint}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {p.dpi} DPI · Q{Math.round(p.quality * 100)}
                          </span>
                          {active && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="target-size">Target file size</Label>
                  <Input
                    id="target-size"
                    value={targetText}
                    onChange={(e) => setTargetText(e.target.value)}
                    placeholder="e.g. 500 KB or 2 MB"
                  />
                  {targetText.trim() && parsedTarget === null && (
                    <p className="text-xs text-destructive">
                      Enter a size like &quot;500 KB&quot; or &quot;2 MB&quot;.
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll try a few compression levels to land at or just under this
                    size. If it&apos;s not achievable, we&apos;ll tell you the smallest we
                    could get.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <Label htmlFor="strip-meta" className="font-normal">
                  Also strip document metadata (title, author, etc.)
                </Label>
                <Switch id="strip-meta" checked={stripMetadata} onCheckedChange={setStripMetadata} />
              </div>

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
          state={
            !file || loadError || !ready
              ? "idle"
              : state === "idle"
              ? "ready"
              : state
          }
          label="Compress PDF"
          progress={progress}
          onAction={handleCompress}
          disabledReason={
            !file
              ? "Upload a PDF to get started"
              : loadError
              ? undefined
              : !ready
              ? "Enter a valid target size"
              : undefined
          }
        />
      )}
    </div>
  );
}
