import { Lock } from "lucide-react";

export function ClientSideBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
      <Lock className="h-3 w-3" />
      Your file never leaves your device
    </div>
  );
}
