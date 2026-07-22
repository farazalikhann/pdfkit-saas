"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw, RotateCw, RefreshCw } from "lucide-react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Button } from "@/components/ui/button";
import { PagePicker } from "@/components/page-picker/page-picker";
import { rotatePages, type PageRotation } from "@/lib/pdf/rotate";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import type { ToolDefinition } from "@/lib/tools";

export function RotatePagesTool({ tool }: { tool: ToolDefinition }) {
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [rotations, setRotations] = React.useState<Map<number, number>>(new Map());
  const [pageCount, setPageCount] = React.useState(0);
  const [pickerError, setPickerError] = React.useState<string | null>(null);

  function applyDelta(pages: Set<number> | number[], delta: number) {
    setRotations((prev) => {
      const next = new Map(prev);
      Array.from(pages).forEach((page) => {
        next.set(page, ((next.get(page) ?? 0) + delta + 360) % 360);
      });
      return next;
    });
  }

  const hasAnyRotation = Array.from(rotations.values()).some((deg) => deg !== 0);
  const allPages = React.useMemo(
    () => Array.from({ length: pageCount }, (_, i) => i + 1),
    [pageCount]
  );

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Save rotated PDF"}
      canRun={() => hasAnyRotation && !pickerError}
      onFilesChange={(files) => {
        setSelected(new Set());
        setRotations(new Map());
        setPageCount(0);
        const f = files[0];
        if (f) {
          const risk = checkFileMemoryRisk(f);
          if (risk) toast.warning(risk);
        }
      }}
      notice={() => (
        <p className="text-xs text-muted-foreground">
          Select pages, then rotate just the selection — or rotate every page
          at once with the shortcut below.
        </p>
      )}
      preview={({ files }) =>
        files[0] ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
              <p className="text-sm font-medium">
                {selected.size > 0 ? `Rotate ${selected.size} selected` : "Select pages to rotate"}
              </p>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Rotate selection left 90°"
                  disabled={selected.size === 0}
                  onClick={() => applyDelta(selected, -90)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Rotate selection right 90°"
                  disabled={selected.size === 0}
                  onClick={() => applyDelta(selected, 90)}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={selected.size === 0}
                  onClick={() => applyDelta(selected, 180)}
                >
                  180°
                </Button>
              </div>
            </div>

            <PagePicker
              mode="select"
              file={files[0]}
              selected={selected}
              onSelectedChange={setSelected}
              variant="default"
              rotations={rotations}
              onPageCountChange={setPageCount}
              onError={setPickerError}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-border p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
                Shortcut: rotate every page
              </p>
              <div className="flex shrink-0 gap-1.5">
                <Button variant="ghost" size="sm" onClick={() => applyDelta(allPages, -90)}>
                  All ↺ 90°
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyDelta(allPages, 90)}>
                  All ↻ 90°
                </Button>
                <Button variant="ghost" size="sm" onClick={() => applyDelta(allPages, 180)}>
                  All 180°
                </Button>
              </div>
            </div>
          </div>
        ) : null
      }
      onProcess={async (files) => {
        const rotationList: PageRotation[] = Array.from(rotations.entries())
          .filter(([, deg]) => deg !== 0)
          .map(([page, deltaDegrees]) => ({ pageIndex: page - 1, deltaDegrees }));
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
