"use client";

import * as React from "react";
import type { Rect } from "./types";

export type ResizeCorner = "nw" | "ne" | "sw" | "se";

/** setPointerCapture can throw (e.g. a pointer the browser no longer considers
 *  active) — never let that abort the rest of a pointerdown handler, since
 *  everything after it (registering the pointer, deciding move vs. pinch) still
 *  needs to run even if capture itself couldn't be established. */
export function trySetPointerCapture(el: Element, pointerId: number) {
  try {
    el.setPointerCapture(pointerId);
  } catch {
    // Ignored — capture is a nice-to-have (keeps events flowing to this element
    // if the pointer leaves its bounds), not a precondition for gesture tracking.
  }
}

interface UseElementGestureOptions {
  rect: Rect;
  onChange: (next: Rect) => void;
  /** Fired once at the start of any drag/resize/rotate/pinch — push an undo snapshot here. */
  onGestureStart?: () => void;
  onGestureEnd?: () => void;
  pixelsPerPoint: number;
  minWidth?: number;
  minHeight?: number;
  keepAspectRatio?: boolean;
  disabled?: boolean;
}

/**
 * Drag/resize/rotate for one overlay element via native Pointer Events, which unify
 * mouse and touch input — this is what makes drag work on a phone, not just a mouse.
 * A second simultaneous pointer on the element body upgrades a plain drag into a
 * pinch gesture (combined resize + rotate around the element's center), covering
 * touch pinch-zoom/pinch-resize without needing separate touch-only code.
 */
export function useElementGesture({
  rect,
  onChange,
  onGestureStart,
  onGestureEnd,
  pixelsPerPoint,
  minWidth = 16,
  minHeight = 16,
  keepAspectRatio,
  disabled,
}: UseElementGestureOptions) {
  const elementRef = React.useRef<HTMLDivElement | null>(null);
  const pointersRef = React.useRef<Map<number, { x: number; y: number }>>(new Map());
  const modeRef = React.useRef<"move" | "resize" | "rotate" | "pinch" | null>(null);
  const startRef = React.useRef<{
    rect: Rect;
    corner?: ResizeCorner;
    pointerStart?: { x: number; y: number };
    center?: { x: number; y: number };
    startAngle?: number;
    pinchDist?: number;
    pinchAngle?: number;
  } | null>(null);

  const toPt = React.useCallback((px: number) => px / pixelsPerPoint, [pixelsPerPoint]);

  function beginGesture() {
    onGestureStart?.();
  }

  function endGestureIfDone() {
    if (pointersRef.current.size === 0) {
      modeRef.current = null;
      startRef.current = null;
      onGestureEnd?.();
    }
  }

  const bodyHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (disabled) return;
      e.stopPropagation();
      trySetPointerCapture(e.currentTarget as Element, e.pointerId);
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 1) {
        modeRef.current = "move";
        startRef.current = { rect: { ...rect }, pointerStart: { x: e.clientX, y: e.clientY } };
        beginGesture();
      } else if (pointersRef.current.size === 2) {
        const pts = Array.from(pointersRef.current.values());
        modeRef.current = "pinch";
        startRef.current = {
          rect: { ...rect },
          pinchDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
          pinchAngle: Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x),
        };
      }
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const start = startRef.current;
      if (!start) return;

      if (modeRef.current === "move" && start.pointerStart) {
        const dx = toPt(e.clientX - start.pointerStart.x);
        const dy = toPt(e.clientY - start.pointerStart.y);
        onChange({ ...start.rect, x: start.rect.x + dx, y: start.rect.y + dy });
      } else if (modeRef.current === "pinch" && start.pinchDist && start.pinchAngle !== undefined) {
        const pts = Array.from(pointersRef.current.values());
        if (pts.length < 2) return;
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
        const angle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
        const scale = dist / start.pinchDist;
        const rotationDeltaDeg = (angle - start.pinchAngle) * (180 / Math.PI);
        const base = start.rect;
        const newW = Math.max(minWidth, base.width * scale);
        const newH = Math.max(minHeight, base.height * scale);
        const cx = base.x + base.width / 2;
        const cy = base.y + base.height / 2;
        onChange({
          x: cx - newW / 2,
          y: cy - newH / 2,
          width: newW,
          height: newH,
          rotation: base.rotation + rotationDeltaDeg,
        });
      }
    },
    onPointerUp: (e: React.PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size === 1 && modeRef.current === "pinch") {
        // Dropped from pinch back to a single finger — resume as a plain move.
        const [[, pt]] = Array.from(pointersRef.current.entries());
        modeRef.current = "move";
        startRef.current = { rect: { ...rect }, pointerStart: pt };
      } else {
        endGestureIfDone();
      }
    },
    onPointerCancel: (e: React.PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      endGestureIfDone();
    },
  };

  function makeResizeHandleHandlers(corner: ResizeCorner) {
    return {
      onPointerDown: (e: React.PointerEvent) => {
        if (disabled) return;
        e.stopPropagation();
        trySetPointerCapture(e.currentTarget as Element, e.pointerId);
        modeRef.current = "resize";
        startRef.current = { rect: { ...rect }, corner, pointerStart: { x: e.clientX, y: e.clientY } };
        beginGesture();
      },
      onPointerMove: (e: React.PointerEvent) => {
        const start = startRef.current;
        if (modeRef.current !== "resize" || !start?.pointerStart || !start.corner) return;
        const dx = toPt(e.clientX - start.pointerStart.x);
        const dy = toPt(e.clientY - start.pointerStart.y);
        const base = start.rect;
        let { x, y, width, height } = base;

        if (start.corner === "se") {
          width = base.width + dx;
          height = base.height + dy;
        } else if (start.corner === "sw") {
          width = base.width - dx;
          height = base.height + dy;
          x = base.x + dx;
        } else if (start.corner === "ne") {
          width = base.width + dx;
          height = base.height - dy;
          y = base.y + dy;
        } else {
          width = base.width - dx;
          height = base.height - dy;
          x = base.x + dx;
          y = base.y + dy;
        }

        if (keepAspectRatio && base.height > 0) {
          const ratio = base.width / base.height;
          height = width / ratio;
          if (start.corner === "nw" || start.corner === "ne") y = base.y + base.height - height;
        }

        width = Math.max(minWidth, width);
        height = Math.max(minHeight, height);
        onChange({ x, y, width, height, rotation: base.rotation });
      },
      onPointerUp: (e: React.PointerEvent) => {
        pointersRef.current.delete(e.pointerId);
        endGestureIfDone();
      },
      onPointerCancel: (e: React.PointerEvent) => {
        pointersRef.current.delete(e.pointerId);
        endGestureIfDone();
      },
    };
  }

  const rotateHandlers = {
    onPointerDown: (e: React.PointerEvent) => {
      if (disabled) return;
      e.stopPropagation();
      trySetPointerCapture(e.currentTarget as Element, e.pointerId);
      const el = elementRef.current;
      const box = el?.getBoundingClientRect();
      const center = box
        ? { x: box.left + box.width / 2, y: box.top + box.height / 2 }
        : { x: e.clientX, y: e.clientY };
      const startAngle = Math.atan2(e.clientY - center.y, e.clientX - center.x) * (180 / Math.PI);
      modeRef.current = "rotate";
      startRef.current = { rect: { ...rect }, center, startAngle };
      beginGesture();
    },
    onPointerMove: (e: React.PointerEvent) => {
      const start = startRef.current;
      if (modeRef.current !== "rotate" || !start?.center || start.startAngle === undefined) return;
      const angle = Math.atan2(e.clientY - start.center.y, e.clientX - start.center.x) * (180 / Math.PI);
      const delta = angle - start.startAngle;
      onChange({ ...start.rect, rotation: start.rect.rotation + delta });
    },
    onPointerUp: (e: React.PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      endGestureIfDone();
    },
    onPointerCancel: (e: React.PointerEvent) => {
      pointersRef.current.delete(e.pointerId);
      endGestureIfDone();
    },
  };

  return { elementRef, bodyHandlers, makeResizeHandleHandlers, rotateHandlers };
}
