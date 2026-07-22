"use client";

import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";
import { useRecentStore } from "@/lib/store/recent-store";
import { getToolBySlug } from "@/lib/tools";
import { Button } from "@/components/ui/button";

function timeAgo(ts: number): string {
  const diffMs = Date.now() - ts;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentPage() {
  const entries = useRecentStore((s) => s.entries);
  const clear = useRecentStore((s) => s.clear);

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Recent</h1>
          <p className="text-sm text-muted-foreground">
            Tools you&apos;ve used recently, on this device.
          </p>
        </div>
        {entries.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clear} className="gap-1.5">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <Clock className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Nothing here yet — tools you use will show up for quick access.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const tool = getToolBySlug(entry.toolSlug);
            if (!tool) return null;
            return (
              <li key={entry.id}>
                <Link
                  href={`/tools/${tool.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors active:bg-accent"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <tool.icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{tool.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.fileName}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(entry.timestamp)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
