"use client";

import * as React from "react";
import { RotateCw } from "lucide-react";
import { useElementGesture } from "./use-element-gesture";
import type { Rect } from "./types";
import { cn } from "@/lib/utils";

interface ElementFrameProps {
  rect: Rect;
  pixelsPerPoint: number;
  selected: boolean;
  onSelect: () => void;
  onChange: (next: Rect) => void;
  onGestureStart: () => void;
  onGestureEnd?: () => void;
  keepAspectRatio?: boolean;
  minWidth?: number;
  minHeight?: number;
  showResizeHandles?: boolean;
  showRotateHandle?: boolean;
  children: React.ReactNode;
  className?: string;
}

const HANDLE_PX = 28; // touch-friendly — comfortably above the 44px min target once padding/hit-area is added

export function ElementFrame({
  rect,
  pixelsPerPoint,
  selected,
  onSelect,
  onChange,
  onGestureStart,
  onGestureEnd,
  keepAspectRatio,
  minWidth,
  minHeight,
  showResizeHandles = true,
  showRotateHandle = true,
  children,
  className,
}: ElementFrameProps) {
  const { elementRef, bodyHandlers, makeResizeHandleHandlers, rotateHandlers } = useElementGesture({
    rect,
    onChange,
    onGestureStart,
    onGestureEnd,
    pixelsPerPoint,
    keepAspectRatio,
    minWidth,
    minHeight,
    disabled: !selected,
  });

  const style: React.CSSProperties = {
    position: "absolute",
    left: rect.x * pixelsPerPoint,
    top: rect.y * pixelsPerPoint,
    width: rect.width * pixelsPerPoint,
    height: rect.height * pixelsPerPoint,
    transform: `rotate(${rect.rotation}deg)`,
    transformOrigin: "center center",
    touchAction: "none",
  };

  return (
    <div
      ref={elementRef}
      style={style}
      className={cn(
        "select-none",
        selected && "outline outline-2 outline-primary outline-offset-2",
        className
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        onSelect();
        if (selected) bodyHandlers.onPointerDown(e);
      }}
      onPointerMove={selected ? bodyHandlers.onPointerMove : undefined}
      onPointerUp={selected ? bodyHandlers.onPointerUp : undefined}
      onPointerCancel={selected ? bodyHandlers.onPointerCancel : undefined}
    >
      {children}

      {selected && (
        <>
          {showResizeHandles &&
            (["nw", "ne", "sw", "se"] as const).map((corner) => (
              <div
                key={corner}
                {...makeResizeHandleHandlers(corner)}
                className="absolute rounded-full border-2 border-primary bg-background shadow"
                style={{
                  width: HANDLE_PX,
                  height: HANDLE_PX,
                  touchAction: "none",
                  cursor: `${corner}-resize`,
                  left: corner.includes("w") ? -HANDLE_PX / 2 : undefined,
                  right: corner.includes("e") ? -HANDLE_PX / 2 : undefined,
                  top: corner.includes("n") ? -HANDLE_PX / 2 : undefined,
                  bottom: corner.includes("s") ? -HANDLE_PX / 2 : undefined,
                }}
              />
            ))}
          {showRotateHandle && (
            <div
              {...rotateHandlers}
              className="absolute left-1/2 flex items-center justify-center rounded-full border-2 border-primary bg-background shadow"
              style={{
                width: HANDLE_PX,
                height: HANDLE_PX,
                top: -HANDLE_PX * 2,
                transform: "translateX(-50%)",
                touchAction: "none",
                cursor: "grab",
              }}
            >
              <RotateCw className="h-3.5 w-3.5 text-primary" />
            </div>
          )}
          {showRotateHandle && (
            <div
              className="absolute left-1/2 top-0 w-px bg-primary/50"
              style={{ height: HANDLE_PX * 1.5, transform: "translate(-50%, -100%)" }}
            />
          )}
        </>
      )}
    </div>
  );
}
