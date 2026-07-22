"use client";

import { FileText, ImageIcon, ChevronUp, ChevronDown, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onReorder?: (from: number, to: number) => void;
  reorderable?: boolean;
}

export function FileList({
  files,
  onRemove,
  onReorder,
  reorderable = false,
}: FileListProps) {
  if (files.length === 0) return null;

  return (
    <ul className="space-y-2">
      {files.map((file, index) => {
        const isImage = file.type.startsWith("image/");
        return (
          <li
            key={`${file.name}-${index}-${file.size}`}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {isImage ? (
                <ImageIcon className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </p>
            </div>
            {reorderable && onReorder && (
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  aria-label="Move up"
                  disabled={index === 0}
                  onClick={() => onReorder(index, index - 1)}
                  className="flex h-5 w-6 items-center justify-center text-muted-foreground disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Move down"
                  disabled={index === files.length - 1}
                  onClick={() => onReorder(index, index + 1)}
                  className="flex h-5 w-6 items-center justify-center text-muted-foreground disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => onRemove(index)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors active:bg-accent"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
