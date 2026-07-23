export type PresetKey = "minimal" | "light" | "recommended" | "strong" | "extreme";

export interface CompressSettings {
  dpi: number;
  quality: number; // 0-1
}

/** Ordered least-aggressive -> most-aggressive; order matters for the target-size binary search. */
export const PRESETS: Record<PresetKey, CompressSettings & { label: string; hint: string }> = {
  minimal: { dpi: 300, quality: 0.9, label: "Minimal", hint: "Near-lossless, print quality" },
  light: { dpi: 200, quality: 0.8, label: "Light", hint: "Barely visible difference" },
  recommended: { dpi: 150, quality: 0.7, label: "Recommended", hint: "Best balance — default" },
  strong: { dpi: 100, quality: 0.5, label: "Strong", hint: "Noticeably softer, still readable" },
  extreme: { dpi: 72, quality: 0.35, label: "Extreme", hint: "Screen-only, visibly degraded" },
};

export const PRESET_ORDER: PresetKey[] = ["minimal", "light", "recommended", "strong", "extreme"];
