"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { ToolDefinition } from "@/lib/tools";
import { useUsageStore } from "@/lib/store/usage-store";
import { useRecentStore } from "@/lib/store/recent-store";
import { useChainStore } from "@/lib/store/chain-store";
import { UploadZone } from "./upload-zone";
import { FileList } from "./file-list";
import { OptionsPanel } from "./options-panel";
import { ActionBar, type ActionState } from "./action-bar";
import { ResultPanel, type ResultFile } from "./result-panel";
import { PaywallModal } from "./paywall-modal";
import { ClientSideBadge } from "./client-badge";
import { ProgressRing } from "./progress-ring";
import { Skeleton } from "@/components/ui/skeleton";

export interface ToolShellHelpers {
  files: File[];
}

interface ToolShellProps {
  tool: ToolDefinition;
  /** Tool-specific controls, rendered inside the responsive options panel. */
  options?: (helpers: ToolShellHelpers) => React.ReactNode;
  /** Custom preview area (e.g. a page-thumbnail grid). Defaults to a plain file list. */
  preview?: (helpers: ToolShellHelpers) => React.ReactNode;
  /** Label shown on the action button once files are ready, e.g. "Merge 3 PDFs". */
  actionLabel: (helpers: ToolShellHelpers) => string;
  /** Whether the action can run yet (e.g. a rotate tool might require a selection). Defaults to true. */
  canRun?: (helpers: ToolShellHelpers) => boolean;
  /**
   * Fires from an effect (after commit, never during render) whenever the file list changes.
   * Use this instead of deriving state inside `preview`/`options` — those run during ToolShellInner's
   * render, and calling a child's setState there trips React's cross-component render warning.
   */
  onFilesChange?: (files: File[]) => void;
  /** Runs the actual client-side transformation. Return one or more result files. */
  onProcess: (
    files: File[],
    reportProgress: (fraction: number) => void
  ) => Promise<ResultFile[]>;
}

export function ToolShell(props: ToolShellProps) {
  return (
    <React.Suspense fallback={<ToolShellSkeleton />}>
      <ToolShellInner {...props} />
    </React.Suspense>
  );
}

function ToolShellSkeleton() {
  return (
    <div className="mx-auto max-w-2xl px-4 pb-40 pt-4 md:pb-16">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}

function ToolShellInner({
  tool,
  options,
  preview,
  actionLabel,
  canRun,
  onFilesChange,
  onProcess,
}: ToolShellProps) {
  const searchParams = useSearchParams();
  const [files, setFiles] = React.useState<File[]>([]);
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [actionState, setActionState] = React.useState<ActionState>("idle");
  const [progress, setProgress] = React.useState(0);
  const [results, setResults] = React.useState<ResultFile[] | null>(null);
  const [locked, setLocked] = React.useState(false);
  const [paywallOpen, setPaywallOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const checkFileSize = useUsageStore((s) => s.checkFileSize);
  const isOverDailyLimit = useUsageStore((s) => s.isOverDailyLimit);
  const recordTaskRun = useUsageStore((s) => s.recordTaskRun);
  const addRecent = useRecentStore((s) => s.addRecent);
  const chainFile = useChainStore((s) => s.file);
  const clearChainFile = useChainStore((s) => s.clear);

  // Pick up a file handed off from another tool's "Use another tool" action.
  React.useEffect(() => {
    if (searchParams.get("chained") === "1" && chainFile) {
      setFiles([chainFile]);
      clearChainFile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    onFilesChange?.(files);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  function addFiles(incoming: File[]) {
    for (const file of incoming) {
      const check = checkFileSize(file.size);
      if (!check.allowed) {
        toast.error(check.reason);
        return;
      }
    }
    setResults(null);
    setActionState("ready");
    setFiles((prev) => {
      if (!tool.multiple) return incoming.slice(0, 1);
      const merged = [...prev, ...incoming].slice(0, tool.maxFiles);
      return merged;
    });
  }

  function removeFile(index: number) {
    setFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setActionState("idle");
        setResults(null);
      }
      return next;
    });
  }

  function reorderFile(from: number, to: number) {
    setFiles((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  const helpers: ToolShellHelpers = { files };
  const ready = files.length > 0 && (canRun ? canRun(helpers) : true);

  async function handleAction() {
    if (!ready) return;
    setActionState("processing");
    setProgress(0);
    setErrorMessage(null);
    try {
      const output = await onProcess(files, setProgress);
      setResults(output);
      setActionState("done");

      const overLimit = isOverDailyLimit();
      setLocked(overLimit);
      if (!overLimit) recordTaskRun();

      addRecent({
        toolSlug: tool.slug,
        toolName: tool.name,
        fileName: files[0]?.name ?? tool.name,
      });
    } catch (err) {
      console.error(err);
      setActionState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
      toast.error("Processing failed", {
        description:
          err instanceof Error ? err.message : "Please try a different file.",
      });
    }
  }

  function handleRequestUnlock() {
    setPaywallOpen(true);
  }

  const acceptHint = tool.multiple
    ? `Up to ${tool.maxFiles} files`
    : "One file at a time";

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
        {tool.isClientSide && <ClientSideBadge />}
      </div>

      {actionState === "done" && results ? (
        <div className="space-y-3">
          <ResultPanel
            tool={tool}
            results={results}
            locked={locked}
            onRequestUnlock={handleRequestUnlock}
          />
          <button
            type="button"
            onClick={() => {
              setFiles([]);
              setResults(null);
              setActionState("idle");
              setLocked(false);
            }}
            className="mx-auto block text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
          >
            Start over with a new file
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {files.length === 0 ? (
            <UploadZone
              accept={tool.accept}
              multiple={tool.multiple}
              maxFiles={tool.maxFiles}
              onFiles={addFiles}
              acceptHint={acceptHint}
            />
          ) : actionState === "processing" ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-muted/30 py-12">
              <ProgressRing progress={progress} />
              <p className="text-sm text-muted-foreground">
                Working on {files.length === 1 ? files[0].name : `${files.length} files`}…
              </p>
              <div className="w-full max-w-xs space-y-2 px-6">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            </div>
          ) : (
            <>
              {preview ? preview(helpers) : (
                <FileList
                  files={files}
                  onRemove={removeFile}
                  onReorder={tool.multiple ? reorderFile : undefined}
                  reorderable={tool.multiple}
                />
              )}
              {tool.multiple && files.length < tool.maxFiles && (
                <UploadZone
                  accept={tool.accept}
                  multiple={tool.multiple}
                  maxFiles={tool.maxFiles - files.length}
                  onFiles={addFiles}
                  acceptHint="Add more files"
                />
              )}
            </>
          )}

          {errorMessage && actionState === "error" && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorMessage}
            </p>
          )}

          {files.length > 0 && options && (
            <OptionsPanel
              title="Options"
              open={optionsOpen}
              onOpenChange={setOptionsOpen}
            >
              {options(helpers)}
            </OptionsPanel>
          )}
        </div>
      )}

      {actionState !== "done" && (
        <ActionBar
          state={ready ? actionState : "idle"}
          label={actionLabel(helpers)}
          progress={progress}
          onAction={handleAction}
          disabledReason={
            files.length === 0 ? "Upload a file to get started" : undefined
          }
        />
      )}

      <PaywallModal open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
}
