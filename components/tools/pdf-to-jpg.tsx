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
import { pdfToJpgZip, type ImageFormat } from "@/lib/pdf/pdf-to-jpg";
import type { ToolDefinition } from "@/lib/tools";

const PRESETS = {
  standard: { scale: 1.5, quality: 0.85, label: "Standard (fast)" },
  high: { scale: 3, quality: 0.95, label: "High resolution" },
} as const;

type PresetKey = keyof typeof PRESETS;

export function PdfToJpgTool({ tool }: { tool: ToolDefinition }) {
  const [preset, setPreset] = React.useState<PresetKey>("standard");
  const [format, setFormat] = React.useState<ImageFormat>("jpeg");

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => (format === "png" ? "Convert to PNG" : "Convert to JPG")}
      options={() => (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Format</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as ImageFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPG</SelectItem>
                <SelectItem value="png">PNG (lossless, larger files)</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
        </div>
      )}
      onProcess={async (files, reportProgress) => {
        const { scale, quality } = PRESETS[preset];
        const result = await pdfToJpgZip(files[0], {
          scale,
          quality,
          format,
          onProgress: reportProgress,
        });
        return [{ name: result.name, blob: result.blob }];
      }}
    />
  );
}
