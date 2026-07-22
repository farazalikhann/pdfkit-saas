"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FREE_TIER, PRO_TIER } from "@/lib/constants";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

interface UsageState {
  isPro: boolean;
  tasksUsedToday: number;
  lastResetDate: string;
  /** Resets the daily counter if the day changed. */
  syncDay: () => void;
  /** Hard gate checked before processing even starts. */
  checkFileSize: (fileSizeBytes: number) => { allowed: boolean; reason?: string };
  /** Soft gate: true once the user is over their daily quota (checked after processing, to drive the paywall). */
  isOverDailyLimit: () => boolean;
  recordTaskRun: () => void;
  setPro: (isPro: boolean) => void;
  tasksPerDay: () => number;
}

export const useUsageStore = create<UsageState>()(
  persist(
    (set, get) => ({
      isPro: false,
      tasksUsedToday: 0,
      lastResetDate: todayKey(),

      syncDay: () => {
        if (get().lastResetDate !== todayKey()) {
          set({ tasksUsedToday: 0, lastResetDate: todayKey() });
        }
      },

      checkFileSize: (fileSizeBytes: number) => {
        const tier = get().isPro ? PRO_TIER : FREE_TIER;
        if (fileSizeBytes > tier.maxFileSizeBytes) {
          const mb = Math.round(tier.maxFileSizeBytes / (1024 * 1024));
          return {
            allowed: false,
            reason: `This file is larger than the ${mb}MB limit on your plan.`,
          };
        }
        return { allowed: true };
      },

      isOverDailyLimit: () => {
        get().syncDay();
        const { isPro, tasksUsedToday } = get();
        if (isPro) return false;
        return tasksUsedToday >= FREE_TIER.tasksPerDay;
      },

      recordTaskRun: () => {
        get().syncDay();
        set({ tasksUsedToday: get().tasksUsedToday + 1 });
      },

      setPro: (isPro: boolean) => set({ isPro }),

      tasksPerDay: () => (get().isPro ? Infinity : FREE_TIER.tasksPerDay),
    }),
    { name: "pdfkit-usage" }
  )
);
