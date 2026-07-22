"use client";

import * as React from "react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { splitPdf, zipResults, type PageRange } from "@/lib/pdf/split";
import type { ToolDefinition } from "@/lib/tools";

type Mode = "ranges" | "everyN" | "everyPage";

function parseRanges(input: string): PageRange[] {
  return input
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [from, to] = part.split("-").map((n) => parseInt(n.trim(), 10));
      return { from, to: Number.isNaN(to) ? from : to };
    })
    .filter((r) => !Number.isNaN(r.from) && r.from > 0);
}

export function SplitPdfTool({ tool }: { tool: ToolDefinition }) {
  const [mode, setMode] = React.useState<Mode>("ranges");
  const [rangesText, setRangesText] = React.useState("1-1");
  const [everyN, setEveryN] = React.useState(1);

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Split PDF"}
      canRun={() =>
        mode !== "ranges" || parseRanges(rangesText).length > 0
      }
      options={() => (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Split mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ranges">Custom page ranges</SelectItem>
                <SelectItem value="everyN">Every N pages</SelectItem>
                <SelectItem value="everyPage">Every page separately</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {mode === "ranges" && (
            <div className="space-y-1.5">
              <Label htmlFor="ranges">Page ranges</Label>
              <Input
                id="ranges"
                value={rangesText}
                onChange={(e) => setRangesText(e.target.value)}
                placeholder="e.g. 1-3, 4-6, 7"
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated ranges. Each range becomes its own PDF.
              </p>
            </div>
          )}

          {mode === "everyN" && (
            <div className="space-y-1.5">
              <Label htmlFor="everyN">Pages per file</Label>
              <Input
                id="everyN"
                type="number"
                min={1}
                value={everyN}
                onChange={(e) => setEveryN(Math.max(1, Number(e.target.value)))}
              />
            </div>
          )}
        </div>
      )}
      onProcess={async (files) => {
        const file = files[0];
        const results = await splitPdf(
          file,
          mode === "ranges"
            ? { type: "ranges", ranges: parseRanges(rangesText) }
            : mode === "everyN"
            ? { type: "everyN", n: everyN }
            : { type: "everyPage" }
        );

        if (results.length === 1) {
          return [
            {
              name: results[0].name,
              blob: new Blob([new Uint8Array(results[0].bytes)], {
                type: "application/pdf",
              }),
            },
          ];
        }

        const zipped = await zipResults(results);
        return [{ name: zipped.name, blob: zipped.blob }];
      }}
    />
  );
}
