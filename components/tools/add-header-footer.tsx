"use client";

import * as React from "react";
import { toast } from "sonner";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { PagePicker } from "@/components/page-picker/page-picker";
import { loadPdfDocument, renderPageToDataUrl } from "@/lib/pdf/thumbnails";
import { formatHeaderFooterToken, type HeaderFooterSlots } from "@/lib/pdf/edit/header-footer";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { cn } from "@/lib/utils";
import type { ToolDefinition } from "@/lib/tools";

const COLORS = [
  { name: "Black", value: { r: 0.1, g: 0.1, b: 0.1 } },
  { name: "Gray", value: { r: 0.45, g: 0.45, b: 0.45 } },
  { name: "Blue", value: { r: 0.15, g: 0.3, b: 0.6 } },
];

const EMPTY_SLOTS: HeaderFooterSlots = {
  headerLeft: "",
  headerCenter: "",
  headerRight: "{filename}",
  footerLeft: "",
  footerCenter: "Page {page} of {total}",
  footerRight: "",
};

export function AddHeaderFooterTool({ tool }: { tool: ToolDefinition }) {
  const [slots, setSlots] = React.useState<HeaderFooterSlots>(EMPTY_SLOTS);
  const [fontSize, setFontSize] = React.useState(10);
  const [marginPt, setMarginPt] = React.useState(28);
  const [colorIdx, setColorIdx] = React.useState(1);
  const [applyToAll, setApplyToAll] = React.useState(true);
  const [selectedPages, setSelectedPages] = React.useState<Set<number>>(new Set());
  const [pickerError, setPickerError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  function setSlot(key: keyof HeaderFooterSlots, value: string) {
    setSlots((prev) => ({ ...prev, [key]: value }));
  }

  async function renderPreview(file: File) {
    try {
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      const rendered = await renderPageToDataUrl(doc, 1, 0.9, "image/jpeg", 0.85);
      setPreviewUrl(rendered.dataUrl);
    } catch {
      setPreviewUrl(null);
    }
  }

  const hasAnySlot = Object.values(slots).some((v) => v.trim().length > 0);
  const previewColor = `rgb(${COLORS[colorIdx].value.r * 255},${COLORS[colorIdx].value.g * 255},${COLORS[colorIdx].value.b * 255})`;

  function preview(text: string, filename: string) {
    return text.trim() ? formatHeaderFooterToken(text, 1, 1, filename) : "";
  }

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Add header & footer"}
      canRun={() => hasAnySlot && (applyToAll || selectedPages.size > 0) && !pickerError}
      onFilesChange={(files) => {
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
          Fill in any of the six slots below — left, center, right for both the
          header and footer. Use {"{page}"}, {"{total}"}, {"{date}"} or {"{filename}"}
          {" "}anywhere in the text.
        </p>
      )}
      preview={({ files }) => {
        const file = files[0];
        const filename = file?.name ?? "document.pdf";
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Preview — page 1</Label>
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-lg border border-border bg-muted">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-x-0 top-[4%] flex justify-between px-[6%] text-[7px] font-medium" style={{ color: previewColor }}>
                  <span>{preview(slots.headerLeft, filename)}</span>
                  <span>{preview(slots.headerCenter, filename)}</span>
                  <span>{preview(slots.headerRight, filename)}</span>
                </div>
                <div className="absolute inset-x-0 bottom-[4%] flex justify-between px-[6%] text-[7px] font-medium" style={{ color: previewColor }}>
                  <span>{preview(slots.footerLeft, filename)}</span>
                  <span>{preview(slots.footerCenter, filename)}</span>
                  <span>{preview(slots.footerRight, filename)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Header</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Left" value={slots.headerLeft} onChange={(e) => setSlot("headerLeft", e.target.value)} />
                <Input placeholder="Center" value={slots.headerCenter} onChange={(e) => setSlot("headerCenter", e.target.value)} />
                <Input placeholder="Right" value={slots.headerRight} onChange={(e) => setSlot("headerRight", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Footer</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input placeholder="Left" value={slots.footerLeft} onChange={(e) => setSlot("footerLeft", e.target.value)} />
                <Input placeholder="Center" value={slots.footerCenter} onChange={(e) => setSlot("footerCenter", e.target.value)} />
                <Input placeholder="Right" value={slots.footerRight} onChange={(e) => setSlot("footerRight", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Font size — {fontSize}pt</Label>
                <Slider value={[fontSize]} min={7} max={18} step={1} onValueChange={([v]) => setFontSize(v)} />
              </div>
              <div className="space-y-1.5">
                <Label>Margin — {marginPt}pt</Label>
                <Slider value={[marginPt]} min={14} max={54} step={2} onValueChange={([v]) => setMarginPt(v)} />
              </div>
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

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={applyToAll} onChange={(e) => setApplyToAll(e.target.checked)} className="h-4 w-4 rounded border-border" />
              Apply to every page
            </label>

            {!applyToAll && file && (
              <PagePicker
                mode="select"
                file={file}
                selected={selectedPages}
                onSelectedChange={setSelectedPages}
                variant="default"
                onError={setPickerError}
              />
            )}
          </div>
        );
      }}
      onProcess={async (files) => {
        const { addHeaderFooter } = await import("@/lib/pdf/edit/header-footer");
        const bytes = await addHeaderFooter(files[0], {
          ...slots,
          fontSize,
          color: COLORS[colorIdx].value,
          marginPt,
          pages: applyToAll ? null : selectedPages,
          filename: files[0].name,
        });
        return [{ name: "with-header.pdf", blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }) }];
      }}
    />
  );
}
