import { recompressPdfImages } from "@/lib/pdf/compress/recompress-images";
import { PRESETS, PRESET_ORDER } from "@/lib/pdf/compress/presets";
import type { CompressPdfRequest, CompressPdfResult } from "./compress-pdf.types";

// Shadow the ambient globals with a precise local shape instead of pulling in the
// "webworker" lib (which conflicts with the app's "dom" lib in the same tsconfig).
declare const self: {
  onmessage: ((event: MessageEvent<CompressPdfRequest>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

const MAX_TARGET_SIZE_ATTEMPTS = 6;

self.onmessage = async (event) => {
  try {
    const { fileBuffer, mode, stripMetadata } = event.data;
    const originalSize = fileBuffer.byteLength;

    if (mode.type === "preset") {
      const result = await recompressPdfImages(fileBuffer, PRESETS[mode.preset], {
        stripMetadata,
        onProgress: (f) => self.postMessage({ type: "progress", fraction: f }),
      });
      const response: CompressPdfResult = {
        bytes: result.bytes.buffer as ArrayBuffer,
        originalSize,
        compressedSize: result.bytes.byteLength,
        imagesProcessed: result.imagesProcessed,
        imagesSkipped: result.imagesSkipped,
        presetUsed: mode.preset,
      };
      self.postMessage({ type: "done", result: response }, [response.bytes]);
      return;
    }

    // Target-size mode: binary search over the preset ladder (least -> most aggressive)
    // for the least-aggressive preset that still lands at or under the target. Capped so
    // a handful of full compression passes can never turn into an unbounded loop.
    let lo = 0;
    let hi = PRESET_ORDER.length - 1;
    let attempts = 0;
    let best: { preset: (typeof PRESET_ORDER)[number]; result: Awaited<ReturnType<typeof recompressPdfImages>> } | null = null;
    let last: { preset: (typeof PRESET_ORDER)[number]; result: Awaited<ReturnType<typeof recompressPdfImages>> } | null = null;

    while (lo <= hi && attempts < MAX_TARGET_SIZE_ATTEMPTS) {
      const mid = Math.floor((lo + hi) / 2);
      const preset = PRESET_ORDER[mid];
      const attemptIndex = attempts;
      // Fresh copy per attempt — cheap relative to the encode work, and removes any
      // risk of one attempt's parsed objects sharing memory with the next's.
      const bufferCopy = fileBuffer.slice(0);
      const result = await recompressPdfImages(bufferCopy, PRESETS[preset], {
        stripMetadata,
        onProgress: (f) =>
          self.postMessage({
            type: "progress",
            fraction: (attemptIndex + f) / MAX_TARGET_SIZE_ATTEMPTS,
          }),
      });
      attempts++;
      last = { preset, result };

      if (result.bytes.byteLength <= mode.targetBytes) {
        best = { preset, result };
        hi = mid - 1; // try to find a less-aggressive preset that still fits
      } else {
        lo = mid + 1; // need more aggressive compression
      }
    }

    const chosen = best ?? last!;
    const response: CompressPdfResult = {
      bytes: chosen.result.bytes.buffer as ArrayBuffer,
      originalSize,
      compressedSize: chosen.result.bytes.byteLength,
      imagesProcessed: chosen.result.imagesProcessed,
      imagesSkipped: chosen.result.imagesSkipped,
      presetUsed: chosen.preset,
      targetMet: best !== null,
    };
    self.postMessage({ type: "progress", fraction: 1 });
    self.postMessage({ type: "done", result: response }, [response.bytes]);
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : "PDF compression failed.",
    });
  }
};
