"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_FILTER_CSS,
  type CropRect,
  type DocumentFilter,
} from "@/lib/pdf/image-transform";

type Corner = "nw" | "ne" | "sw" | "se";
type DragMode = "move" | Corner;

const DEFAULT_RECT: CropRect = { x: 0.05, y: 0.05, width: 0.9, height: 0.9 };
const MIN_SIZE = 0.08;

const FILTER_OPTIONS: { value: DocumentFilter; label: string }[] = [
  { value: "original", label: "Original" },
  { value: "enhance", label: "Enhance" },
  { value: "grayscale", label: "Grayscale" },
  { value: "bw", label: "B & W scan" },
];

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function trySetPointerCapture(el: Element, pointerId: number) {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    // A synthetic or already-released pointer can throw here, never let that
    // abort the rest of the gesture.
  }
}

interface CropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string;
  rotationDeg: number;
  initialCrop: CropRect | null;
  onApply: (crop: CropRect | null) => void;
  filter: DocumentFilter;
  onFilterChange: (filter: DocumentFilter) => void;
}

export function CropDialog({
  open,
  onOpenChange,
  imageUrl,
  rotationDeg,
  initialCrop,
  onApply,
  filter,
  onFilterChange,
}: CropDialogProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [rect, setRect] = React.useState<CropRect>(initialCrop ?? DEFAULT_RECT);
  const dragRef = React.useRef<{ mode: DragMode; startX: number; startY: number; startRect: CropRect } | null>(null);

  React.useEffect(() => {
    if (open) setRect(initialCrop ?? DEFAULT_RECT);
  }, [open, initialCrop]);

  function toRel(clientX: number, clientY: number) {
    const box = containerRef.current!.getBoundingClientRect();
    return { x: (clientX - box.left) / box.width, y: (clientY - box.top) / box.height };
  }

  function startDrag(mode: DragMode) {
    return (e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
      trySetPointerCapture(e.currentTarget, e.pointerId);
      const p = toRel(e.clientX, e.clientY);
      dragRef.current = { mode, startX: p.x, startY: p.y, startRect: rect };
    };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const p = toRel(e.clientX, e.clientY);
    const dx = p.x - d.startX;
    const dy = p.y - d.startY;
    const base = d.startRect;

    if (d.mode === "move") {
      setRect({
        ...base,
        x: clamp(base.x + dx, 0, 1 - base.width),
        y: clamp(base.y + dy, 0, 1 - base.height),
      });
      return;
    }

    let { x, y, width, height } = base;
    if (d.mode.includes("e")) width = clamp(base.width + dx, MIN_SIZE, 1 - base.x);
    if (d.mode.includes("s")) height = clamp(base.height + dy, MIN_SIZE, 1 - base.y);
    if (d.mode.includes("w")) {
      const newX = clamp(base.x + dx, 0, base.x + base.width - MIN_SIZE);
      width = base.width + (base.x - newX);
      x = newX;
    }
    if (d.mode.includes("n")) {
      const newY = clamp(base.y + dy, 0, base.y + base.height - MIN_SIZE);
      height = base.height + (base.y - newY);
      y = newY;
    }
    setRect({ x, y, width, height });
  }

  function endDrag() {
    dragRef.current = null;
  }

  const swapDims = rotationDeg === 90 || rotationDeg === 270;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crop & filter</DialogTitle>
        </DialogHeader>

        <div
          ref={containerRef}
          className="relative mx-auto flex max-h-[60vh] w-full touch-none select-none items-center justify-center overflow-hidden rounded-lg bg-muted"
          style={{ aspectRatio: swapDims ? "3/4" : "4/3" }}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Photo to crop"
            className="pointer-events-none max-h-full max-w-full"
            style={{ transform: `rotate(${rotationDeg}deg)`, filter: DOCUMENT_FILTER_CSS[filter] }}
            draggable={false}
          />
          <div
            className="absolute inset-0"
            onPointerDown={startDrag("move")}
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 0%), linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 0%)",
            }}
          >
            {/* Darkened mask outside the crop rect, crop rect itself left clear via a hole */}
            <svg className="pointer-events-none absolute inset-0 h-full w-full">
              <defs>
                <mask id="crop-mask">
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={`${rect.x * 100}%`}
                    y={`${rect.y * 100}%`}
                    width={`${rect.width * 100}%`}
                    height={`${rect.height * 100}%`}
                    fill="black"
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
            </svg>
            <div
              className="absolute cursor-move border-2 border-primary"
              style={{
                left: `${rect.x * 100}%`,
                top: `${rect.y * 100}%`,
                width: `${rect.width * 100}%`,
                height: `${rect.height * 100}%`,
              }}
              onPointerDown={startDrag("move")}
            >
              {(["nw", "ne", "sw", "se"] as const).map((corner) => (
                <div
                  key={corner}
                  onPointerDown={startDrag(corner)}
                  className="absolute h-7 w-7 rounded-full border-2 border-primary bg-background shadow"
                  style={{
                    cursor: `${corner}-resize`,
                    left: corner.includes("w") ? -14 : undefined,
                    right: corner.includes("e") ? -14 : undefined,
                    top: corner.includes("n") ? -14 : undefined,
                    bottom: corner.includes("s") ? -14 : undefined,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">Document filter</p>
          <div className="grid grid-cols-4 gap-1.5">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => onFilterChange(f.value)}
                className={cn(
                  "rounded-lg border px-1.5 py-1.5 text-[11px] font-medium transition-colors",
                  filter === f.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground active:bg-accent"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
          <Button variant="outline" onClick={() => setRect(DEFAULT_RECT)}>
            Reset
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onApply(null);
                onOpenChange(false);
              }}
            >
              Remove crop
            </Button>
            <Button
              onClick={() => {
                onApply(rect);
                onOpenChange(false);
              }}
            >
              Apply
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
