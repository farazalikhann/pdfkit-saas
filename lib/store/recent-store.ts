"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface RecentEntry {
  id: string;
  toolSlug: string;
  toolName: string;
  fileName: string;
  timestamp: number;
}

interface RecentState {
  entries: RecentEntry[];
  addRecent: (entry: Omit<RecentEntry, "id" | "timestamp">) => void;
  clear: () => void;
}

const MAX_ENTRIES = 20;

export const useRecentStore = create<RecentState>()(
  persist(
    (set, get) => ({
      entries: [],
      addRecent: (entry) => {
        const next: RecentEntry = {
          ...entry,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
        };
        set({ entries: [next, ...get().entries].slice(0, MAX_ENTRIES) });
      },
      clear: () => set({ entries: [] }),
    }),
    { name: "pdfkit-recent" }
  )
);
