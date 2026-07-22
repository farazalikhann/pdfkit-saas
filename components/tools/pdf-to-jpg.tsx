"use client";

import * as React from "react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { pdfToJpgZip } from "@/lib/pdf/pdf-to-jpg";
import type { ToolDefinition } from "@/lib/tools";

const PRESETS = {
  standard: { scale: 1.5, quality: 0.85, label: "Standard (fast)" },
  high: { scale: 3, quality: 0.95, label: "High resolution" },
} as const;

type PresetKey = keyof typeof PRESETS;

export function PdfToJpgTool({ tool }: { tool: ToolDefinition }) {
  const [preset, setPreset] = React.useState<PresetKey>("standard");

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Convert to JPG"}
      options={() => (
        <div className="space-y-1.5">
          <Label>Image quality</Label>
          <Select value={preset} onValueChange={(v) => setPreset(v as PresetKey)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PRESETS).map(([key, p]) => (
                <SelectItem key={key} value={key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      onProcess={async (files, reportProgress) => {
        const { scale, quality } = PRESETS[preset];
        const result = await pdfToJpgZip(files[0], {
          scale,
          quality,
          onProgress: reportProgress,
        });
        return [{ name: result.name, blob: result.blob }];
      }}
    />
  );
}
