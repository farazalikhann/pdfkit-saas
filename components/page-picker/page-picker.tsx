"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageThumbnails } from "@/hooks/use-page-thumbnails";
import { parsePageRange, formatPageRange, invertSelection, allPages } from "@/lib/pdf/page-ranges";
import { SelectPageCell, SplitPointPageCell, ReorderPageCell, type CellVariant } from "./page-picker-cell";
import { cn } from "@/lib/utils";

const GRID_CLASSES = "grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
const GROUP_COLOR_CLASSES = [
  "ring-2 ring-inset ring-sky-400",
  "ring-2 ring-inset ring-amber-400",
  "ring-2 ring-inset ring-emerald-400",
  "ring-2 ring-inset ring-fuchsia-400",
  "ring-2 ring-inset ring-rose-400",
  "ring-2 ring-inset ring-teal-400",
];

export interface PageGroup {
  from: number;
  to: number;
}

interface BaseProps {
  file: File;
  className?: string;
  onPageCountChange?: (pageCount: number) => void;
  onError?: (message: string | null) => void;
}

interface SelectModeProps extends BaseProps {
  mode: "select";
  selected: Set<number>;
  onSelectedChange: (next: Set<number>) => void;
  variant?: CellVariant;
  rotations?: Map<number, number>;
}

interface ReorderModeProps extends BaseProps {
  mode: "reorder";
  order: number[];
  onOrderChange: (next: number[]) => void;
}

interface SplitPointsModeProps extends BaseProps {
  mode: "split-points";
  gapsAfter: Set<number>;
  onToggleGap: (afterPage: number) => void;
  onGroupsChange?: (groups: PageGroup[]) => void;
}

export type PagePickerProps = SelectModeProps | ReorderModeProps | SplitPointsModeProps;

function computeGroups(pageCount: number, gapsAfter: Set<number>): PageGroup[] {
  const groups: PageGroup[] = [];
  let start = 1;
  for (let p = 1; p <= pageCount; p++) {
    if (gapsAfter.has(p) || p === pageCount) {
      groups.push({ from: start, to: p });
      start = p + 1;
    }
  }
  return groups;
}

export function PagePicker(props: PagePickerProps) {
  const { file, className, onPageCountChange, onError } = props;
  const { pageCount, isLoading, error, getThumbnail, requestThumbnail } = usePageThumbnails(file);

  React.useEffect(() => {
    if (pageCount > 0) onPageCountChange?.(pageCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount]);

  React.useEffect(() => {
    onError?.(error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  if (error) {
    return (
      <div className={cn("flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive", className)}>
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (isLoading || pageCount === 0) {
    return (
      <div className={cn(GRID_CLASSES, className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (props.mode === "reorder") {
    return <ReorderGrid {...props} pageCount={pageCount} getThumbnail={getThumbnail} requestThumbnail={requestThumbnail} />;
  }
  if (props.mode === "split-points") {
    return <SplitPointsGrid {...props} pageCount={pageCount} getThumbnail={getThumbnail} requestThumbnail={requestThumbnail} />;
  }
  return <SelectGrid {...props} pageCount={pageCount} getThumbnail={getThumbnail} requestThumbnail={requestThumbnail} />;
}

// ---------------------------------------------------------------------------
// Select mode: tap/shift-tap/drag-paint selection + range text input + bulk actions
// ---------------------------------------------------------------------------

function SelectGrid({
  pageCount,
  getThumbnail,
  requestThumbnail,
  selected,
  onSelectedChange,
  variant = "default",
  rotations,
  className,
}: SelectModeProps & {
  pageCount: number;
  getThumbnail: (n: number) => string | undefined;
  requestThumbnail: (n: number) => void;
}) {
  const [rangeText, setRangeText] = React.useState(() => formatPageRange(selected));
  const rangeTextFocused = React.useRef(false);
  const lastTappedRef = React.useRef<number | null>(null);

  interface PressSession {
    pointerId: number;
    pointerType: string;
    startX: number;
    startY: number;
    startPage: number;
    addMode: boolean;
    paintActive: boolean;
    abandoned: boolean; // touch: moved like a scroll before the long-press armed
    lastPaintedPage: number;
    longPressTimer?: number;
  }
  const sessionRef = React.useRef<PressSession | null>(null);

  // Grid -> text sync (skip while the user is actively typing in the field).
  React.useEffect(() => {
    if (!rangeTextFocused.current) setRangeText(formatPageRange(selected));
  }, [selected]);

  function commitRangeText(text: string) {
    setRangeText(text);
    onSelectedChange(parsePageRange(text, pageCount));
  }

  function toggle(page: number, forceAdd?: boolean) {
    const next = new Set(selected);
    const shouldAdd = forceAdd ?? !next.has(page);
    if (shouldAdd) next.add(page);
    else next.delete(page);
    onSelectedChange(next);
  }

  function selectRange(a: number, b: number, add: boolean) {
    const next = new Set(selected);
    const [from, to] = a <= b ? [a, b] : [b, a];
    for (let p = from; p <= to; p++) {
      if (add) next.add(p);
      else next.delete(p);
    }
    onSelectedChange(next);
  }

  function resolvePageAt(x: number, y: number): number | null {
    const el = document.elementFromPoint(x, y);
    const cell = el?.closest<HTMLElement>("[data-page-number]");
    if (!cell) return null;
    const n = Number(cell.dataset.pageNumber);
    return Number.isFinite(n) ? n : null;
  }

  function paintPage(page: number, addMode: boolean) {
    const next = new Set(selected);
    if (addMode) next.add(page);
    else next.delete(page);
    onSelectedChange(next);
  }

  // Selection lives entirely on pointer events (no separate onClick) — a plain
  // tap/click toggles on pointerup, while a drag that starts moving switches
  // into "paint" mode on pointermove. Handling both in the same state machine
  // is what keeps a click from toggling once via pointerdown and a second time
  // via a click handler (that double-toggle looks like "tapping does nothing").
  function handlePointerDown(e: React.PointerEvent) {
    const page = resolvePageAt(e.clientX, e.clientY);
    if (page == null) return;
    const addMode = !selected.has(page);
    const session: PressSession = {
      pointerId: e.pointerId,
      pointerType: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      startPage: page,
      addMode,
      paintActive: false,
      abandoned: false,
      lastPaintedPage: page,
    };
    if (e.pointerType !== "mouse") {
      // Touch/pen: a brief hold arms paint-drag mode, so a normal swipe-to-scroll
      // starting on a thumbnail isn't hijacked into a selection stroke.
      session.longPressTimer = window.setTimeout(() => {
        const s = sessionRef.current;
        if (s && s.pointerId === e.pointerId && !s.abandoned) {
          s.paintActive = true;
          paintPage(s.startPage, s.addMode);
        }
      }, 350);
    }
    sessionRef.current = session;
  }

  function handlePointerMove(e: React.PointerEvent) {
    const session = sessionRef.current;
    if (!session || session.pointerId !== e.pointerId || session.abandoned) return;

    if (!session.paintActive) {
      const dx = Math.abs(e.clientX - session.startX);
      const dy = Math.abs(e.clientY - session.startY);
      const movedEnough = dx > 6 || dy > 6;
      if (!movedEnough) return;

      if (session.pointerType === "mouse") {
        // Mouse drag has no scroll gesture to protect — start painting immediately.
        session.paintActive = true;
        paintPage(session.startPage, session.addMode);
      } else {
        // Moved before the long-press armed — this is a scroll, not a selection drag.
        if (session.longPressTimer) window.clearTimeout(session.longPressTimer);
        session.abandoned = true;
        return;
      }
    }

    e.preventDefault();
    const page = resolvePageAt(e.clientX, e.clientY);
    if (page != null && page !== session.lastPaintedPage) {
      paintPage(page, session.addMode);
      session.lastPaintedPage = page;
    }
  }

  function handlePointerUp(e: React.PointerEvent) {
    const session = sessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    if (session.longPressTimer) window.clearTimeout(session.longPressTimer);

    if (!session.paintActive && !session.abandoned) {
      // Never entered paint mode — this was a plain tap/click.
      if (e.shiftKey && lastTappedRef.current != null) {
        selectRange(lastTappedRef.current, session.startPage, !selected.has(session.startPage));
      } else {
        toggle(session.startPage);
      }
    }
    if (!session.abandoned) lastTappedRef.current = session.startPage;
    sessionRef.current = null;
  }

  function handlePointerCancel(e: React.PointerEvent) {
    const session = sessionRef.current;
    if (session?.longPressTimer) window.clearTimeout(session.longPressTimer);
    if (session?.pointerId === e.pointerId) sessionRef.current = null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={rangeText}
          onFocus={() => (rangeTextFocused.current = true)}
          onBlur={() => (rangeTextFocused.current = false)}
          onChange={(e) => commitRangeText(e.target.value)}
          placeholder="e.g. 1-3, 7, 10-12"
          className="sm:flex-1"
          aria-label="Page range"
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onSelectedChange(allPages(pageCount))}>
            All
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onSelectedChange(new Set())}>
            None
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => onSelectedChange(invertSelection(selected, pageCount))}>
            Invert
          </Button>
        </div>
      </div>

      <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
        {selected.size} of {pageCount} pages selected
      </p>

      <div
        className={GRID_CLASSES}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
          <div key={page} className="cursor-pointer">
            <SelectPageCell
              pageNumber={page}
              dataUrl={getThumbnail(page)}
              onVisible={() => requestThumbnail(page)}
              selected={selected.has(page)}
              variant={variant}
              rotationDeg={rotations?.get(page) ?? 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Split-points mode: gap markers between thumbnails, grouped by color
// ---------------------------------------------------------------------------

function SplitPointsGrid({
  pageCount,
  getThumbnail,
  requestThumbnail,
  gapsAfter,
  onToggleGap,
  onGroupsChange,
  className,
}: SplitPointsModeProps & {
  pageCount: number;
  getThumbnail: (n: number) => string | undefined;
  requestThumbnail: (n: number) => void;
}) {
  React.useEffect(() => {
    onGroupsChange?.(computeGroups(pageCount, gapsAfter));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageCount, gapsAfter]);

  const groupIndexByPage = React.useMemo(() => {
    const map = new Map<number, number>();
    let groupIdx = 0;
    for (let p = 1; p <= pageCount; p++) {
      map.set(p, groupIdx);
      if (gapsAfter.has(p)) groupIdx++;
    }
    return map;
  }, [pageCount, gapsAfter]);

  return (
    <div className={cn(GRID_CLASSES, className)}>
      {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
        <SplitPointPageCell
          key={page}
          pageNumber={page}
          dataUrl={getThumbnail(page)}
          onVisible={() => requestThumbnail(page)}
          groupColorClass={GROUP_COLOR_CLASSES[(groupIndexByPage.get(page) ?? 0) % GROUP_COLOR_CLASSES.length]}
          gapAfterActive={gapsAfter.has(page)}
          onToggleGapAfter={() => onToggleGap(page)}
          isLastPage={page === pageCount}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Reorder mode: drag-and-drop (pointer + keyboard) with move/jump fallback controls
// ---------------------------------------------------------------------------

function SortableReorderCell({
  pageNumber,
  dataUrl,
  requestThumbnail,
  position,
  total,
  onMove,
  onJumpTo,
}: {
  pageNumber: number;
  dataUrl: string | undefined;
  requestThumbnail: (n: number) => void;
  position: number;
  total: number;
  onMove: (delta: number) => void;
  onJumpTo: (pos1Indexed: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: String(pageNumber),
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <ReorderPageCell
        pageNumber={pageNumber}
        dataUrl={dataUrl}
        onVisible={() => requestThumbnail(pageNumber)}
        position={position}
        total={total}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners } as React.HTMLAttributes<HTMLButtonElement>}
        onMove={onMove}
        onJumpTo={onJumpTo}
      />
    </div>
  );
}

function ReorderGrid({
  order,
  onOrderChange,
  getThumbnail,
  requestThumbnail,
  className,
}: ReorderModeProps & {
  pageCount: number;
  getThumbnail: (n: number) => string | undefined;
  requestThumbnail: (n: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = React.useMemo(() => order.map(String), [order]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onOrderChange(next);
  }

  function moveBy(index: number, delta: number) {
    const to = index + delta;
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(index, 1);
    next.splice(to, 0, moved);
    onOrderChange(next);
  }

  function jumpTo(index: number, targetPos1Indexed: number) {
    const to = Math.min(order.length, Math.max(1, targetPos1Indexed)) - 1;
    if (to === index) return;
    const next = [...order];
    const [moved] = next.splice(index, 1);
    next.splice(to, 0, moved);
    onOrderChange(next);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={cn(GRID_CLASSES, className)}>
          {order.map((pageNumber, index) => (
            <SortableReorderCell
              key={pageNumber}
              pageNumber={pageNumber}
              dataUrl={getThumbnail(pageNumber)}
              requestThumbnail={requestThumbnail}
              position={index}
              total={order.length}
              onMove={(delta) => moveBy(index, delta)}
              onJumpTo={(pos) => jumpTo(index, pos)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

export { computeGroups };
