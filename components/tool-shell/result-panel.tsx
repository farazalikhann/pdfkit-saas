"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, Share2, CloudUpload, ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { downloadBlob, formatBytes } from "@/lib/utils";
import { getVisibleTools, type ToolDefinition } from "@/lib/tools";
import { useChainStore } from "@/lib/store/chain-store";
import { toast } from "sonner";

export interface ResultFile {
  name: string;
  blob: Blob;
}

interface ResultPanelProps {
  tool: ToolDefinition;
  results: ResultFile[];
}

export function ResultPanel({ tool, results }: ResultPanelProps) {
  const router = useRouter();
  const [chainOpen, setChainOpen] = React.useState(false);
  const setChainFile = useChainStore((s) => s.setFile);
  const primary = results[0];

  async function handleShare() {
    if (!primary) return;
    const file = new File([primary.blob], primary.name, {
      type: primary.blob.type,
    });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: primary.name });
      } catch {
        /* user cancelled */
      }
    } else {
      toast.info("Sharing isn't supported on this browser — download instead.");
    }
  }

  function handleDownload(result: ResultFile) {
    downloadBlob(result.blob, result.name);
  }

  function handleSaveToDrive() {
    toast.info("Save to Drive is coming soon", {
      description: "For now, download the file and upload it manually.",
    });
  }

  const suggestions = getVisibleTools()
    .filter((t) => t.slug !== tool.slug && t.category === tool.category)
    .slice(0, 6);

  function handleChainTo(nextSlug: string) {
    if (!primary) return;
    const file = new File([primary.blob], primary.name, {
      type: primary.blob.type || "application/pdf",
    });
    setChainFile(file);
    setChainOpen(false);
    router.push(`/tools/${nextSlug}?chained=1`);
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-7 w-7" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Your file is ready</h3>
        <p className="text-sm text-muted-foreground">
          {results.length === 1
            ? `${primary.name} · ${formatBytes(primary.blob.size)}`
            : `${results.length} files ready to download`}
        </p>
      </div>

      <div className="space-y-2">
        {results.map((r) => (
          <Button
            key={r.name}
            size="lg"
            className="min-h-[52px] w-full gap-2 text-base font-semibold"
            onClick={() => handleDownload(r)}
          >
            <Download className="h-5 w-5" />
            Download {results.length > 1 ? r.name : ""}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" className="flex-col gap-1 h-16" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          <span className="text-xs">Share</span>
        </Button>
        <Button
          variant="outline"
          className="flex-col gap-1 h-16"
          onClick={handleSaveToDrive}
        >
          <CloudUpload className="h-4 w-4" />
          <span className="text-xs">Save to Drive</span>
        </Button>
        <Button
          variant="outline"
          className="flex-col gap-1 h-16"
          onClick={() => setChainOpen(true)}
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span className="text-xs">Chain tool</span>
        </Button>
      </div>

      <Sheet open={chainOpen} onOpenChange={setChainOpen}>
        <SheetContent side="bottom" className="max-h-[70dvh] rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Use another tool on this file</SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-2 gap-2 overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {suggestions.map((t) => (
              <button
                key={t.slug}
                onClick={() => handleChainTo(t.slug)}
                className="flex items-center gap-2 rounded-xl border border-border p-3 text-left text-sm font-medium transition-colors active:bg-accent"
              >
                <t.icon className="h-5 w-5 shrink-0 text-primary" />
                {t.shortName}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
