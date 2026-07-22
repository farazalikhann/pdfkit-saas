"use client";

import { WifiOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <WifiOff className="h-8 w-8" />
      </span>
      <div>
        <h1 className="text-lg font-bold">You&apos;re offline</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PDFKit needs a connection for this page. Tools you&apos;ve already
          opened may still work from your device.
        </p>
      </div>
      <Button onClick={() => window.location.reload()} className="gap-2">
        <RotateCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
