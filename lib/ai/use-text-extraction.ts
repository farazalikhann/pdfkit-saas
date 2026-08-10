"use client";

import * as React from "react";
import { extractPdfText, type ExtractTextLimits } from "@/lib/pdf/extract-text";

export type ExtractionPhase =
  | "idle"
  | "extracting"
  | "needs-ocr"
  | "ocr-running"
  | "done"
  | "error";

interface ExtractionState {
  phase: ExtractionPhase;
  text: string | null;
  pageCount: number;
  progress: number; // 0-1
  statusText: string;
  error: string | null;
}

const INITIAL_STATE: ExtractionState = {
  phase: "idle",
  text: null,
  pageCount: 0,
  progress: 0,
  statusText: "",
  error: null,
};

// Below this, treat the document as having no usable text layer, a real
// scanned page yields 0 characters from pdf.js, so this is a generous
// threshold that won't false-positive on any document with real prose.
const MIN_USABLE_CHARS = 40;

/**
 * Shared by Summarize/Translate/MCQ: extracts a PDF's text client-side, and
 * if that comes back empty or near-empty (a scanned/image-only PDF), pauses
 * in a "needs-ocr" phase instead of just failing, the caller can offer the
 * user a "Run OCR first?" prompt and call `runOcr()` to recover real text
 * via the same tesseract.js pipeline the OCR tool uses, before continuing.
 */
export function useTextExtraction(limits: ExtractTextLimits) {
  const [state, setState] = React.useState<ExtractionState>(INITIAL_STATE);
  const fileRef = React.useRef<File | null>(null);

  function reset() {
    fileRef.current = null;
    setState(INITIAL_STATE);
  }

  async function start(file: File): Promise<string | null> {
    fileRef.current = file;
    setState({ ...INITIAL_STATE, phase: "extracting", statusText: "Reading document…" });
    try {
      const { text, pageCount } = await extractPdfText(file, limits, (f) =>
        setState((s) => ({ ...s, progress: f * 0.5 }))
      );
      if (text.trim().length < MIN_USABLE_CHARS) {
        setState((s) => ({ ...s, phase: "needs-ocr", pageCount, progress: 0.5 }));
        return null;
      }
      setState((s) => ({ ...s, phase: "done", text, pageCount, progress: 0.5 }));
      return text;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Couldn't read this PDF.";
      setState((s) => ({ ...s, phase: "error", error: message }));
      return null;
    }
  }

  async function runOcr(): Promise<string | null> {
    const file = fileRef.current;
    if (!file) return null;
    setState((s) => ({ ...s, phase: "ocr-running", statusText: "Starting OCR…", progress: 0.5 }));
    try {
      const { buildSearchablePdf } = await import("@/lib/pdf/ocr/build-searchable-pdf");
      const pageCount = state.pageCount || 1;
      const allPages = new Set(Array.from({ length: pageCount }, (_, i) => i + 1));
      const result = await buildSearchablePdf(file, allPages, "eng", (p) => {
        setState((s) => ({
          ...s,
          statusText:
            p.phase === "loading-language"
              ? "Downloading OCR language data (first time only)…"
              : `Reading page ${p.ordinal ?? "?"} of ${p.totalPagesToOcr}…`,
          progress: 0.5 + p.fraction * 0.45,
        }));
      });
      const text = result.plainText.trim();
      if (text.length < MIN_USABLE_CHARS) {
        setState((s) => ({
          ...s,
          phase: "error",
          error: "Couldn't find any readable text in this PDF, even with OCR.",
        }));
        return null;
      }
      setState((s) => ({ ...s, phase: "done", text, progress: 1 }));
      return text;
    } catch (err) {
      const message = err instanceof Error ? err.message : "OCR failed. Please try again.";
      setState((s) => ({ ...s, phase: "error", error: message }));
      return null;
    }
  }

  return { ...state, start, runOcr, reset };
}
