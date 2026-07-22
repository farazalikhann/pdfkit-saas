import { Lock, Globe } from "lucide-react";

export function ClientSideBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <Lock className="h-3 w-3" />
      Your file never leaves your device
    </div>
  );
}

/** For the one tool that isn't on-device (Summarize) — never claim privacy we don't have. */
export function ServerSideNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-start gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
      <Globe className="mt-0.5 h-3 w-3 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
