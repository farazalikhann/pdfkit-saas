"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { ToolShell } from "@/components/tool-shell/tool-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { protectPdf } from "@/lib/pdf/password-protect";
import type { ToolDefinition } from "@/lib/tools";
import { cn } from "@/lib/utils";

function passwordStrength(pw: string): { label: string; score: 0 | 1 | 2 | 3; className: string } {
  if (pw.length === 0) return { label: "", score: 0, className: "" };
  let variety = 0;
  if (/[a-z]/.test(pw)) variety++;
  if (/[A-Z]/.test(pw)) variety++;
  if (/[0-9]/.test(pw)) variety++;
  if (/[^a-zA-Z0-9]/.test(pw)) variety++;
  if (pw.length < 6 || variety <= 1) return { label: "Weak", score: 1, className: "bg-destructive" };
  if (pw.length < 10 || variety <= 2) return { label: "Fair", score: 2, className: "bg-amber-500" };
  return { label: "Strong", score: 3, className: "bg-emerald-500" };
}

export function PasswordProtectTool({ tool }: { tool: ToolDefinition }) {
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [allowPrinting, setAllowPrinting] = React.useState(true);
  const [allowCopying, setAllowCopying] = React.useState(true);

  const ready = password.length >= 4 && password === confirm;
  const strength = passwordStrength(password);

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
            {password.length > 0 && (
              <div className="flex items-center gap-2 pt-0.5">
                <div className="flex h-1.5 flex-1 gap-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn("h-full flex-1 rounded-full bg-muted", i <= strength.score && strength.className)}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{strength.label}</span>
              </div>
            )}
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
