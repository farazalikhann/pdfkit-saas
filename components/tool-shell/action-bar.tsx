"use client";

import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ActionState = "idle" | "ready" | "processing" | "done" | "error";

interface ActionBarProps {
  state: ActionState;
  label: string;
  progress?: number;
  onAction: () => void;
  disabledReason?: string;
}

export function ActionBar({
  state,
  label,
  progress = 0,
  onAction,
  disabledReason,
}: ActionBarProps) {
  const isDisabled = state === "idle" || state === "processing";

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "bottom-[calc(56px+env(safe-area-inset-bottom))] md:bottom-0"
      )}
    >
      <div className="mx-auto max-w-2xl">
        <Button
          size="lg"
          onClick={onAction}
          disabled={isDisabled}
          className="min-h-[52px] w-full text-base font-semibold"
          aria-live="polite"
        >
          {state === "processing" && (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing {Math.round(progress)}%
            </>
          )}
          {state === "done" && (
            <>
              <Check className="h-5 w-5" />
              Done
            </>
          )}
          {(state === "ready" || state === "idle" || state === "error") &&
            label}
        </Button>
        {state === "idle" && disabledReason && (
          <p className="mt-1.5 text-center text-xs text-muted-foreground">
            {disabledReason}
          </p>
        )}
      </div>
    </div>
  );
}
