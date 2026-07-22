"use client";

import { RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RenderedPage } from "@/lib/pdf/thumbnails";

interface PdfThumbnailGridProps {
  pages: RenderedPage[];
  rotations: Record<number, number>;
  onRotate: (pageIndex: number) => void;
  loading?: boolean;
}

export function PdfThumbnailGrid({
  pages,
  rotations,
  onRotate,
  loading,
}: PdfThumbnailGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {pages.map((page, index) => {
        const rotation = rotations[index] ?? 0;
        return (
          <button
            key={page.pageNumber}
            type="button"
            onClick={() => onRotate(index)}
            className="group relative flex flex-col items-center gap-1"
          >
            <div className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- dynamically generated canvas data URLs, not a next/image candidate */}
              <img
                src={page.dataUrl}
                alt={`Page ${page.pageNumber}`}
                className="max-h-full max-w-full transition-transform duration-200"
                style={{ transform: `rotate(${rotation}deg)` }}
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              Page {page.pageNumber}
            </span>
            <span
              className={cn(
                "absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 group-active:opacity-100",
                rotation !== 0 && "opacity-100 text-primary"
              )}
            >
              <RotateCw className="h-3.5 w-3.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}
