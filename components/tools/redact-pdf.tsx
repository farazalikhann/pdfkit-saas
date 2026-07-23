"use client";

import * as React from "react";
import { toast } from "sonner";
import { Square, MousePointer2 } from "lucide-react";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ClientSideBadge } from "@/components/tool-shell/client-badge";
import { ResultPanel, type ResultFile } from "@/components/tool-shell/result-panel";
import { PageEditor } from "@/components/page-editor/page-editor";
import { useElementHistory } from "@/components/page-editor/use-element-history";
import { nextZIndex } from "@/components/page-editor/z-order";
import type { RedactBoxElement } from "@/lib/pdf/edit/redact";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { uid, cn } from "@/lib/utils";
import type { ToolDefinition } from "@/lib/tools";

type Mode = "draw" | "select";

export function RedactPdfTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pickerError, setPickerError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<Mode>("draw");
  const dragStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const [liveBox, setLiveBox] = React.useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);

  const { elements, setElements, undo, redo, canUndo, canRedo } = useElementHistory<RedactBoxElement>([]);

  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<ResultFile[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  function handleFiles(files: File[]) {
    const f = files[0] ?? null;
    setFile(f);
    setElements([], { pushHistory: false });
    setSelectedId(null);
    setResults(null);
    setState("idle");
    if (f) {
      const risk = checkFileMemoryRisk(f);
      if (risk) toast.warning(risk);
    }
  }

  function handleCanvasPointerDown(pt: { x: number; y: number }) {
    if (mode !== "draw") return;
    dragStartRef.current = pt;
    setLiveBox({ start: pt, end: pt });
  }

  function handleCanvasPointerMove(pt: { x: number; y: number }) {
    if (mode !== "draw" || !dragStartRef.current) return;
    setLiveBox({ start: dragStartRef.current, end: pt });
  }

  function handleCanvasPointerUp(pt: { x: number; y: number }) {
    if (mode !== "draw" || !dragStartRef.current) return;
    const start = dragStartRef.current;
    dragStartRef.current = null;
    setLiveBox(null);
    const x = Math.min(start.x, pt.x);
    const y = Math.min(start.y, pt.y);
    const width = Math.abs(pt.x - start.x);
    const height = Math.abs(pt.y - start.y);
    if (width < 6 || height < 6) return;
    const el: RedactBoxElement = {
      id: uid(),
      kind: "redact",
      pageIndex,
      x,
      y,
      width,
      height,
      rotation: 0,
      zIndex: nextZIndex(elements),
    };
    setElements((prev) => [...prev, el]);
  }

  async function handleExport() {
    if (!file) return;
    if (elements.length === 0) {
      toast.error("Draw at least one box over the content you want to redact.");
      return;
    }
    setState("processing");
    setProgress(0.1);
    setErrorMessage(null);
    try {
      const { redactPdf } = await import("@/lib/pdf/edit/redact");
      const bytes = await redactPdf(file, elements, setProgress);
      setProgress(1);
      setResults([{ name: "redacted.pdf", blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }) }]);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Couldn't redact this PDF.");
      toast.error("Redaction failed", { description: err instanceof Error ? err.message : undefined });
    }
  }

  const affectedPages = new Set(elements.map((e) => e.pageIndex)).size;

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
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Any page with a redaction box is converted to an image on export — this is what
          actually destroys the hidden text. Text elsewhere on that page will no longer be
          selectable or searchable.
        </p>
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
            Redact another file
          </button>
        </div>
      ) : !file ? (
        <UploadZone accept={tool.accept} multiple={false} maxFiles={1} onFiles={handleFiles} acceptHint="One file at a time" />
      ) : state === "processing" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
          <ProgressRing progress={progress * 100} />
          <p className="text-sm text-muted-foreground">Rasterizing redacted pages…</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-2">
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => setMode("draw")}
                aria-label="Draw box"
                title="Draw box"
                className={cn(
                  "flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm",
                  mode === "draw" ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground"
                )}
              >
                <Square className="h-4 w-4" />
                Draw
              </button>
              <button
                type="button"
                onClick={() => setMode("select")}
                aria-label="Select"
                title="Select"
                className={cn(
                  "flex h-10 items-center gap-1.5 rounded-lg border px-3 text-sm",
                  mode === "select" ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground"
                )}
              >
                <MousePointer2 className="h-4 w-4" />
                Select
              </button>
            </div>
            {elements.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {elements.length} box{elements.length === 1 ? "" : "es"} · {affectedPages} page{affectedPages === 1 ? "" : "s"}
              </span>
            )}
          </div>

          <PageEditor
            file={file}
            pageIndex={pageIndex}
            onPageIndexChange={setPageIndex}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={(id) => (mode === "select" ? setSelectedId(id) : undefined)}
            onElementChange={(id, rect) =>
              setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...rect } : e)), { pushHistory: false })
            }
            onGestureStart={() => setElements((prev) => prev, { pushHistory: true })}
            onDeleteSelected={() => {
              if (!selectedId) return;
              setElements((prev) => prev.filter((e) => e.id !== selectedId));
              setSelectedId(null);
            }}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            interactionDisabled={mode === "draw"}
            onCanvasPointerDown={handleCanvasPointerDown}
            onCanvasPointerMove={handleCanvasPointerMove}
            onCanvasPointerUp={handleCanvasPointerUp}
            handlesFor={() => ({ resize: true, rotate: false })}
            onError={setPickerError}
            renderElement={() => <div className="h-full w-full bg-black" />}
            overlayContent={(pixelsPerPoint) =>
              liveBox && (
                <div
                  className="pointer-events-none absolute bg-black"
                  style={{
                    left: Math.min(liveBox.start.x, liveBox.end.x) * pixelsPerPoint,
                    top: Math.min(liveBox.start.y, liveBox.end.y) * pixelsPerPoint,
                    width: Math.abs(liveBox.end.x - liveBox.start.x) * pixelsPerPoint,
                    height: Math.abs(liveBox.end.y - liveBox.start.y) * pixelsPerPoint,
                  }}
                />
              )
            }
          />

          {errorMessage && state === "error" && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p>
          )}
        </div>
      )}

      {state !== "done" && file && (
        <ActionBar
          state={pickerError ? "idle" : state === "idle" ? "ready" : state}
          label="Redact & save"
          progress={progress * 100}
          onAction={handleExport}
          disabledReason={pickerError ?? undefined}
        />
      )}
    </div>
  );
}
