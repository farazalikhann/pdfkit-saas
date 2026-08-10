"use client";

import * as React from "react";
import { GripVertical, X, RotateCw, Crop, ScanLine } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ToolShell,
  type ToolShellHelpers,
  type ToolShellFilesApi,
} from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CropDialog } from "./make-pdf-crop-dialog";
import { ScanCameraDialog } from "./scan-camera-dialog";
import {
  applyImageTransform,
  DOCUMENT_FILTER_CSS,
  type CropRect,
  type DocumentFilter,
} from "@/lib/pdf/image-transform";
import {
  imagesToPdf,
  type PageSizeOption,
  type Orientation,
  type FitMode,
} from "@/lib/pdf/jpg-to-pdf";
import type { ToolDefinition } from "@/lib/tools";

type MarginOption = "none" | "normal" | "wide";
const MARGIN_PT: Record<MarginOption, number> = { none: 0, normal: 24, wide: 48 };

interface PhotoState {
  rotation: 0 | 90 | 180 | 270;
  crop: CropRect | null;
  filter: DocumentFilter;
}
const DEFAULT_STATE: PhotoState = { rotation: 0, crop: null, filter: "original" };

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function SortablePhotoThumb({
  file,
  state,
  onRotate,
  onCrop,
  onRemove,
}: {
  file: File;
  state: PhotoState;
  onRotate: () => void;
  onCrop: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: fileKey(file) });
  const [url, setUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-2"
      data-dragging={isDragging || undefined}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="flex h-9 w-6 shrink-0 cursor-grab touch-none items-center justify-center text-muted-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="h-full w-full object-cover"
            style={{
              transform: `rotate(${state.rotation}deg)`,
              filter: DOCUMENT_FILTER_CSS[state.filter],
            }}
          />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
      <button
        type="button"
        aria-label={`Rotate ${file.name}`}
        onClick={onRotate}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-accent"
      >
        <RotateCw className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={`Crop ${file.name}`}
        onClick={onCrop}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-accent"
      >
        <Crop className="h-4 w-4" />
      </button>
      <button
        type="button"
        aria-label={`Remove ${file.name}`}
        onClick={onRemove}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-accent"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}

function PhotosPreview({
  files,
  reorderFile,
  removeFile,
  getState,
  onRotate,
  onCropRequest,
}: ToolShellHelpers & {
  getState: (file: File) => PhotoState;
  onRotate: (file: File) => void;
  onCropRequest: (file: File) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = files.map(fileKey);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;
    reorderFile(from, to);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2">
          {files.map((file, index) => (
            <SortablePhotoThumb
              key={ids[index]}
              file={file}
              state={getState(file)}
              onRotate={() => onRotate(file)}
              onCrop={() => onCropRequest(file)}
              onRemove={() => removeFile(index)}
            />
          ))}
        </ul>
      </SortableContext>
      {files.length > 1 && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Drag to reorder: photos become pages in this order.
        </p>
      )}
    </DndContext>
  );
}

export function MakePdfTool({ tool }: { tool: ToolDefinition }) {
  const [pageSize, setPageSize] = React.useState<PageSizeOption>("a4");
  const [orientation, setOrientation] = React.useState<Orientation>("auto");
  const [margin, setMargin] = React.useState<MarginOption>("normal");
  const [fitMode, setFitMode] = React.useState<FitMode>("contain");
  const [photoStates, setPhotoStates] = React.useState<Map<string, PhotoState>>(new Map());
  const [cropTarget, setCropTarget] = React.useState<File | null>(null);
  const [cropTargetUrl, setCropTargetUrl] = React.useState<string | null>(null);
  const [scanOpen, setScanOpen] = React.useState(false);
  const [fileCount, setFileCount] = React.useState(0);
  const filesApiRef = React.useRef<ToolShellFilesApi | null>(null);

  const getState = React.useCallback(
    (file: File) => photoStates.get(fileKey(file)) ?? DEFAULT_STATE,
    [photoStates]
  );

  function updateState(file: File, patch: Partial<PhotoState>) {
    setPhotoStates((prev) => {
      const next = new Map(prev);
      const current = next.get(fileKey(file)) ?? DEFAULT_STATE;
      next.set(fileKey(file), { ...current, ...patch });
      return next;
    });
  }

  function rotate(file: File) {
    const current = getState(file);
    const nextRotation = ((current.rotation + 90) % 360) as PhotoState["rotation"];
    // A rotation changes which edges are "top/bottom" vs "left/right", so a crop
    // drawn before this rotation would no longer line up, clearing it is safer
    // than silently applying a crop rect to the wrong axes.
    updateState(file, { rotation: nextRotation, crop: null });
  }

  React.useEffect(() => {
    if (!cropTarget) {
      setCropTargetUrl(null);
      return;
    }
    const url = URL.createObjectURL(cropTarget);
    setCropTargetUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [cropTarget]);

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 pt-4">
        <button
          type="button"
          onClick={() => setScanOpen(true)}
          disabled={fileCount >= tool.maxFiles}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-3.5 text-sm font-semibold text-primary transition-colors active:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ScanLine className="h-5 w-5" />
          {fileCount === 0 ? "Scan Document with Camera" : "Scan more pages"}
        </button>
      </div>

      <ToolShell
        tool={tool}
        filesApiRef={filesApiRef}
        onFilesChange={(files) => setFileCount(files.length)}
        canRun={({ files }) => files.length >= 1}
        actionLabel={({ files }) =>
          files.length > 1 ? `Create PDF from ${files.length} photos` : "Create PDF"
        }
        preview={(helpers) => (
          <PhotosPreview
            {...helpers}
            getState={getState}
            onRotate={rotate}
            onCropRequest={setCropTarget}
          />
        )}
        options={() => (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Page size</Label>
                <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeOption)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="match-image">Match photo size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Orientation</Label>
                <Select
                  value={orientation}
                  onValueChange={(v) => setOrientation(v as Orientation)}
                  disabled={pageSize === "match-image"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (match each photo)</SelectItem>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Margins</Label>
                <Select
                  value={margin}
                  onValueChange={(v) => setMargin(v as MarginOption)}
                  disabled={pageSize === "match-image"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="wide">Wide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Fit mode</Label>
                <Select
                  value={fitMode}
                  onValueChange={(v) => setFitMode(v as FitMode)}
                  disabled={pageSize === "match-image"}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contain">Fit inside (no crop)</SelectItem>
                    <SelectItem value="cover">Fill page (crop)</SelectItem>
                    <SelectItem value="stretch">Stretch to fill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
        onProcess={async (files, reportProgress) => {
          const transformed: File[] = [];
          for (let i = 0; i < files.length; i++) {
            const state = getState(files[i]);
            const t = await applyImageTransform(files[i], {
              rotationDeg: state.rotation,
              crop: state.crop,
              filter: state.filter,
            });
            transformed.push(t);
            reportProgress(((i + 1) / files.length) * 0.5);
          }
          const bytes = await imagesToPdf(transformed, {
            pageSize,
            orientation,
            marginPt: MARGIN_PT[margin],
            fitMode,
            onProgress: (f) => reportProgress(0.5 + f * 0.5),
          });
          return [
            {
              name: "document.pdf",
              blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
            },
          ];
        }}
      />

      {cropTarget && cropTargetUrl && (
        <CropDialog
          open={Boolean(cropTarget)}
          onOpenChange={(o) => {
            if (!o) setCropTarget(null);
          }}
          imageUrl={cropTargetUrl}
          rotationDeg={getState(cropTarget).rotation}
          initialCrop={getState(cropTarget).crop}
          onApply={(crop) => cropTarget && updateState(cropTarget, { crop })}
          filter={getState(cropTarget).filter}
          onFilterChange={(filter) => cropTarget && updateState(cropTarget, { filter })}
        />
      )}

      <ScanCameraDialog
        open={scanOpen}
        onOpenChange={setScanOpen}
        onFinish={(files) => filesApiRef.current?.addFiles(files)}
      />
    </>
  );
}
