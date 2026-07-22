"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { protectPdf } from "@/lib/pdf/password-protect";
import type { ToolDefinition } from "@/lib/tools";

export function PasswordProtectTool({ tool }: { tool: ToolDefinition }) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [allowPrinting, setAllowPrinting] = React.useState(true);
  const [allowCopying, setAllowCopying] = React.useState(true);

  const ready = password.length >= 4 && password === confirm;

  return (
    <ToolShell
      tool={tool}
      actionLabel={() => "Protect PDF"}
      canRun={() => ready}
      options={() => (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <div className="relative">
              <Input
                id="pw"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 4 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="pw-confirm">Confirm password</Label>
            <Input
              id="pw-confirm"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {confirm.length > 0 && confirm !== password && (
              <p className="text-xs text-destructive">Passwords don&apos;t match</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="allow-print" className="font-normal">
              Allow printing
            </Label>
            <Switch
              id="allow-print"
              checked={allowPrinting}
              onCheckedChange={setAllowPrinting}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="allow-copy" className="font-normal">
              Allow copying text
            </Label>
            <Switch
              id="allow-copy"
              checked={allowCopying}
              onCheckedChange={setAllowCopying}
            />
          </div>
        </div>
      )}
      onProcess={async (files) => {
        const bytes = await protectPdf(files[0], {
          userPassword: password,
          allowPrinting,
          allowCopying,
        });
        return [
          {
            name: "protected.pdf",
            blob: new Blob([new Uint8Array(bytes)], { type: "application/pdf" }),
          },
        ];
      }}
    />
  );
}
