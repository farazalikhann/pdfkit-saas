"use client";

import * as React from "react";
import { toast } from "sonner";
import { Undo2, ArrowLeftRight } from "lucide-react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Button } from "@/components/ui/button";
import { PagePicker } from "@/components/page-picker/page-picker";
import { reorderPages } from "@/lib/pdf/reorder-pages";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import type { ToolDefinition } from "@/lib/tools";

export function ReorderPagesTool({ tool }: { tool: ToolDefinition }) {
  const [order, setOrder] = React.useState<number[]>([]);
  const [pickerError, setPickerError] = React.useState<string | null>(null);
  const historyRef = React.useRef<number[][]>([]);
  const originalOrderRef = React.useRef<number[]>([]);

  function updateOrder(next: number[]) {
    historyRef.current.push(order);
    setOrder(next);
  }

  function undo() {
    const prev = historyRef.current.pop();
    if (prev) setOrder(prev);
  }

  const isReordered = order.some((page, i) => page !== originalOrderRef.current[i]);

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Save reordered PDF"}
      canRun={() => isReordered && !pickerError}
      onFilesChange={(files) => {
        setOrder([]);
        historyRef.current = [];
        originalOrderRef.current = [];
        const f = files[0];
        if (f) {
          const risk = checkFileMemoryRisk(f);
          if (risk) toast.warning(risk);
        }
      }}
      notice={() => (
        <p className="text-xs text-muted-foreground">
          Drag pages to reorder them — works with touch too. Or use the
          arrows / position number on each page if dragging is awkward.
        </p>
      )}
      preview={({ files }) =>
        files[0] ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
              <p className="text-sm text-muted-foreground">
                {order.length > 0 ? `${order.length} pages` : "Loading…"}
              </p>
              <div className="flex shrink-0 gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={order.length === 0}
                  onClick={() => updateOrder([...order].reverse())}
                  className="gap-1.5"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                  Reverse all
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={historyRef.current.length === 0}
                  onClick={undo}
                  className="gap-1.5"
                >
                  <Undo2 className="h-4 w-4" />
                  Undo
                </Button>
              </div>
            </div>

            <PagePicker
              mode="reorder"
              file={files[0]}
              order={order}
              onOrderChange={updateOrder}
              onPageCountChange={(count) => {
                if (order.length === 0) {
                  const initial = Array.from({ length: count }, (_, i) => i + 1);
                  originalOrderRef.current = initial;
                  setOrder(initial);
                }
              }}
              onError={setPickerError}
            />
          </div>
        ) : null
      }
      onProcess={async (files) => {
        const bytes = await reorderPages(files[0], order);
        return [
          {
            name: "reordered.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
