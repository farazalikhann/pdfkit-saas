"use client";

import * as React from "react";
import { toast } from "sonner";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateSpreadsheet } from "@/lib/files/validate-file";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { useToolWorker } from "@/hooks/use-tool-worker";
import type {
  ExcelToPdfRequest,
  ExcelToPdfResult,
} from "@/lib/workers/excel-to-pdf.types";
import type { ToolDefinition } from "@/lib/tools";

type Orientation = "auto" | "portrait" | "landscape";

function createWorker() {
  return new Worker(new URL("../../lib/workers/excel-to-pdf.worker.ts", import.meta.url));
}

export function ExcelToPdfTool({ tool }: { tool: ToolDefinition }) {
  const [sheetNames, setSheetNames] = React.useState<string[]>([]);
  const [selectedSheets, setSelectedSheets] = React.useState<Set<string>>(new Set());
  const [orientation, setOrientation] = React.useState<Orientation>("auto");
  const [loadingSheets, setLoadingSheets] = React.useState(false);
  const currentFileRef = React.useRef<File | null>(null);
  const { run } = useToolWorker<ExcelToPdfRequest, ExcelToPdfResult>(createWorker);

  async function loadSheetNames(file: File) {
    setLoadingSheets(true);
    try {
      const isCsv = /\.csv$/i.test(file.name) || file.type === "text/csv";
      if (isCsv) {
        setSheetNames(["Sheet1"]);
        setSelectedSheets(new Set(["Sheet1"]));
        return;
      }
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { bookSheets: true });
      setSheetNames(workbook.SheetNames);
      setSelectedSheets(new Set(workbook.SheetNames));
    } catch {
      toast.error("Couldn't read this spreadsheet's sheets.");
      setSheetNames([]);
    } finally {
      setLoadingSheets(false);
    }
  }

  function toggleSheet(name: string) {
    setSelectedSheets((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  return (
    <ToolShell
      tool={tool}
      actionLabel={() =>
        selectedSheets.size > 1
          ? `Convert ${selectedSheets.size} sheets`
          : "Convert to PDF"
      }
      canRun={() => selectedSheets.size > 0}
      notice={() => (
        <p className="text-xs text-muted-foreground">
          Renders cell values as styled tables. Charts, formulas, and
          conditional formatting aren&apos;t reproduced.
        </p>
      )}
      onFilesChange={(files) => {
        const file = files[0] ?? null;
        if (file !== currentFileRef.current) {
          currentFileRef.current = file;
          if (file) {
            const risk = checkFileMemoryRisk(file);
            if (risk) toast.warning(risk);
            void loadSheetNames(file);
          } else {
            setSheetNames([]);
            setSelectedSheets(new Set());
          }
        }
      }}
      options={() => (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Page orientation</Label>
            <Select value={orientation} onValueChange={(v) => setOrientation(v as Orientation)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto (landscape for wide sheets)</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
                <SelectItem value="landscape">Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sheetNames.length > 1 && (
            <div className="space-y-1.5">
              <Label>Sheets to include</Label>
              <div className="space-y-1 rounded-lg border border-border p-2">
                {sheetNames.map((name) => (
                  <label
                    key={name}
                    className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-sm"
                  >
                    <Checkbox
                      checked={selectedSheets.has(name)}
                      onCheckedChange={() => toggleSheet(name)}
                    />
                    {name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {loadingSheets && (
            <p className="text-xs text-muted-foreground">Reading sheets…</p>
          )}
        </div>
      )}
      onProcess={async (files, reportProgress) => {
        await validateSpreadsheet(files[0]);
        const fileBuffer = await files[0].arrayBuffer();
        const orderedSheets = sheetNames.filter((s) => selectedSheets.has(s));

        const result = await run(
          { fileBuffer, sheetNames: orderedSheets, orientation },
          reportProgress,
          [fileBuffer]
        );

        return [
          {
            name: "converted.pdf",
            blob: new Blob([new Uint8Array(result.bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
