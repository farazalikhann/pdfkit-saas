"use client";

import { create } from "zustand";

interface ChainState {
  file: File | null;
  setFile: (file: File) => void;
  clear: () => void;
}

/** In-memory (non-persisted) hand-off used by "Use another tool on this file". */
export const useChainStore = create<ChainState>((set) => ({
  file: null,
  setFile: (file) => set({ file }),
  clear: () => set({ file: null }),
}));
