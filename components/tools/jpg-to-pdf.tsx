"use client";

import * as React from "react";
import { GripVertical, X } from "lucide-react";
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
import { ToolShell, type ToolShellHelpers } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  imagesToPdf,
  type PageSizeOption,
  type Orientation,
  type FitMode,
} from "@/lib/pdf/jpg-to-pdf";
import type { ToolDefinition } from "@/lib/tools";

type MarginOption = "none" | "normal" | "wide";
const MARGIN_PT: Record<MarginOption, number> = { none: 0, normal: 24, wide: 48 };

function SortableThumb({
  file,
  index,
  onRemove,
}: {
  file: File;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `${file.name}-${index}-${file.size}` });
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
      className="flex items-center gap-3 rounded-xl border border-border bg-card px-2 py-2"
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
      <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" className="h-full w-full object-cover" />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
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

function DragReorderPreview({ files, reorderFile, removeFile }: ToolShellHelpers) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const ids = files.map((f, i) => `${f.name}-${i}-${f.size}`);

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
            <SortableThumb
              key={ids[index]}
              file={file}
              index={index}
              onRemove={() => removeFile(index)}
            />
          ))}
        </ul>
      </SortableContext>
      {files.length > 1 && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Drag to reorder — images are combined in this order.
        </p>
      )}
    </DndContext>
  );
}

export function JpgToPdfTool({ tool }: { tool: ToolDefinition }) {
  const [pageSize, setPageSize] = React.useState<PageSizeOption>("a4");
  const [orientation, setOrientation] = React.useState<Orientation>("auto");
  const [margin, setMargin] = React.useState<MarginOption>("normal");
  const [fitMode, setFitMode] = React.useState<FitMode>("contain");

  return (
    <ToolShell
      tool={tool}
      canRun={({ files }) => files.length >= 1}
      actionLabel={({ files }) =>
        files.length > 1 ? `Combine ${files.length} images` : "Create PDF"
      }
      preview={(helpers) => <DragReorderPreview {...helpers} />}
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
                  <SelectItem value="match-image">Match image size</SelectItem>
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
                  <SelectItem value="auto">Auto (match each image)</SelectItem>
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
        const bytes = await imagesToPdf(files, {
          pageSize,
          orientation,
          marginPt: MARGIN_PT[margin],
          fitMode,
          onProgress: reportProgress,
        });
        return [
          {
            name: "images.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
