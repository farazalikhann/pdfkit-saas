"use client";

import * as React from "react";
import { Check, Scissors, GripVertical, ChevronLeft, ChevronRight, FileWarning } from "lucide-react";
import { cn } from "@/lib/utils";

/** Fires `onVisible` once, the first time this element enters (or nears) the viewport. */
function useRevealOnce(onVisible: () => void, rootMargin = "400px") {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onVisible();
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

export type CellVariant = "default" | "danger";

interface ThumbFrameProps {
  pageNumber: number;
  dataUrl: string | undefined;
  onVisible: () => void;
  rotationDeg?: number;
  className?: string;
  children?: React.ReactNode;
}

/** The shared visual shell every mode's cell wraps: lazy thumbnail + page number. */
function ThumbFrame({ pageNumber, dataUrl, onVisible, rotationDeg = 0, className, children }: ThumbFrameProps) {
  const ref = useRevealOnce(onVisible);
  return (
    <div ref={ref} className={cn("relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border-2 border-border bg-muted", className)}>
      {dataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- dynamically generated canvas data URLs
        <img
          src={dataUrl}
          alt={`Page ${pageNumber}`}
          className="max-h-full max-w-full transition-transform duration-200"
          style={{ transform: `rotate(${rotationDeg}deg)` }}
          draggable={false}
        />
      ) : (
        <div className="h-full w-full animate-pulse bg-muted" />
      )}
      <span className="absolute bottom-1 right-1 rounded bg-background/85 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-foreground shadow-sm">
        {pageNumber}
      </span>
      {children}
    </div>
  );
}

interface SelectCellProps {
  pageNumber: number;
  dataUrl: string | undefined;
  onVisible: () => void;
  selected: boolean;
  variant: CellVariant;
  rotationDeg?: number;
}

export function SelectPageCell({ pageNumber, dataUrl, onVisible, selected, variant, rotationDeg }: SelectCellProps) {
  const danger = variant === "danger";
  return (
    <div
      data-page-number={pageNumber}
      className="flex min-h-[44px] w-full touch-none flex-col items-center gap-1 select-none"
    >
      <ThumbFrame
        pageNumber={pageNumber}
        dataUrl={dataUrl}
        onVisible={onVisible}
        rotationDeg={rotationDeg}
        className={cn(
          "transition-all",
          selected && !danger && "border-primary ring-2 ring-primary ring-offset-1 ring-offset-background",
          selected && danger && "border-destructive ring-2 ring-destructive ring-offset-1 ring-offset-background opacity-60"
        )}
      >
        {selected && !danger && (
          <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
            <Check className="h-4 w-4" />
          </span>
        )}
        {selected && danger && (
          <>
            <span className="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow">
              <Check className="h-4 w-4" />
            </span>
            <div className="pointer-events-none absolute inset-0 flex items-center">
              <div className="h-[3px] w-full -rotate-6 bg-destructive/80" />
            </div>
          </>
        )}
      </ThumbFrame>
    </div>
  );
}

interface GapCellProps {
  pageNumber: number;
  dataUrl: string | undefined;
  onVisible: () => void;
  groupColorClass?: string;
  gapAfterActive: boolean;
  onToggleGapAfter: () => void;
  isLastPage: boolean;
}

export function SplitPointPageCell({
  pageNumber,
  dataUrl,
  onVisible,
  groupColorClass,
  gapAfterActive,
  onToggleGapAfter,
  isLastPage,
}: GapCellProps) {
  return (
    <div className="flex w-full items-stretch gap-0.5">
      <div data-page-number={pageNumber} className="flex min-h-[44px] flex-1 flex-col items-center gap-1">
        <ThumbFrame pageNumber={pageNumber} dataUrl={dataUrl} onVisible={onVisible} className={groupColorClass} />
      </div>
      {!isLastPage && (
        <button
          type="button"
          onClick={onToggleGapAfter}
          aria-label={gapAfterActive ? `Remove split after page ${pageNumber}` : `Split after page ${pageNumber}`}
          aria-pressed={gapAfterActive}
          className={cn(
            "flex min-h-[44px] w-6 shrink-0 items-center justify-center rounded-md border-2 border-dashed transition-colors",
            gapAfterActive
              ? "border-primary bg-primary/15 text-primary"
              : "border-transparent text-muted-foreground/50 hover:border-border hover:text-muted-foreground"
          )}
        >
          <Scissors className={cn("h-4 w-4", gapAfterActive && "rotate-90")} />
        </button>
      )}
    </div>
  );
}

interface ReorderCellProps {
  pageNumber: number;
  dataUrl: string | undefined;
  onVisible: () => void;
  position: number;
  total: number;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  isDragging?: boolean;
  onMove: (delta: number) => void;
  onJumpTo: (position1Indexed: number) => void;
}

export function ReorderPageCell({
  pageNumber,
  dataUrl,
  onVisible,
  position,
  total,
  dragHandleProps,
  isDragging,
  onMove,
  onJumpTo,
}: ReorderCellProps) {
  const [jumpValue, setJumpValue] = React.useState(String(position + 1));

  React.useEffect(() => {
    setJumpValue(String(position + 1));
  }, [position]);

  return (
    <div className={cn("flex w-full flex-col items-center gap-1", isDragging && "opacity-50")}>
      <ThumbFrame pageNumber={pageNumber} dataUrl={dataUrl} onVisible={onVisible}>
        <button
          type="button"
          aria-label={`Drag page ${pageNumber} to reorder`}
          className="absolute right-1 top-1 flex h-7 w-7 cursor-grab items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow active:cursor-grabbing"
          {...dragHandleProps}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </ThumbFrame>
      <div className="flex w-full items-center justify-center gap-1">
        <button
          type="button"
          aria-label="Move earlier"
          disabled={position === 0}
          onClick={() => onMove(-1)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <input
          type="number"
          min={1}
          max={total}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onBlur={() => {
            const n = parseInt(jumpValue, 10);
            if (Number.isFinite(n)) onJumpTo(n);
            else setJumpValue(String(position + 1));
          }}
          aria-label={`Position for page ${pageNumber}`}
          className="h-7 w-11 rounded-md border border-border bg-transparent text-center text-xs tabular-nums"
        />
        <button
          type="button"
          aria-label="Move later"
          disabled={position === total - 1}
          onClick={() => onMove(1)}
          className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground disabled:opacity-30"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function ThumbErrorIcon() {
  return <FileWarning className="h-5 w-5 text-muted-foreground" />;
}
