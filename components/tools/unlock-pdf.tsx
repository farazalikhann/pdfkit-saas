"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { unlockPdf } from "@/lib/pdf/unlock";
import type { ToolDefinition } from "@/lib/tools";

export function UnlockPdfTool({ tool }: { tool: ToolDefinition }) {
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Unlock PDF"}
      canRun={() => password.length > 0}
      notice={() => (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Removes a password you already know. This does not crack protected files.
        </p>
      )}
      options={() => (
        <div className="space-y-1.5">
          <Label htmlFor="unlock-pw">Current password</Label>
          <div className="relative">
            <Input
              id="unlock-pw"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password for this file"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
      onProcess={async (files) => {
        const bytes = await unlockPdf(files[0], password);
        return [
          {
            name: "unlocked.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
