"use client";

import * as React from "react";
import { toast } from "sonner";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PagePicker } from "@/components/page-picker/page-picker";
import { loadPdfDocument, renderPageToDataUrl } from "@/lib/pdf/thumbnails";
import { formatPageNumber, type NinePosition } from "@/lib/pdf/edit/page-numbers";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { cn } from "@/lib/utils";
import type { ToolDefinition } from "@/lib/tools";

const POSITIONS: NinePosition[] = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

const PRESET_PATTERNS = [
  { label: "1", value: "{n}" },
  { label: "1 of 10", value: "{n} of {total}" },
  { label: "Page 1", value: "Page {n}" },
  { label: "Page 1 of 10", value: "Page {n} of {total}" },
  { label: "- 1 -", value: "- {n} -" },
  { label: "Custom…", value: "custom" },
];

const COLORS = [
  { name: "Black", value: { r: 0.1, g: 0.1, b: 0.1 } },
  { name: "Gray", value: { r: 0.45, g: 0.45, b: 0.45 } },
  { name: "Red", value: { r: 0.7, g: 0.15, b: 0.15 } },
];

function positionStyle(pos: NinePosition): React.CSSProperties {
  const [v, h] = pos.split("-") as ["top" | "middle" | "bottom", "left" | "center" | "right"];
  const style: React.CSSProperties = { position: "absolute" };
  if (v === "top") style.top = "4%";
  else if (v === "bottom") style.bottom = "4%";
  else style.top = "50%";
  if (h === "left") style.left = "4%";
  else if (h === "right") style.right = "4%";
  else style.left = "50%";
  if (v === "middle" && h === "center") style.transform = "translate(-50%, -50%)";
  else if (v === "middle") style.transform = "translateY(-50%)";
  else if (h === "center") style.transform = "translateX(-50%)";
  return style;
}

export function AddPageNumbersTool({ tool }: { tool: ToolDefinition }) {
  const [position, setPosition] = React.useState<NinePosition>("bottom-center");
  const [patternPreset, setPatternPreset] = React.useState(PRESET_PATTERNS[3].value);
  const [customPattern, setCustomPattern] = React.useState("Page {n} of {total}");
  const [startNumber, setStartNumber] = React.useState(1);
  const [firstPage, setFirstPage] = React.useState(1);
  const [colorIdx, setColorIdx] = React.useState(0);
  const [fontSize, setFontSize] = React.useState(11);
  const [marginPt, setMarginPt] = React.useState(28);
  const [pageCount, setPageCount] = React.useState(0);
  const [skip, setSkip] = React.useState<Set<number>>(new Set());
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [pickerError, setPickerError] = React.useState<string | null>(null);

  const pattern = patternPreset === "custom" ? customPattern : patternPreset;
  const numbered = pageCount > 0 ? Array.from({ length: pageCount }, (_, i) => i + 1).filter((p) => p >= firstPage && !skip.has(p)) : [];
  const previewLabel = formatPageNumber(pattern, startNumber, startNumber + Math.max(0, numbered.length - 1));

  async function renderPreview(file: File) {
    try {
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      const targetPage = numbered[0] ?? 1;
      const rendered = await renderPageToDataUrl(doc, targetPage, 0.9, "image/jpeg", 0.85);
      setPreviewUrl(rendered.dataUrl);
    } catch {
      setPreviewUrl(null);
    }
  }

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Add page numbers"}
      canRun={() => numbered.length > 0 && !pickerError}
      onFilesChange={(files) => {
        setPageCount(0);
        setSkip(new Set());
        setPreviewUrl(null);
        const f = files[0];
        if (f) {
          const risk = checkFileMemoryRisk(f);
          if (risk) toast.warning(risk);
          void renderPreview(f);
        }
      }}
      notice={() => (
        <p className="text-xs text-muted-foreground">
          Choose a position and format, preview it on an actual page, then apply
          to a page range.
        </p>
      )}
      preview={({ files }) => {
        const file = files[0];
        if (!file) return null;
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Preview — page {numbered[0] ?? 1}</Label>
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-lg border border-border bg-muted">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                )}
                <span
                  style={{
                    ...positionStyle(position),
                    fontSize: Math.max(9, fontSize * 0.6),
                    color: `rgb(${COLORS[colorIdx].value.r * 255},${COLORS[colorIdx].value.g * 255},${COLORS[colorIdx].value.b * 255})`,
                  }}
                  className="font-medium"
                >
                  {previewLabel}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Position</Label>
              <div className="mx-auto grid w-full max-w-[220px] grid-cols-3 gap-1.5">
                {POSITIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPosition(p)}
                    className={cn(
                      "aspect-square rounded-md border",
                      position === p ? "border-primary bg-primary/10" : "border-border"
                    )}
                    aria-label={p}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Format</Label>
              <Select value={patternPreset} onValueChange={setPatternPreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_PATTERNS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {patternPreset === "custom" && (
                <Input
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  placeholder="e.g. Draft — {n}/{total}"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start number</Label>
                <Input type="number" min={0} value={startNumber} onChange={(e) => setStartNumber(Number(e.target.value) || 0)} />
              </div>
              <div className="space-y-1.5">
                <Label>First page to number</Label>
                <Input
                  type="number"
                  min={1}
                  max={pageCount || undefined}
                  value={firstPage}
                  onChange={(e) => setFirstPage(Math.max(1, Number(e.target.value) || 1))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Font size — {fontSize}pt</Label>
              <Slider value={[fontSize]} min={8} max={24} step={1} onValueChange={([v]) => setFontSize(v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Margin — {marginPt}pt</Label>
              <Slider value={[marginPt]} min={10} max={60} step={2} onValueChange={([v]) => setMarginPt(v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    aria-label={c.name}
                    onClick={() => setColorIdx(i)}
                    className={cn("h-8 w-8 rounded-full border-2", colorIdx === i ? "border-primary" : "border-transparent")}
                    style={{ backgroundColor: `rgb(${c.value.r * 255},${c.value.g * 255},${c.value.b * 255})` }}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Skip specific pages (optional)</Label>
              <PagePicker
                mode="select"
                file={file}
                selected={skip}
                onSelectedChange={setSkip}
                variant="danger"
                onPageCountChange={setPageCount}
                onError={setPickerError}
              />
            </div>
          </div>
        );
      }}
      onProcess={async (files) => {
        const { addPageNumbers } = await import("@/lib/pdf/edit/page-numbers");
        const bytes = await addPageNumbers(files[0], {
          position,
          pattern,
          startNumber,
          firstPageToNumber: firstPage,
          pagesToNumber: skip.size > 0 ? new Set(numbered) : null,
          fontSize,
          color: COLORS[colorIdx].value,
          marginPt,
        });
        return [{ name: "numbered.pdf", blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }) }];
      }}
    />
  );
}
