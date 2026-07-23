"use client";

import * as React from "react";
import { toast } from "sonner";
import { ImagePlus } from "lucide-react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PagePicker } from "@/components/page-picker/page-picker";
import { loadPdfDocument, renderPageToDataUrl } from "@/lib/pdf/thumbnails";
import type { WatermarkPosition } from "@/lib/pdf/watermark";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { cn } from "@/lib/utils";
import type { ToolDefinition } from "@/lib/tools";

const COLORS = [
  { name: "Red", value: { r: 0.6, g: 0.05, b: 0.05 } },
  { name: "Gray", value: { r: 0.4, g: 0.4, b: 0.4 } },
  { name: "Blue", value: { r: 0.1, g: 0.2, b: 0.6 } },
  { name: "Black", value: { r: 0.05, g: 0.05, b: 0.05 } },
];

const GRID_POSITIONS: WatermarkPosition[] = [
  "top-left", "top-center", "top-right",
  "middle-left", "middle-center", "middle-right",
  "bottom-left", "bottom-center", "bottom-right",
];

function positionStyle(pos: WatermarkPosition): React.CSSProperties {
  if (pos === "tiled") return {};
  const [v, h] = pos.split("-") as ["top" | "middle" | "bottom", "left" | "center" | "right"];
  const style: React.CSSProperties = { position: "absolute" };
  if (v === "top") style.top = "6%";
  else if (v === "bottom") style.bottom = "6%";
  else style.top = "50%";
  if (h === "left") style.left = "6%";
  else if (h === "right") style.right = "6%";
  else style.left = "50%";
  if (v === "middle" && h === "center") style.transform = "translate(-50%, -50%)";
  else if (v === "middle") style.transform = "translateY(-50%)";
  else if (h === "center") style.transform = "translateX(-50%)";
  return style;
}

export function AddWatermarkTool({ tool }: { tool: ToolDefinition }) {
  const [kind, setKind] = React.useState<"text" | "image">("text");
  const [text, setText] = React.useState("CONFIDENTIAL");
  const [imageDataUrl, setImageDataUrl] = React.useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = React.useState<"image/png" | "image/jpeg">("image/png");
  const [imageScale, setImageScale] = React.useState(40);
  const [fontSize, setFontSize] = React.useState(48);
  const [opacity, setOpacity] = React.useState(25);
  const [rotation, setRotation] = React.useState(-45);
  const [colorIndex, setColorIndex] = React.useState(0);
  const [position, setPosition] = React.useState<WatermarkPosition>("middle-center");
  const [layer, setLayer] = React.useState<"front" | "behind">("front");
  const [applyToAll, setApplyToAll] = React.useState(true);
  const [selectedPages, setSelectedPages] = React.useState<Set<number>>(new Set());
  const [pickerError, setPickerError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

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

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Add watermark"}
      canRun={() =>
        (kind === "text" ? text.trim().length > 0 : !!imageDataUrl) &&
        (applyToAll || selectedPages.size > 0) &&
        !pickerError
      }
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
          Stamp text or an image watermark, in front of or behind the page content.
        </p>
      )}
      preview={({ files }) => {
        const file = files[0];
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Preview</Label>
              <div className="relative mx-auto aspect-[3/4] w-full max-w-[220px] overflow-hidden rounded-lg border border-border bg-muted">
                {previewUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                )}
                {position === "tiled" ? (
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-4 place-items-center">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <span
                        key={i}
                        style={{
                          transform: `rotate(${rotation}deg)`,
                          opacity: opacity / 100,
                          fontSize: 8,
                          color: `rgb(${COLORS[colorIndex].value.r * 255},${COLORS[colorIndex].value.g * 255},${COLORS[colorIndex].value.b * 255})`,
                        }}
                        className="font-bold"
                      >
                        {kind === "text" ? text.slice(0, 6) : "IMG"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span
                    style={{
                      ...positionStyle(position),
                      transform: `${positionStyle(position).transform ?? ""} rotate(${rotation}deg)`.trim(),
                      opacity: opacity / 100,
                      color: `rgb(${COLORS[colorIndex].value.r * 255},${COLORS[colorIndex].value.g * 255},${COLORS[colorIndex].value.b * 255})`,
                    }}
                    className="text-sm font-bold"
                  >
                    {kind === "text" ? text : imageDataUrl ? "🖼" : ""}
                  </span>
                )}
              </div>
            </div>

            <Tabs value={kind} onValueChange={(v) => setKind(v as "text" | "image")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="image">Image</TabsTrigger>
              </TabsList>
            </Tabs>

            {kind === "text" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="wm-text">Watermark text</Label>
                  <Input id="wm-text" value={text} onChange={(e) => setText(e.target.value)} placeholder="CONFIDENTIAL" />
                </div>
                <div className="space-y-1.5">
                  <Label>Font size — {fontSize}pt</Label>
                  <Slider value={[fontSize]} min={12} max={96} step={2} onValueChange={([v]) => setFontSize(v)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {COLORS.map((c, i) => (
                      <button
                        key={c.name}
                        type="button"
                        aria-label={c.name}
                        onClick={() => setColorIndex(i)}
                        className={cn("h-9 w-9 rounded-full border-2", colorIndex === i ? "border-primary" : "border-transparent")}
                        style={{ backgroundColor: `rgb(${c.value.r * 255},${c.value.g * 255},${c.value.b * 255})` }}
                      />
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <Label>Image</Label>
                <Button variant="outline" className="w-full gap-1.5" onClick={() => imageInputRef.current?.click()}>
                  <ImagePlus className="h-4 w-4" />
                  {imageDataUrl ? "Change image" : "Choose image"}
                </Button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = "";
                    if (!f) return;
                    setImageMimeType(f.type === "image/png" ? "image/png" : "image/jpeg");
                    const reader = new FileReader();
                    reader.onload = () => setImageDataUrl(reader.result as string);
                    reader.readAsDataURL(f);
                  }}
                />
                <Label>Size — {imageScale}% of page width</Label>
                <Slider value={[imageScale]} min={10} max={90} step={5} onValueChange={([v]) => setImageScale(v)} />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Opacity — {opacity}%</Label>
              <Slider value={[opacity]} min={5} max={90} step={5} onValueChange={([v]) => setOpacity(v)} />
            </div>
            <div className="space-y-1.5">
              <Label>Rotation — {rotation}°</Label>
              <Slider value={[rotation]} min={-90} max={90} step={5} onValueChange={([v]) => setRotation(v)} />
            </div>

            <div className="space-y-1.5">
              <Label>Position</Label>
              <div className="mx-auto grid w-full max-w-[220px] grid-cols-3 gap-1.5">
                {GRID_POSITIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPosition(p)}
                    aria-label={p}
                    className={cn("aspect-square rounded-md border", position === p ? "border-primary bg-primary/10" : "border-border")}
                  />
                ))}
              </div>
              <Button
                variant={position === "tiled" ? "default" : "outline"}
                size="sm"
                className="w-full"
                onClick={() => setPosition("tiled")}
              >
                Tile across whole page
              </Button>
            </div>

            <div className="space-y-1.5">
              <Label>Layer</Label>
              <Select value={layer} onValueChange={(v) => setLayer(v as "front" | "behind")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="front">In front of content</SelectItem>
                  <SelectItem value="behind">Behind content</SelectItem>
                </SelectContent>
              </Select>
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
        const { addWatermark } = await import("@/lib/pdf/watermark");
        const bytes = await addWatermark(files[0], {
          kind,
          text,
          fontSize,
          color: COLORS[colorIndex].value,
          imageDataUrl: imageDataUrl ?? undefined,
          imageMimeType,
          imageScale: imageScale / 100,
          opacity: opacity / 100,
          rotationDegrees: rotation,
          position,
          layer,
          pages: applyToAll ? null : selectedPages,
        });
        return [{ name: "watermarked.pdf", blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }) }];
      }}
    />
  );
}
