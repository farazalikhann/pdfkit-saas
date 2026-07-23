"use client";

import * as React from "react";
import { toast } from "sonner";
import { Type, ImagePlus, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ClientSideBadge } from "@/components/tool-shell/client-badge";
import { ResultPanel, type ResultFile } from "@/components/tool-shell/result-panel";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageEditor } from "@/components/page-editor/page-editor";
import { useElementHistory } from "@/components/page-editor/use-element-history";
import { bringToFront, sendToBack, nextZIndex } from "@/components/page-editor/z-order";
import type { Rect } from "@/components/page-editor/types";
import type { AddElement, TextBoxElement, ImageBoxElement, FontFamily } from "@/lib/pdf/edit/flatten-text-image";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { uid, cn } from "@/lib/utils";
import type { ToolDefinition } from "@/lib/tools";

const COLORS = [
  { name: "Black", value: { r: 0.05, g: 0.05, b: 0.05 } },
  { name: "Red", value: { r: 0.75, g: 0.1, b: 0.1 } },
  { name: "Blue", value: { r: 0.1, g: 0.25, b: 0.7 } },
  { name: "Green", value: { r: 0.1, g: 0.5, b: 0.2 } },
];

const SNAP_THRESHOLD_PT = 6;

export function AddTextImageTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState<{ widthPt: number; heightPt: number } | null>(null);
  const [pickerError, setPickerError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [snapGuide, setSnapGuide] = React.useState<{ x?: number; y?: number } | null>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);

  const { elements, setElements, undo, redo, canUndo, canRedo } = useElementHistory<AddElement>([]);

  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<ResultFile[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const selected = elements.find((e) => e.id === selectedId) ?? null;

  function handleFiles(files: File[]) {
    const f = files[0] ?? null;
    setFile(f);
    setElements([], { pushHistory: false });
    setSelectedId(null);
    setResults(null);
    setState("idle");
    if (f) {
      const risk = checkFileMemoryRisk(f);
      if (risk) toast.warning(risk);
    }
  }

  function addTextBox(x: number, y: number) {
    const el: TextBoxElement = {
      id: uid(),
      kind: "text",
      pageIndex,
      x: x - 75,
      y: y - 15,
      width: 150,
      height: 30,
      rotation: 0,
      zIndex: nextZIndex(elements),
      text: "New text",
      fontFamily: "Helvetica",
      fontSize: 16,
      color: COLORS[0].value,
      bold: false,
      italic: false,
      underline: false,
      align: "left",
      opacity: 1,
    };
    setElements((prev) => [...prev, el]);
    setSelectedId(el.id);
  }

  function addImage(file: File) {
    const mimeType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxDim = 200;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = img.width * scale;
        const height = img.height * scale;
        const px = pageSize ? pageSize.widthPt / 2 - width / 2 : 100;
        const py = pageSize ? pageSize.heightPt / 2 - height / 2 : 100;
        const el: ImageBoxElement = {
          id: uid(),
          kind: "image",
          pageIndex,
          x: px,
          y: py,
          width,
          height,
          rotation: 0,
          zIndex: nextZIndex(elements),
          dataUrl,
          mimeType,
          keepAspectRatio: true,
        };
        setElements((prev) => [...prev, el]);
        setSelectedId(el.id);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function updateSelected(patch: Partial<AddElement>) {
    if (!selectedId) return;
    setElements((prev) => prev.map((e) => (e.id === selectedId ? ({ ...e, ...patch } as AddElement) : e)));
  }

  function handleElementChange(id: string, rect: Rect) {
    let next = rect;
    if (pageSize) {
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      const guide: { x?: number; y?: number } = {};
      if (Math.abs(centerX - pageSize.widthPt / 2) < SNAP_THRESHOLD_PT) {
        next = { ...next, x: pageSize.widthPt / 2 - rect.width / 2 };
        guide.x = pageSize.widthPt / 2;
      }
      if (Math.abs(centerY - pageSize.heightPt / 2) < SNAP_THRESHOLD_PT) {
        next = { ...next, y: pageSize.heightPt / 2 - rect.height / 2 };
        guide.y = pageSize.heightPt / 2;
      }
      setSnapGuide(Object.keys(guide).length > 0 ? guide : null);
    }
    setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...next } : e)), { pushHistory: false });
  }

  async function handleExport() {
    if (!file) return;
    setState("processing");
    setProgress(0.3);
    setErrorMessage(null);
    try {
      const { flattenTextImage } = await import("@/lib/pdf/edit/flatten-text-image");
      const bytes = await flattenTextImage(file, elements);
      setProgress(1);
      setResults([{ name: "edited.pdf", blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }) }]);
      setState("done");
    } catch (err) {
      console.error(err);
      setState("error");
      setErrorMessage(err instanceof Error ? err.message : "Couldn't export this PDF.");
      toast.error("Export failed", { description: err instanceof Error ? err.message : undefined });
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-4 md:pb-16">
      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <tool.icon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold leading-tight">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
        </div>
        <ClientSideBadge />
        <p className="text-xs text-muted-foreground">
          Tap the page to drop a text box, or add an image, then drag/resize/rotate
          it into place. Edit its style below while it&apos;s selected.
        </p>
      </div>

      {state === "done" && results ? (
        <div className="space-y-3">
          <ResultPanel tool={tool} results={results} />
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setResults(null);
              setState("idle");
            }}
            className="mx-auto block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Edit another file
          </button>
        </div>
      ) : !file ? (
        <UploadZone accept={tool.accept} multiple={false} maxFiles={1} onFiles={handleFiles} acceptHint="One file at a time" />
      ) : state === "processing" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
          <ProgressRing progress={progress * 100} />
          <p className="text-sm text-muted-foreground">Flattening changes into the PDF…</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!pageSize}
              onClick={() => pageSize && addTextBox(pageSize.widthPt / 2, pageSize.heightPt / 2)}
            >
              <Type className="h-4 w-4" />
              Add text
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={!pageSize}
              onClick={() => imageInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              Add image
            </Button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) addImage(f);
              }}
            />
          </div>

          <PageEditor
            file={file}
            pageIndex={pageIndex}
            onPageIndexChange={setPageIndex}
            onPageSizeChange={setPageSize}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onElementChange={handleElementChange}
            onGestureStart={() => setElements((prev) => prev, { pushHistory: true })}
            onGestureEnd={() => setSnapGuide(null)}
            onDeleteSelected={() => {
              if (!selectedId) return;
              setElements((prev) => prev.filter((e) => e.id !== selectedId));
              setSelectedId(null);
            }}
            onBringToFront={() => selectedId && setElements((prev) => bringToFront(prev, selectedId))}
            onSendToBack={() => selectedId && setElements((prev) => sendToBack(prev, selectedId))}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            keepAspectRatioFor={(el) => el.kind === "image" && el.keepAspectRatio}
            onError={setPickerError}
            overlayContent={() =>
              snapGuide ? (
                <>
                  {snapGuide.x !== undefined && pageSize && (
                    <div
                      className="pointer-events-none absolute top-0 h-full w-px bg-primary"
                      style={{ left: `${(snapGuide.x / pageSize.widthPt) * 100}%` }}
                    />
                  )}
                  {snapGuide.y !== undefined && pageSize && (
                    <div
                      className="pointer-events-none absolute left-0 w-full h-px bg-primary"
                      style={{ top: `${(snapGuide.y / pageSize.heightPt) * 100}%` }}
                    />
                  )}
                </>
              ) : null
            }
            renderElement={(el) =>
              el.kind === "text" ? (
                <div
                  className="flex h-full w-full items-center overflow-hidden whitespace-pre-wrap break-words"
                  style={{
                    fontFamily: el.fontFamily === "Courier" ? "monospace" : el.fontFamily === "TimesRoman" ? "serif" : "sans-serif",
                    fontWeight: el.bold ? 700 : 400,
                    fontStyle: el.italic ? "italic" : "normal",
                    textDecoration: el.underline ? "underline" : "none",
                    justifyContent: el.align === "center" ? "center" : el.align === "right" ? "flex-end" : "flex-start",
                    color: `rgb(${el.color.r * 255}, ${el.color.g * 255}, ${el.color.b * 255})`,
                    opacity: el.opacity,
                    fontSize: Math.max(8, el.fontSize),
                  }}
                >
                  {el.text || "…"}
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={el.dataUrl} alt="" className="h-full w-full object-fill" draggable={false} />
              )
            }
          />

          {selected && (
            <div className="space-y-3 rounded-xl border border-border bg-card p-3">
              {selected.kind === "text" ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Text</Label>
                    <textarea
                      value={selected.text}
                      onChange={(e) => updateSelected({ text: e.target.value })}
                      rows={2}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label>Font</Label>
                      <Select
                        value={selected.fontFamily}
                        onValueChange={(v) => updateSelected({ fontFamily: v as FontFamily })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Helvetica">Helvetica</SelectItem>
                          <SelectItem value="TimesRoman">Times Roman</SelectItem>
                          <SelectItem value="Courier">Courier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Size — {selected.fontSize}pt</Label>
                      <Slider
                        value={[selected.fontSize]}
                        min={8}
                        max={72}
                        step={1}
                        onValueChange={([v]) => updateSelected({ fontSize: v })}
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant={selected.bold ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateSelected({ bold: !selected.bold })}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={selected.italic ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateSelected({ italic: !selected.italic })}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={selected.underline ? "default" : "outline"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateSelected({ underline: !selected.underline })}
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                    <div className="mx-1 h-6 w-px bg-border" />
                    {(["left", "center", "right"] as const).map((a) => (
                      <Button
                        key={a}
                        variant={selected.align === a ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateSelected({ align: a })}
                      >
                        {a === "left" && <AlignLeft className="h-4 w-4" />}
                        {a === "center" && <AlignCenter className="h-4 w-4" />}
                        {a === "right" && <AlignRight className="h-4 w-4" />}
                      </Button>
                    ))}
                    <div className="mx-1 h-6 w-px bg-border" />
                    {COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        aria-label={c.name}
                        onClick={() => updateSelected({ color: c.value })}
                        className={cn(
                          "h-7 w-7 rounded-full border-2",
                          selected.color === c.value ? "border-primary" : "border-transparent"
                        )}
                        style={{ backgroundColor: `rgb(${c.value.r * 255},${c.value.g * 255},${c.value.b * 255})` }}
                      />
                    ))}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Opacity — {Math.round(selected.opacity * 100)}%</Label>
                    <Slider
                      value={[selected.opacity * 100]}
                      min={10}
                      max={100}
                      step={5}
                      onValueChange={([v]) => updateSelected({ opacity: v / 100 })}
                    />
                  </div>
                </>
              ) : (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.keepAspectRatio}
                    onChange={(e) => updateSelected({ keepAspectRatio: e.target.checked })}
                    className="h-4 w-4 rounded border-border"
                  />
                  Keep aspect ratio when resizing
                </label>
              )}
            </div>
          )}

          {errorMessage && state === "error" && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p>
          )}
        </div>
      )}

      {state !== "done" && file && (
        <ActionBar
          state={pickerError ? "idle" : state === "idle" ? "ready" : state}
          label="Save PDF"
          progress={progress * 100}
          onAction={handleExport}
          disabledReason={pickerError ?? undefined}
        />
      )}
    </div>
  );
}
