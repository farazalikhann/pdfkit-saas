"use client";

import * as React from "react";
import { toast } from "sonner";
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
import { PagePicker, type PageGroup } from "@/components/page-picker/page-picker";
import { usePageThumbnails } from "@/hooks/use-page-thumbnails";
import { splitPdf, zipResults, chunkRanges } from "@/lib/pdf/split";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import type { ToolDefinition } from "@/lib/tools";

type Mode = "points" | "everyN" | "everyPage";

export function SplitPdfTool({ tool }: { tool: ToolDefinition }) {
  const [mode, setMode] = React.useState<Mode>("points");
  const [file, setFile] = React.useState<File | null>(null);
  const [gapsAfter, setGapsAfter] = React.useState<Set<number>>(new Set());
  const [groups, setGroups] = React.useState<PageGroup[]>([]);
  const [everyN, setEveryN] = React.useState(1);
  const [prefix, setPrefix] = React.useState("");
  const { pageCount, error: loadError } = usePageThumbnails(mode === "points" ? null : file);

  const everyNGroups = React.useMemo(
    () => (pageCount > 0 ? chunkRanges(pageCount, Math.max(1, everyN)) : []),
    [pageCount, everyN]
  );

  const ready =
    mode === "points"
      ? groups.length > 1
      : mode === "everyN"
      ? everyNGroups.length > 0 && !loadError
      : pageCount > 0 && !loadError;

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Split PDF"}
      canRun={() => ready}
      onFilesChange={(files) => {
        const f = files[0] ?? null;
        setFile(f);
        setGapsAfter(new Set());
        setGroups([]);
        if (f) {
          const risk = checkFileMemoryRisk(f);
          if (risk) toast.warning(risk);
        }
      }}
      notice={() => (
        <p className="text-xs text-muted-foreground">
          Choose where to split with the visual picker, split every N pages, or
          pull out every page as its own file.
        </p>
      )}
      preview={({ files }) =>
        files[0] ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Split mode</Label>
              <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Split at chosen points</SelectItem>
                  <SelectItem value="everyN">Split every N pages</SelectItem>
                  <SelectItem value="everyPage">Extract each page separately</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loadError && mode !== "points" && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                {loadError}
              </p>
            )}

            {mode === "points" && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Tap the scissors between pages to mark where each part ends.
                </p>
                <PagePicker
                  mode="split-points"
                  file={files[0]}
                  gapsAfter={gapsAfter}
                  onToggleGap={(page) =>
                    setGapsAfter((prev) => {
                      const next = new Set(prev);
                      if (next.has(page)) next.delete(page);
                      else next.add(page);
                      return next;
                    })
                  }
                  onGroupsChange={setGroups}
                />
                {groups.length > 0 && (
                  <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium">
                    {groups
                      .map(
                        (g, i) =>
                          `Part ${i + 1}: page${g.from === g.to ? "" : "s"} ${
                            g.from === g.to ? g.from : `${g.from}-${g.to}`
                          }`
                      )
                      .join(" · ")}
                  </p>
                )}
              </div>
            )}

            {mode === "everyN" && (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label htmlFor="everyN">Pages per file</Label>
                  <Input
                    id="everyN"
                    type="number"
                    min={1}
                    value={everyN}
                    onChange={(e) => setEveryN(Math.max(1, Number(e.target.value) || 1))}
                  />
                </div>
                {everyNGroups.length > 0 && (
                  <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium">
                    {everyNGroups.length} file{everyNGroups.length > 1 ? "s" : ""} —{" "}
                    {everyNGroups
                      .map((g, i) => `Part ${i + 1}: pages ${g.from}-${g.to}`)
                      .join(" · ")}
                  </p>
                )}
              </div>
            )}

            {mode === "everyPage" && pageCount > 0 && (
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs font-medium">
                {pageCount} files — one per page.
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="prefix">Output file name prefix</Label>
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
        const splitMode =
          mode === "points"
            ? { type: "ranges" as const, ranges: groups }
            : mode === "everyN"
            ? { type: "everyN" as const, n: everyN }
            : { type: "everyPage" as const };

        const results = await splitPdf(files[0], splitMode, prefix);
        if (results.length === 0) {
          throw new Error("No pages matched — check your split points and try again.");
        }

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
