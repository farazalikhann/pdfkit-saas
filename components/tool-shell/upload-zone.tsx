"use client";

import * as React from "react";
import { useDropzone } from "react-dropzone";
import { FolderOpen, Camera, Cloud, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AcceptMap } from "@/lib/tools";

interface UploadZoneProps {
  accept: AcceptMap;
  multiple: boolean;
  maxFiles: number;
  onFiles: (files: File[]) => void;
  acceptHint: string;
}

export function UploadZone({
  accept,
  multiple,
  maxFiles,
  onFiles,
  acceptHint,
}: UploadZoneProps) {
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const isImageTool = Object.keys(accept).some((mime) =>
    mime.startsWith("image/")
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept,
    multiple,
    maxFiles,
    noClick: true,
    noKeyboard: true,
    onDrop: (accepted, rejections) => {
      if (rejections.length > 0) {
        toast.error(
          rejections.length === 1
            ? `"${rejections[0].file.name}" isn't a supported file type.`
            : `${rejections.length} files were skipped — unsupported type.`
        );
      }
      if (accepted.length > 0) onFiles(accepted);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex min-h-[220px] w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border bg-muted/40 px-6 py-8 text-center transition-colors",
        isDragActive && "border-primary bg-primary/5"
      )}
    >
      <input {...getInputProps()} />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <UploadCloud className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          Drop files here, or choose an option below
        </p>
        <p className="text-xs text-muted-foreground">{acceptHint}</p>
      </div>

      <div className="grid w-full max-w-sm grid-cols-3 gap-2">
        <button
          type="button"
          onClick={open}
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background px-2 py-2.5 text-xs font-medium transition-colors active:scale-[0.97] active:bg-accent"
        >
          <FolderOpen className="h-5 w-5" />
          Files
        </button>
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={!isImageTool}
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background px-2 py-2.5 text-xs font-medium transition-colors active:scale-[0.97] active:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Camera className="h-5 w-5" />
          Camera
        </button>
        <button
          type="button"
          onClick={() =>
            toast.info("Cloud import is coming soon", {
              description: "Google Drive & Dropbox pickers are on the roadmap.",
            })
          }
          className="flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background px-2 py-2.5 text-xs font-medium transition-colors active:scale-[0.97] active:bg-accent"
        >
          <Cloud className="h-5 w-5" />
          Cloud
        </button>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) onFiles(files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
