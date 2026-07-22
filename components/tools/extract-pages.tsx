"use client";

import * as React from "react";
import { toast } from "sonner";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { PagePicker } from "@/components/page-picker/page-picker";
import { extractPages, extractPagesSeparately } from "@/lib/pdf/extract-pages";
import { zipResults } from "@/lib/pdf/split";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import type { ToolDefinition } from "@/lib/tools";

export function ExtractPagesTool({ tool }: { tool: ToolDefinition }) {
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [separately, setSeparately] = React.useState(false);
  const [prefix, setPrefix] = React.useState("");
  const [pickerError, setPickerError] = React.useState<string | null>(null);

  return (
    <ToolShell
      tool={tool}
      actionLabel={() =>
        selected.size > 1 ? `Extract ${selected.size} pages` : "Extract page"
      }
      canRun={() => selected.size > 0 && !pickerError}
      onFilesChange={(files) => {
        setSelected(new Set());
        const f = files[0];
        if (f) {
          const risk = checkFileMemoryRisk(f);
          if (risk) toast.warning(risk);
        }
      }}
      notice={() => (
        <p className="text-xs text-muted-foreground">
          Select the pages to keep — everything else is left out. The result
          keeps the original page order.
        </p>
      )}
      preview={({ files }) =>
        files[0] ? (
          <div className="space-y-4">
            <PagePicker
              mode="select"
              file={files[0]}
              selected={selected}
              onSelectedChange={setSelected}
              variant="default"
              onError={setPickerError}
            />
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="separately" className="font-normal">
                Save each selected page as its own file
              </Label>
              <Switch id="separately" checked={separately} onCheckedChange={setSeparately} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prefix">Output file name</Label>
              <Input
                id="prefix"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder={files[0].name.replace(/\.pdf$/i, "")}
              />
            </div>
          </div>
        ) : null
      }
      onProcess={async (files) => {
        if (selected.size === 0) throw new Error("Select at least one page to extract.");

        if (!separately) {
          const result = await extractPages(files[0], selected, prefix);
          return [
            {
              name: result.name,
              blob: new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
            },
          ];
        }

        const results = await extractPagesSeparately(files[0], selected, prefix);
        if (results.length === 1) {
          return [
            {
              name: results[0].name,
              blob: new Blob([new Uint8Array(results[0].bytes)], { type: "application/pdf" }),
            },
          ];
        }
        const zipName = `${(prefix.trim() || files[0].name.replace(/\.pdf$/i, "")).replace(/[/\\?%*:|"<>]/g, "-")}.zip`;
        const zipped = await zipResults(results, zipName);
        return [
          { name: zipped.name, blob: zipped.blob },
          ...results.map((r) => ({
            name: r.name,
            blob: new Blob([new Uint8Array(r.bytes)], { type: "application/pdf" }),
          })),
        ];
      }}
    />
  );
}
