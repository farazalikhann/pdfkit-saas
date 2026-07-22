"use client";

import * as React from "react";
import { toast } from "sonner";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { PagePicker } from "@/components/page-picker/page-picker";
import { formatPageRange } from "@/lib/pdf/page-ranges";
import { removePages } from "@/lib/pdf/remove-pages";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import type { ToolDefinition } from "@/lib/tools";

export function RemovePagesTool({ tool }: { tool: ToolDefinition }) {
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [pageCount, setPageCount] = React.useState(0);
  const [pickerError, setPickerError] = React.useState<string | null>(null);

  const wouldRemoveAll = pageCount > 0 && selected.size === pageCount;
  const survivingCount = pageCount - selected.size;
  const survivingRange = React.useMemo(() => {
    if (pageCount === 0) return "";
    const surviving = new Set<number>();
    for (let p = 1; p <= pageCount; p++) if (!selected.has(p)) surviving.add(p);
    return formatPageRange(surviving);
  }, [selected, pageCount]);

  return (
    <ToolShell
      tool={tool}
      actionLabel={() =>
        selected.size > 1 ? `Remove ${selected.size} pages` : "Remove page"
      }
      canRun={() => selected.size > 0 && !wouldRemoveAll && !pickerError}
      onFilesChange={(files) => {
        setSelected(new Set());
        setPageCount(0);
        const f = files[0];
        if (f) {
          const risk = checkFileMemoryRisk(f);
          if (risk) toast.warning(risk);
        }
      }}
      notice={() => (
        <p className="text-xs text-muted-foreground">
          Select the pages to delete — everything else is kept, in order.
        </p>
      )}
      preview={({ files }) =>
        files[0] ? (
          <div className="space-y-3">
            <PagePicker
              mode="select"
              file={files[0]}
              selected={selected}
              onSelectedChange={setSelected}
              variant="danger"
              onPageCountChange={setPageCount}
              onError={setPickerError}
            />
            {wouldRemoveAll ? (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                That&apos;s every page — leave at least one page selected to keep.
              </p>
            ) : selected.size > 0 ? (
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium">
                {survivingCount} page{survivingCount === 1 ? "" : "s"} will remain: {survivingRange}
              </p>
            ) : null}
          </div>
        ) : null
      }
      onProcess={async (files) => {
        if (selected.size === 0) throw new Error("Select at least one page to remove.");
        const bytes = await removePages(files[0], selected);
        return [
          {
            name: "pages-removed.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
