"use client";

import * as React from "react";
import { toast } from "sonner";
import { ToolShell, type ToolShellHelpers } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { cn, formatBytes } from "@/lib/utils";
import { compressPdf, type CompressionLevel } from "@/lib/pdf/compress";
import type { ToolDefinition } from "@/lib/tools";

const LEVELS: { value: CompressionLevel; label: string; hint: string }[] = [
  { value: "low", label: "Low", hint: "Best quality, smallest reduction" },
  { value: "recommended", label: "Recommended", hint: "Balanced size and quality" },
  { value: "extreme", label: "Extreme", hint: "Smallest file, lower quality" },
];

export function CompressPdfTool({ tool }: { tool: ToolDefinition }) {
  const [level, setLevel] = React.useState<CompressionLevel>("recommended");

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Compress PDF"}
      options={({ files }: ToolShellHelpers) => (
        <div className="space-y-4">
          {files[0] && (
            <p className="text-sm text-muted-foreground">
              Original size: <span className="font-medium text-foreground">{formatBytes(files[0].size)}</span>
            </p>
          )}
          <div className="space-y-1.5">
            <Label>Compression level</Label>
            <div className="grid grid-cols-3 gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setLevel(l.value)}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-center text-sm font-medium transition-colors",
                    level === l.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {l.label}
                  <span className="mt-1 block text-[11px] font-normal leading-tight text-muted-foreground">
                    {l.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      onProcess={async (files, reportProgress) => {
        const result = await compressPdf(files[0], level, reportProgress);
        const reduction = Math.max(
          0,
          Math.round((1 - result.compressedSize / result.originalSize) * 100)
        );
        toast.success(`Compressed by ${reduction}%`, {
          description: `${formatBytes(result.originalSize)} → ${formatBytes(
            result.compressedSize
          )}`,
        });
        return [
          {
            name: "compressed.pdf",
            blob: new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
