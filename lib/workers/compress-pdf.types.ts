import type { PresetKey } from "@/lib/pdf/compress/presets";

export type CompressMode =
  | { type: "preset"; preset: PresetKey }
  | { type: "target-size"; targetBytes: number };

export interface CompressPdfRequest {
  fileBuffer: ArrayBuffer;
  mode: CompressMode;
  stripMetadata: boolean;
}

export interface CompressPdfResult {
  bytes: ArrayBuffer;
  originalSize: number;
  compressedSize: number;
  imagesProcessed: number;
  imagesSkipped: number;
  /** Which preset was actually applied — the chosen one, or (target-size mode) the one the search landed on. */
  presetUsed: PresetKey;
  /** target-size mode only: false if even the most aggressive preset couldn't reach the target. */
  targetMet?: boolean;
}
