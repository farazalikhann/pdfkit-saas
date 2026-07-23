"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Undo2, Redo2, Trash2, ArrowUpToLine, ArrowDownToLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { loadPdfDocument, renderPageToDataUrl } from "@/lib/pdf/thumbnails";
import { toFriendlyPdfLoadError } from "@/lib/pdf/errors";
import { ElementFrame } from "./element-frame";
import { trySetPointerCapture } from "./use-element-gesture";
import type { EditorElementBase, Rect } from "./types";

export interface PageEditorHandle {
  pixelsPerPoint: number;
}

interface PageEditorProps<T extends EditorElementBase> {
  file: File;
  pageIndex: number;
  onPageIndexChange: (index: number) => void;
  onPageCountChange?: (count: number) => void;
  onPageSizeChange?: (size: { widthPt: number; heightPt: number }) => void;
  elements: T[];
  selectedId: string | null;
  onSelectElement: (id: string | null) => void;
  onElementChange: (id: string, rect: Rect) => void;
  onGestureStart: () => void;
  onGestureEnd?: () => void;
  onDeleteSelected?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  keepAspectRatioFor?: (element: T) => boolean;
  handlesFor?: (element: T) => { resize?: boolean; rotate?: boolean };
  renderElement: (element: T, selected: boolean) => React.ReactNode;
  /** Disables normal select/drag interaction — used while a free-draw tool (pen/shape) is active. */
  interactionDisabled?: boolean;
  onCanvasPointerDown?: (pt: { x: number; y: number }, e: React.PointerEvent) => void;
  onCanvasPointerMove?: (pt: { x: number; y: number }, e: React.PointerEvent) => void;
  onCanvasPointerUp?: (pt: { x: number; y: number }, e: React.PointerEvent) => void;
  /** Tool-specific live preview overlay (e.g. the in-progress pen stroke), rendered above elements. */
  overlayContent?: (pixelsPerPoint: number) => React.ReactNode;
  onError?: (message: string | null) => void;
}

export function PageEditor<T extends EditorElementBase>({
  file,
  pageIndex,
  onPageIndexChange,
  onPageCountChange,
  onPageSizeChange,
  elements,
  selectedId,
  onSelectElement,
  onElementChange,
  onGestureStart,
  onGestureEnd,
  onDeleteSelected,
  onBringToFront,
  onSendToBack,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  keepAspectRatioFor,
  handlesFor,
  renderElement,
  interactionDisabled,
  onCanvasPointerDown,
  onCanvasPointerMove,
  onCanvasPointerUp,
  overlayContent,
  onError,
}: PageEditorProps<T>) {
  const [pageCount, setPageCount] = React.useState(0);
  const [pageSize, setPageSize] = React.useState<{ widthPt: number; heightPt: number } | null>(null);
  const [backgroundUrl, setBackgroundUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const pdfDocRef = React.useRef<Awaited<ReturnType<typeof loadPdfDocument>> | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState(360);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setContainerWidth(width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A page rendered at full width is often taller than the viewport, and tool pages
  // pin a "Save" action bar to the bottom — without this, a canvas taller than the
  // gap between the toolbar and that fixed bar has its middle band physically covered
  // by the bar, silently swallowing pointer/draw gestures aimed at the canvas. Scrolling
  // the canvas to the top of the viewport the moment a free-draw tool activates gives
  // it the most clearance the layout can offer.
  React.useEffect(() => {
    if (interactionDisabled) {
      containerRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  }, [interactionDisabled]);

  // Load the pdf.js document once per file.
  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await loadPdfDocument(buffer);
        if (cancelled) return;
        pdfDocRef.current = doc;
        setPageCount(doc.numPages);
        onPageCountChange?.(doc.numPages);
      } catch (err) {
        if (!cancelled) {
          const msg = toFriendlyPdfLoadError(err);
          setError(msg);
          onError?.(msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  // Render the current page's background whenever the page or container width changes.
  React.useEffect(() => {
    const doc = pdfDocRef.current;
    if (!doc || pageCount === 0) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const page = await doc.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / viewport.width;
        const rendered = await renderPageToDataUrl(doc, pageIndex + 1, scale, "image/jpeg", 0.92);
        if (cancelled) return;
        setBackgroundUrl(rendered.dataUrl);
        const sizePt = { widthPt: viewport.width, heightPt: viewport.height };
        setPageSize(sizePt);
        onPageSizeChange?.(sizePt);
      } catch (err) {
        if (!cancelled) {
          const msg = toFriendlyPdfLoadError(err);
          setError(msg);
          onError?.(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex, pageCount, containerWidth]);

  const pixelsPerPoint = pageSize ? containerWidth / pageSize.widthPt : 1;
  const displayHeight = pageSize ? pageSize.heightPt * pixelsPerPoint : 480;

  function resolvePoint(e: React.PointerEvent): { x: number; y: number } {
    const box = containerRef.current!.getBoundingClientRect();
    return { x: (e.clientX - box.left) / pixelsPerPoint, y: (e.clientY - box.top) / pixelsPerPoint };
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  const pageElements = elements.filter((el) => el.pageIndex === pageIndex).sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-2">
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={pageIndex === 0}
            onClick={() => onPageIndexChange(pageIndex - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[80px] text-center text-xs font-medium tabular-nums text-muted-foreground">
            Page {pageIndex + 1} of {pageCount || "…"}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            disabled={pageIndex >= pageCount - 1}
            onClick={() => onPageIndexChange(pageIndex + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={!canUndo} onClick={onUndo} aria-label="Undo">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={!canRedo} onClick={onRedo} aria-label="Redo">
            <Redo2 className="h-4 w-4" />
          </Button>
          {selectedId && (
            <>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onSendToBack} aria-label="Send to back">
                <ArrowDownToLine className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={onBringToFront} aria-label="Bring to front">
                <ArrowUpToLine className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={onDeleteSelected}
                aria-label="Delete selected"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto w-full select-none touch-none overflow-hidden rounded-lg border border-border bg-muted"
        style={{ height: displayHeight }}
        onPointerDown={(e) => {
          if (e.currentTarget !== e.target && (e.target as HTMLElement).closest("[data-editor-element]")) return;
          e.preventDefault();
          onSelectElement(null);
          // Without capture, a drag that starts on the canvas but drifts under the
          // fixed bottom action bar mid-gesture would have its move/up events routed
          // to whatever's now under the pointer (the Save button) instead of back here
          // — silently truncating the stroke. Capturing keeps the whole gesture on
          // this element regardless of what's visually underneath as the pointer moves.
          trySetPointerCapture(e.currentTarget, e.pointerId);
          onCanvasPointerDown?.(resolvePoint(e), e);
        }}
        onPointerMove={(e) => onCanvasPointerMove?.(resolvePoint(e), e)}
        onPointerUp={(e) => onCanvasPointerUp?.(resolvePoint(e), e)}
        onPointerCancel={(e) => onCanvasPointerUp?.(resolvePoint(e), e)}
      >
        {loading && !backgroundUrl && <Skeleton className="absolute inset-0" />}
        {backgroundUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backgroundUrl} alt={`Page ${pageIndex + 1}`} className="pointer-events-none absolute inset-0 h-full w-full" draggable={false} />
        )}

        {pageSize &&
          pageElements.map((el) => (
            <div key={el.id} data-editor-element>
              <ElementFrame
                rect={el}
                pixelsPerPoint={pixelsPerPoint}
                selected={!interactionDisabled && selectedId === el.id}
                onSelect={() => !interactionDisabled && onSelectElement(el.id)}
                onChange={(next) => onElementChange(el.id, next)}
                onGestureStart={onGestureStart}
                onGestureEnd={onGestureEnd}
                keepAspectRatio={keepAspectRatioFor?.(el)}
                showResizeHandles={handlesFor?.(el).resize ?? true}
                showRotateHandle={handlesFor?.(el).rotate ?? true}
              >
                {renderElement(el, selectedId === el.id)}
              </ElementFrame>
            </div>
          ))}

        {overlayContent?.(pixelsPerPoint)}
      </div>
    </div>
  );
}
