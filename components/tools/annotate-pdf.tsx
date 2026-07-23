"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Pencil,
  Highlighter as HighlighterIcon,
  Square,
  Circle,
  Minus,
  ArrowUpRight,
  StickyNote,
  TextSelect,
  Eraser,
  MousePointer2,
} from "lucide-react";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ClientSideBadge } from "@/components/tool-shell/client-badge";
import { ResultPanel, type ResultFile } from "@/components/tool-shell/result-panel";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PageEditor } from "@/components/page-editor/page-editor";
import { useElementHistory } from "@/components/page-editor/use-element-history";
import { nextZIndex } from "@/components/page-editor/z-order";
import type { Rect } from "@/components/page-editor/types";
import type {
  AnnotateElement,
  PathElement,
  ShapeElement,
  ShapeKind,
  StickyNoteElement,
  TextHighlightElement,
} from "@/lib/pdf/edit/flatten-annotations";
import { getPageTextLines, findOverlappingLines, type TextLineBox } from "@/lib/pdf/edit/text-lines";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { uid, cn } from "@/lib/utils";
import type { ToolDefinition } from "@/lib/tools";

type Mode = "select" | "pen" | "highlighter" | ShapeKind | "sticky" | "text-highlight" | "eraser";

const COLORS = [
  { name: "Black", value: { r: 0.05, g: 0.05, b: 0.05 } },
  { name: "Red", value: { r: 0.85, g: 0.15, b: 0.15 } },
  { name: "Blue", value: { r: 0.15, g: 0.35, b: 0.85 } },
  { name: "Green", value: { r: 0.15, g: 0.6, b: 0.25 } },
  { name: "Yellow", value: { r: 0.95, g: 0.85, b: 0.1 } },
];

const MODES: { mode: Mode; label: string; icon: React.ElementType }[] = [
  { mode: "select", label: "Select", icon: MousePointer2 },
  { mode: "pen", label: "Pen", icon: Pencil },
  { mode: "highlighter", label: "Highlighter", icon: HighlighterIcon },
  { mode: "rectangle", label: "Rectangle", icon: Square },
  { mode: "circle", label: "Circle", icon: Circle },
  { mode: "line", label: "Line", icon: Minus },
  { mode: "arrow", label: "Arrow", icon: ArrowUpRight },
  { mode: "sticky", label: "Sticky note", icon: StickyNote },
  { mode: "text-highlight", label: "Highlight text", icon: TextSelect },
  { mode: "eraser", label: "Eraser", icon: Eraser },
];

function bboxFromPoints(points: { x: number; y: number }[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return { x: minX, y: minY, width: Math.max(1, Math.max(...xs) - minX), height: Math.max(1, Math.max(...ys) - minY) };
}

export function AnnotatePdfTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState<{ widthPt: number; heightPt: number } | null>(null);
  const [pickerError, setPickerError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<Mode>("select");
  const [color, setColor] = React.useState(COLORS[1].value);
  const [strokeWidth, setStrokeWidth] = React.useState(4);
  const [opacity, setOpacity] = React.useState(1);
  const [fillShape, setFillShape] = React.useState(false);

  const { elements, setElements, undo, redo, canUndo, canRedo } = useElementHistory<AnnotateElement>([]);

  const drawingRef = React.useRef<{ x: number; y: number }[] | null>(null);
  const dragStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const [liveDraw, setLiveDraw] = React.useState<
    | { kind: "path"; points: { x: number; y: number }[] }
    | { kind: "shape" | "text-highlight"; start: { x: number; y: number }; end: { x: number; y: number } }
    | null
  >(null);
  const textLinesRef = React.useRef<TextLineBox[]>([]);

  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<ResultFile[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  // Eraser: deleting is just "select, then immediately remove" — reuses the normal
  // tap-to-select mechanism rather than a separate hit-testing path.
  React.useEffect(() => {
    if (mode === "eraser" && selectedId) {
      setElements((prev) => prev.filter((e) => e.id !== selectedId));
      setSelectedId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedId]);

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

  async function ensureTextLines() {
    if (!file || textLinesRef.current.length > 0 || !pageSize) return;
    try {
      const { loadPdfDocument } = await import("@/lib/pdf/thumbnails");
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      textLinesRef.current = await getPageTextLines(doc, pageIndex + 1, pageSize.heightPt);
    } catch {
      textLinesRef.current = [];
    }
  }

  function handleCanvasPointerDown(pt: { x: number; y: number }) {
    if (mode === "pen" || mode === "highlighter") {
      drawingRef.current = [pt];
      setLiveDraw({ kind: "path", points: [pt] });
    } else if (mode === "rectangle" || mode === "circle" || mode === "line" || mode === "arrow") {
      dragStartRef.current = pt;
      setLiveDraw({ kind: "shape", start: pt, end: pt });
    } else if (mode === "text-highlight") {
      dragStartRef.current = pt;
      setLiveDraw({ kind: "text-highlight", start: pt, end: pt });
      void ensureTextLines();
    } else if (mode === "sticky") {
      const el: StickyNoteElement = {
        id: uid(),
        kind: "sticky-note",
        pageIndex,
        x: pt.x - 20,
        y: pt.y - 20,
        width: 40,
        height: 40,
        rotation: 0,
        zIndex: nextZIndex(elements),
        text: "Note",
        color: { r: 0.98, g: 0.85, b: 0.35 },
      };
      setElements((prev) => [...prev, el]);
      setSelectedId(el.id);
      setMode("select");
    }
  }

  function handleCanvasPointerMove(pt: { x: number; y: number }) {
    if ((mode === "pen" || mode === "highlighter") && drawingRef.current) {
      drawingRef.current.push(pt);
      setLiveDraw({ kind: "path", points: [...drawingRef.current] });
    } else if (dragStartRef.current && (mode === "rectangle" || mode === "circle" || mode === "line" || mode === "arrow")) {
      setLiveDraw({ kind: "shape", start: dragStartRef.current, end: pt });
    } else if (dragStartRef.current && mode === "text-highlight") {
      setLiveDraw({ kind: "text-highlight", start: dragStartRef.current, end: pt });
    }
  }

  function handleCanvasPointerUp(pt: { x: number; y: number }) {
    if ((mode === "pen" || mode === "highlighter") && drawingRef.current) {
      const points = drawingRef.current;
      drawingRef.current = null;
      setLiveDraw(null);
      if (points.length < 2) return;
      const box = bboxFromPoints(points);
      const el: PathElement = {
        id: uid(),
        kind: mode,
        pageIndex,
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        rotation: 0,
        zIndex: nextZIndex(elements),
        points: points.map((p) => ({ x: p.x - box.x, y: p.y - box.y })),
        color: mode === "highlighter" ? COLORS[4].value : color,
        strokeWidth: mode === "highlighter" ? strokeWidth * 4 : strokeWidth,
        opacity: mode === "highlighter" ? 0.45 : opacity,
      };
      setElements((prev) => [...prev, el]);
      return;
    }

    if (dragStartRef.current && (mode === "rectangle" || mode === "circle" || mode === "line" || mode === "arrow")) {
      const start = dragStartRef.current;
      dragStartRef.current = null;
      setLiveDraw(null);
      const x = Math.min(start.x, pt.x);
      const y = Math.min(start.y, pt.y);
      const width = Math.max(4, Math.abs(pt.x - start.x));
      const height = Math.max(4, Math.abs(pt.y - start.y));
      const el: ShapeElement = {
        id: uid(),
        kind: mode,
        pageIndex,
        x,
        y,
        width,
        height,
        rotation: 0,
        zIndex: nextZIndex(elements),
        color,
        strokeWidth,
        fillColor: fillShape ? color : null,
        opacity,
      };
      setElements((prev) => [...prev, el]);
      return;
    }

    if (dragStartRef.current && mode === "text-highlight") {
      const start = dragStartRef.current;
      dragStartRef.current = null;
      setLiveDraw(null);
      const selRect = {
        x: Math.min(start.x, pt.x),
        y: Math.min(start.y, pt.y),
        width: Math.abs(pt.x - start.x),
        height: Math.abs(pt.y - start.y),
      };
      const lines = findOverlappingLines(textLinesRef.current, selRect);
      if (lines.length === 0) {
        toast.info("No text found there to highlight.");
        return;
      }
      const box = {
        x: Math.min(...lines.map((l) => l.x)),
        y: Math.min(...lines.map((l) => l.y)),
        width: Math.max(...lines.map((l) => l.x + l.width)) - Math.min(...lines.map((l) => l.x)),
        height: Math.max(...lines.map((l) => l.y + l.height)) - Math.min(...lines.map((l) => l.y)),
      };
      const el: TextHighlightElement = {
        id: uid(),
        kind: "text-highlight",
        pageIndex,
        ...box,
        rotation: 0,
        zIndex: nextZIndex(elements),
        color: COLORS[4].value,
        opacity: 0.4,
        rects: lines.map((l) => ({ x: l.x, y: l.y, width: l.width, height: l.height })),
      };
      setElements((prev) => [...prev, el]);
    }
  }

  function handleElementChange(id: string, rect: Rect) {
    setElements(
      (prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          if (e.kind === "text-highlight") {
            const dx = rect.x - e.x;
            const dy = rect.y - e.y;
            return { ...e, ...rect, rects: e.rects.map((r) => ({ ...r, x: r.x + dx, y: r.y + dy })) };
          }
          return { ...e, ...rect };
        }),
      { pushHistory: false }
    );
  }

  async function handleExport() {
    if (!file) return;
    setState("processing");
    setProgress(0.3);
    setErrorMessage(null);
    try {
      const { flattenAnnotations } = await import("@/lib/pdf/edit/flatten-annotations");
      const bytes = await flattenAnnotations(file, elements);
      setProgress(1);
      setResults([{ name: "annotated.pdf", blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }) }]);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Couldn't export this PDF.");
      toast.error("Export failed", { description: err instanceof Error ? err.message : undefined });
    }
  }

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
          Pick a tool below, then draw directly on the page. Switch to Select to
          move, resize or delete anything you&apos;ve added.
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
            Annotate another file
          </button>
        </div>
      ) : !file ? (
        <UploadZone accept={tool.accept} multiple={false} maxFiles={1} onFiles={handleFiles} acceptHint="One file at a time" />
      ) : state === "processing" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
          <ProgressRing progress={progress * 100} />
          <p className="text-sm text-muted-foreground">Flattening annotations into the PDF…</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-2">
            {MODES.map((m) => (
              <button
                key={m.mode}
                type="button"
                onClick={() => setMode(m.mode)}
                aria-label={m.label}
                title={m.label}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border",
                  mode === m.mode ? "border-primary bg-primary/10 text-primary" : "border-transparent text-muted-foreground"
                )}
              >
                <m.icon className="h-4.5 w-4.5" />
              </button>
            ))}
          </div>

          {!["select", "eraser", "sticky", "text-highlight"].includes(mode) && (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex gap-1.5">
                {COLORS.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    aria-label={c.name}
                    onClick={() => setColor(c.value)}
                    className={cn("h-7 w-7 rounded-full border-2", color === c.value ? "border-primary" : "border-transparent")}
                    style={{ backgroundColor: `rgb(${c.value.r * 255},${c.value.g * 255},${c.value.b * 255})` }}
                  />
                ))}
              </div>
              <div className="min-w-[120px] flex-1 space-y-1">
                <Label className="text-xs">Thickness — {strokeWidth}pt</Label>
                <Slider value={[strokeWidth]} min={1} max={16} step={1} onValueChange={([v]) => setStrokeWidth(v)} />
              </div>
              <div className="min-w-[120px] flex-1 space-y-1">
                <Label className="text-xs">Opacity — {Math.round(opacity * 100)}%</Label>
                <Slider value={[opacity * 100]} min={10} max={100} step={5} onValueChange={([v]) => setOpacity(v / 100)} />
              </div>
              {["rectangle", "circle"].includes(mode) && (
                <label className="flex items-center gap-1.5 text-xs">
                  <input type="checkbox" checked={fillShape} onChange={(e) => setFillShape(e.target.checked)} className="h-4 w-4 rounded border-border" />
                  Fill
                </label>
              )}
            </div>
          )}

          <PageEditor
            file={file}
            pageIndex={pageIndex}
            onPageIndexChange={(i) => {
              setPageIndex(i);
              textLinesRef.current = [];
            }}
            onPageSizeChange={setPageSize}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={(id) => mode === "select" || mode === "eraser" ? setSelectedId(id) : undefined}
            onElementChange={handleElementChange}
            onGestureStart={() => setElements((prev) => prev, { pushHistory: true })}
            onDeleteSelected={() => {
              if (!selectedId) return;
              setElements((prev) => prev.filter((e) => e.id !== selectedId));
              setSelectedId(null);
            }}
            onBringToFront={() => selectedId && setElements((prev) => prev.map((e) => (e.id === selectedId ? { ...e, zIndex: nextZIndex(prev) } : e)))}
            onSendToBack={() => selectedId && setElements((prev) => prev.map((e) => (e.id === selectedId ? { ...e, zIndex: Math.min(0, ...prev.map((p) => p.zIndex)) - 1 } : e)))}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            interactionDisabled={mode !== "select" && mode !== "eraser"}
            onCanvasPointerDown={handleCanvasPointerDown}
            onCanvasPointerMove={handleCanvasPointerMove}
            onCanvasPointerUp={handleCanvasPointerUp}
            handlesFor={(el) => ({
              resize: el.kind === "rectangle" || el.kind === "circle" || el.kind === "line" || el.kind === "arrow",
              rotate: el.kind === "rectangle" || el.kind === "circle" || el.kind === "line" || el.kind === "arrow",
            })}
            onError={setPickerError}
            renderElement={(el) => {
              if (el.kind === "pen" || el.kind === "highlighter") {
                const d = el.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                return (
                  <svg width="100%" height="100%" viewBox={`0 0 ${el.width} ${el.height}`} className="overflow-visible">
                    <path
                      d={d}
                      fill="none"
                      stroke={`rgb(${el.color.r * 255},${el.color.g * 255},${el.color.b * 255})`}
                      strokeWidth={el.strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={el.opacity}
                    />
                  </svg>
                );
              }
              if (el.kind === "rectangle" || el.kind === "circle") {
                return (
                  <div
                    className="h-full w-full"
                    style={{
                      border: `${el.strokeWidth}px solid rgb(${el.color.r * 255},${el.color.g * 255},${el.color.b * 255})`,
                      borderRadius: el.kind === "circle" ? "50%" : 2,
                      backgroundColor: el.fillColor ? `rgb(${el.fillColor.r * 255},${el.fillColor.g * 255},${el.fillColor.b * 255})` : "transparent",
                      opacity: el.opacity,
                    }}
                  />
                );
              }
              if (el.kind === "line" || el.kind === "arrow") {
                return (
                  <svg width="100%" height="100%" viewBox={`0 0 ${el.width} ${el.height}`} className="overflow-visible">
                    <line
                      x1={0}
                      y1={el.height}
                      x2={el.width}
                      y2={0}
                      stroke={`rgb(${el.color.r * 255},${el.color.g * 255},${el.color.b * 255})`}
                      strokeWidth={el.strokeWidth}
                      opacity={el.opacity}
                    />
                    {el.kind === "arrow" && (
                      <polygon
                        points="-6,-4 6,0 -6,4"
                        transform={`translate(${el.width},0) rotate(${(Math.atan2(el.height, -el.width) * 180) / Math.PI + 180})`}
                        fill={`rgb(${el.color.r * 255},${el.color.g * 255},${el.color.b * 255})`}
                        opacity={el.opacity}
                      />
                    )}
                  </svg>
                );
              }
              if (el.kind === "sticky-note") {
                return (
                  <div
                    className="flex h-full w-full items-center justify-center rounded shadow"
                    style={{ backgroundColor: `rgb(${el.color.r * 255},${el.color.g * 255},${el.color.b * 255})` }}
                  >
                    <StickyNote className="h-4 w-4 text-black/50" />
                  </div>
                );
              }
              // text-highlight — render nothing on the frame itself; the actual rects render below
              return null;
            }}
            overlayContent={(pixelsPerPoint) => (
              <>
                {liveDraw?.kind === "path" && (
                  <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
                    <path
                      d={liveDraw.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x * pixelsPerPoint} ${p.y * pixelsPerPoint}`).join(" ")}
                      fill="none"
                      stroke={mode === "highlighter" ? "rgba(240,210,20,0.5)" : `rgb(${color.r * 255},${color.g * 255},${color.b * 255})`}
                      strokeWidth={mode === "highlighter" ? strokeWidth * 4 : strokeWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                {liveDraw?.kind === "shape" && (
                  <div
                    className="pointer-events-none absolute border-2 border-dashed border-primary"
                    style={{
                      left: Math.min(liveDraw.start.x, liveDraw.end.x) * pixelsPerPoint,
                      top: Math.min(liveDraw.start.y, liveDraw.end.y) * pixelsPerPoint,
                      width: Math.abs(liveDraw.end.x - liveDraw.start.x) * pixelsPerPoint,
                      height: Math.abs(liveDraw.end.y - liveDraw.start.y) * pixelsPerPoint,
                    }}
                  />
                )}
                {liveDraw?.kind === "text-highlight" && (
                  <div
                    className="pointer-events-none absolute bg-yellow-300/30"
                    style={{
                      left: Math.min(liveDraw.start.x, liveDraw.end.x) * pixelsPerPoint,
                      top: Math.min(liveDraw.start.y, liveDraw.end.y) * pixelsPerPoint,
                      width: Math.abs(liveDraw.end.x - liveDraw.start.x) * pixelsPerPoint,
                      height: Math.abs(liveDraw.end.y - liveDraw.start.y) * pixelsPerPoint,
                    }}
                  />
                )}
                {elements
                  .filter((e) => e.pageIndex === pageIndex && e.kind === "text-highlight")
                  .flatMap((e) =>
                    (e as TextHighlightElement).rects.map((r, i) => (
                      <div
                        key={`${e.id}-${i}`}
                        className="pointer-events-none absolute bg-yellow-300/40"
                        style={{
                          left: r.x * pixelsPerPoint,
                          top: r.y * pixelsPerPoint,
                          width: r.width * pixelsPerPoint,
                          height: r.height * pixelsPerPoint,
                        }}
                      />
                    ))
                  )}
              </>
            )}
          />

          {errorMessage && state === "error" && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p>
          )}
        </div>
      )}

      {state !== "done" && file && (
        <ActionBar
          state={pickerError ? "idle" : state === "idle" ? "ready" : state}
          label="Save PDF"
          progress={progress * 100}
          onAction={handleExport}
          disabledReason={pickerError ?? undefined}
        />
      )}
    </div>
  );
}
