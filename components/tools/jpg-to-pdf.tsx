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
import { imagesToPdf, type PageFit } from "@/lib/pdf/jpg-to-pdf";
import type { ToolDefinition } from "@/lib/tools";

export function JpgToPdfTool({ tool }: { tool: ToolDefinition }) {
  const [fit, setFit] = React.useState<PageFit>("a4");

  return (
    <ToolShell
      tool={tool}
      canRun={({ files }) => files.length >= 1}
      actionLabel={({ files }) =>
        files.length > 1 ? `Combine ${files.length} images` : "Create PDF"
      }
      options={() => (
        <div className="space-y-1.5">
          <Label>Page size</Label>
          <Select value={fit} onValueChange={(v) => setFit(v as PageFit)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">Fit to A4</SelectItem>
              <SelectItem value="original">Match image size</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      onProcess={async (files, reportProgress) => {
        const bytes = await imagesToPdf(files, { fit, onProgress: reportProgress });
        return [
          {
            name: "images.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
