"use client";

import { ScanText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OcrFallbackPrompt({
  onRunOcr,
  onCancel,
}: {
  onRunOcr: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <ScanText className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-semibold">This looks like a scanned PDF</p>
        <p className="mt-1 text-sm text-muted-foreground">
          No selectable text was found, it&apos;s probably a photo or scan rather
          than a digital document. Run OCR first to read the text out of it, then
          continue. OCR is slower than normal, especially on mobile.
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <Button variant="outline" onClick={onCancel}>
          Try a different file
        </Button>
        <Button onClick={onRunOcr}>Run OCR</Button>
      </div>
    </div>
  );
}
