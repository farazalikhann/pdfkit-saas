"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface State {
  hasError: boolean;
  message?: string;
}

/**
 * Wraps every tool page — a bug in one tool's rendering shows a friendly
 * message with a reset button instead of a blank white screen.
 */
export class ToolErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-semibold">This tool hit a snag</h2>
          <p className="mt-1 text-sm text-muted-foreground">{this.state.message}</p>
          <Button
            className="mt-5"
            onClick={() => this.setState({ hasError: false, message: undefined })}
          >
            Try another file
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
