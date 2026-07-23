"use client";

import * as React from "react";
import { toast } from "sonner";
import { PenTool, Trash2 } from "lucide-react";
import { UploadZone } from "@/components/tool-shell/upload-zone";
import { ActionBar, type ActionState } from "@/components/tool-shell/action-bar";
import { ProgressRing } from "@/components/tool-shell/progress-ring";
import { ClientSideBadge } from "@/components/tool-shell/client-badge";
import { ResultPanel, type ResultFile } from "@/components/tool-shell/result-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageEditor } from "@/components/page-editor/page-editor";
import { useElementHistory } from "@/components/page-editor/use-element-history";
import { bringToFront, sendToBack, nextZIndex } from "@/components/page-editor/z-order";
import type { ImageBoxElement } from "@/lib/pdf/edit/flatten-text-image";
import {
  loadSavedSignatures,
  saveSignature,
  deleteSignature,
  type SavedSignature,
} from "@/lib/pdf/edit/signature-store";
import { checkFileMemoryRisk } from "@/lib/files/memory-guard";
import { uid } from "@/lib/utils";
import type { ToolDefinition } from "@/lib/tools";

const SIGNATURE_FONT = "'Segoe Script', 'Brush Script MT', cursive";

function SignaturePad({ onDone }: { onDone: (dataUrl: string) => void }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawingRef = React.useRef(false);
  const [hasStrokes, setHasStrokes] = React.useState(false);
  const lastRef = React.useRef<{ x: number; y: number } | null>(null);

  function ctx() {
    return canvasRef.current?.getContext("2d") ?? null;
  }

  function pos(e: React.PointerEvent) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function clear() {
    const c = ctx();
    if (!c || !canvasRef.current) return;
    c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasStrokes(false);
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        className="h-[160px] w-full touch-none rounded-lg border border-dashed border-border bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawingRef.current = true;
          lastRef.current = pos(e);
        }}
        onPointerMove={(e) => {
          if (!drawingRef.current) return;
          const c = ctx();
          const p = pos(e);
          if (!c || !lastRef.current) return;
          c.strokeStyle = "#111827";
          c.lineWidth = 3;
          c.lineCap = "round";
          c.lineJoin = "round";
          c.beginPath();
          c.moveTo(lastRef.current.x, lastRef.current.y);
          c.lineTo(p.x, p.y);
          c.stroke();
          lastRef.current = p;
          setHasStrokes(true);
        }}
        onPointerUp={() => {
          drawingRef.current = false;
          lastRef.current = null;
        }}
        onPointerCancel={() => {
          drawingRef.current = false;
          lastRef.current = null;
        }}
      />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={clear}>
          Clear
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!hasStrokes}
          onClick={() => canvasRef.current && onDone(canvasRef.current.toDataURL("image/png"))}
        >
          Use this signature
        </Button>
      </div>
    </div>
  );
}

function TypeSignature({ onDone }: { onDone: (dataUrl: string) => void }) {
  const [text, setText] = React.useState("");

  function render(): string | null {
    if (!text.trim()) return null;
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 200;
    const c = canvas.getContext("2d");
    if (!c) return null;
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.font = `64px ${SIGNATURE_FONT}`;
    c.fillStyle = "#111827";
    c.textBaseline = "middle";
    c.textAlign = "center";
    c.fillText(text.trim(), canvas.width / 2, canvas.height / 2);
    return canvas.toDataURL("image/png");
  }

  return (
    <div className="space-y-3">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type your name"
        maxLength={40}
      />
      <div
        className="flex h-[100px] items-center justify-center rounded-lg border border-dashed border-border bg-white text-4xl text-neutral-900"
        style={{ fontFamily: SIGNATURE_FONT }}
      >
        {text.trim() || "Preview"}
      </div>
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={!text.trim()}
          onClick={() => {
            const dataUrl = render();
            if (dataUrl) onDone(dataUrl);
          }}
        >
          Use this signature
        </Button>
      </div>
    </div>
  );
}

export function ESignPdfTool({ tool }: { tool: ToolDefinition }) {
  const [file, setFile] = React.useState<File | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);
  const [pageSize, setPageSize] = React.useState<{ widthPt: number; heightPt: number } | null>(null);
  const [pickerError, setPickerError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [saved, setSaved] = React.useState<SavedSignature[]>([]);
  const uploadInputRef = React.useRef<HTMLInputElement>(null);

  const { elements, setElements, undo, redo, canUndo, canRedo } = useElementHistory<ImageBoxElement>([]);

  const [state, setState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<ResultFile[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSaved(loadSavedSignatures());
  }, []);

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

  function placeSignature(dataUrl: string, mimeType: "image/png" | "image/jpeg", naturalWidth: number, naturalHeight: number) {
    const maxWidthPt = 180;
    const scale = Math.min(1, maxWidthPt / naturalWidth);
    const width = naturalWidth * scale;
    const height = naturalHeight * scale;
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
    setDialogOpen(false);
  }

  function placeFromDataUrl(dataUrl: string, mimeType: "image/png" | "image/jpeg", persist: boolean) {
    const img = new Image();
    img.onload = () => {
      placeSignature(dataUrl, mimeType, img.width, img.height);
      if (persist) setSaved(saveSignature({ dataUrl, mimeType }));
    };
    img.src = dataUrl;
  }

  function handleUpload(f: File) {
    const mimeType = f.type === "image/png" ? "image/png" : "image/jpeg";
    const reader = new FileReader();
    reader.onload = () => placeFromDataUrl(reader.result as string, mimeType, true);
    reader.readAsDataURL(f);
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
      setResults([{ name: "signed.pdf", blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }) }]);
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
          Add a signature, then drag/resize/rotate it into place on any page. It&apos;s
          flattened into the file on export, so it can&apos;t be moved afterwards.
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
            Sign another file
          </button>
        </div>
      ) : !file ? (
        <UploadZone accept={tool.accept} multiple={false} maxFiles={1} onFiles={handleFiles} acceptHint="One file at a time" />
      ) : state === "processing" ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
          <ProgressRing progress={progress * 100} />
          <p className="text-sm text-muted-foreground">Flattening your signature into the PDF…</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}>
              <PenTool className="h-4 w-4" />
              Add signature
            </Button>
            <input
              ref={uploadInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) handleUpload(f);
              }}
            />
            {saved.slice(0, 5).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => placeFromDataUrl(s.dataUrl, s.mimeType, false)}
                className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-white p-1"
                title="Place this saved signature"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.dataUrl} alt="Saved signature" className="h-full w-full object-contain" />
              </button>
            ))}
          </div>

          <PageEditor
            file={file}
            pageIndex={pageIndex}
            onPageIndexChange={setPageIndex}
            onPageSizeChange={setPageSize}
            elements={elements}
            selectedId={selectedId}
            onSelectElement={setSelectedId}
            onElementChange={(id, rect) =>
              setElements((prev) => prev.map((e) => (e.id === id ? { ...e, ...rect } : e)), { pushHistory: false })
            }
            onGestureStart={() => setElements((prev) => prev, { pushHistory: true })}
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
            keepAspectRatioFor={() => true}
            onError={setPickerError}
            renderElement={(el) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={el.dataUrl} alt="Signature" className="h-full w-full object-fill" draggable={false} />
            )}
          />

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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add a signature</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="draw">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="draw">Draw</TabsTrigger>
              <TabsTrigger value="type">Type</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="draw">
              <SignaturePad onDone={(dataUrl) => placeFromDataUrl(dataUrl, "image/png", true)} />
            </TabsContent>
            <TabsContent value="type">
              <TypeSignature onDone={(dataUrl) => placeFromDataUrl(dataUrl, "image/png", true)} />
            </TabsContent>
            <TabsContent value="upload">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Upload a PNG or JPG of your signature (a transparent-background PNG works best).
                </p>
                <Button variant="outline" className="w-full" onClick={() => uploadInputRef.current?.click()}>
                  Choose an image
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          {saved.length > 0 && (
            <div className="space-y-2 border-t border-border pt-3">
              <p className="text-xs font-medium text-muted-foreground">Saved signatures</p>
              <div className="flex flex-wrap gap-2">
                {saved.map((s) => (
                  <div key={s.id} className="group relative h-12 w-20 overflow-hidden rounded-lg border border-border bg-white">
                    <button
                      type="button"
                      className="h-full w-full p-1"
                      onClick={() => placeFromDataUrl(s.dataUrl, s.mimeType, false)}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.dataUrl} alt="Saved signature" className="h-full w-full object-contain" />
                    </button>
                    <button
                      type="button"
                      aria-label="Delete saved signature"
                      onClick={() => setSaved(deleteSignature(s.id))}
                      className="absolute right-0.5 top-0.5 hidden rounded bg-background/90 p-0.5 text-destructive group-hover:block"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter />
        </DialogContent>
      </Dialog>
    </div>
  );
}
