"use client";

import * as React from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { PdfThumbnailGrid } from "@/components/pdf/pdf-thumbnail-grid";
import { Button } from "@/components/ui/button";
import { renderAllThumbnails, type RenderedPage } from "@/lib/pdf/thumbnails";
import { rotatePages } from "@/lib/pdf/rotate";
import type { ToolDefinition } from "@/lib/tools";

export function RotatePagesTool({ tool }: { tool: ToolDefinition }) {
  const [currentFile, setCurrentFile] = React.useState<File | null>(null);
  const [pages, setPages] = React.useState<RenderedPage[]>([]);
  const [loadingThumbs, setLoadingThumbs] = React.useState(false);
  const [rotations, setRotations] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    if (!currentFile) {
      setPages([]);
      return;
    }
    let cancelled = false;
    setLoadingThumbs(true);
    setRotations({});
    renderAllThumbnails(currentFile).then((rendered) => {
      if (!cancelled) setPages(rendered);
    }).finally(() => {
      if (!cancelled) setLoadingThumbs(false);
    });
    return () => {
      cancelled = true;
    };
  }, [currentFile]);

  function rotateOne(index: number) {
    setRotations((prev) => ({
      ...prev,
      [index]: ((prev[index] ?? 0) + 90) % 360,
    }));
  }

  function rotateAll(delta: number) {
    setRotations((prev) => {
      const next = { ...prev };
      pages.forEach((_, i) => {
        next[i] = ((next[i] ?? 0) + delta + 360) % 360;
      });
      return next;
    });
  }

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Save rotated PDF"}
      onFilesChange={(files) => setCurrentFile(files[0] ?? null)}
      preview={() => {
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
              <p className="text-sm text-muted-foreground">
                Tap a page to rotate it, or rotate every page at once.
              </p>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Rotate all left"
                  onClick={() => rotateAll(-90)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Rotate all right"
                  onClick={() => rotateAll(90)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <PdfThumbnailGrid
              pages={pages}
              rotations={rotations}
              onRotate={rotateOne}
              loading={loadingThumbs}
            />
          </div>
        );
      }}
      canRun={() => Object.values(rotations).some((deg) => deg !== 0)}
      onProcess={async (files) => {
        const rotationList = Object.entries(rotations)
          .filter(([, deg]) => deg !== 0)
          .map(([pageIndex, deltaDegrees]) => ({
            pageIndex: Number(pageIndex),
            deltaDegrees,
          }));
        const bytes = await rotatePages(files[0], rotationList);
        return [
          {
            name: "rotated.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
