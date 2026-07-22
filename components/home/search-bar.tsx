"use client";

import * as React from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { searchTools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const [query, setQuery] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const results = React.useMemo(() => searchTools(query).slice(0, 8), [query]);
  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          inputMode="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search 30+ PDF tools…"
          className="h-14 w-full rounded-2xl border border-border bg-card pl-12 pr-11 text-base shadow-sm outline-none ring-primary/30 placeholder:text-muted-foreground focus:ring-2"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground active:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          className={cn(
            "absolute inset-x-0 top-[calc(100%+8px)] z-30 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-lg"
          )}
        >
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No tools match &ldquo;{query}&rdquo;
            </p>
          ) : (
            results.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors active:bg-accent"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <tool.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{tool.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tool.description}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
