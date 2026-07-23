import { PDFDocument } from "@cantoo/pdf-lib";
import { createWorker } from "tesseract.js";
import { loadPdfDocument, renderPageToDataUrl } from "@/lib/pdf/thumbnails";
import { loadPdfSafely } from "@/lib/pdf/errors";
import { copyMetadata } from "@/lib/pdf/copy-metadata";

export interface OcrProgress {
  phase: "loading-language" | "recognizing";
  /** 1-indexed page currently being processed, only set during "recognizing". */
  pageNumber?: number;
  /** 1-indexed position within the batch of pages being OCR'd (for "Page 3 of 12"). */
  ordinal?: number;
  totalPagesToOcr: number;
  /** 0-1 fraction within the current phase/page. */
  fraction: number;
}

export interface OcrResult {
  pdfBytes: Uint8Array;
  plainText: string;
}

const OCR_RENDER_SCALE = 200 / 72; // ~200 DPI — good balance of accuracy vs. speed

/**
 * OCRs the selected pages of a PDF and produces a new PDF where those pages are
 * replaced by Tesseract's own PDF renderer output (the re-rendered page image with
 * an invisible, searchable text layer baked in — the same renderer the `tesseract`
 * CLI and tools like ocrmypdf use). Unselected pages are copied through untouched.
 * Also returns the plain extracted text for all OCR'd pages combined.
 */
export async function buildSearchablePdf(
  file: File,
  selectedPages: Set<number>,
  lang: string,
  onProgress?: (p: OcrProgress) => void
): Promise<OcrResult> {
  const bytes = await file.arrayBuffer();
  const src = await loadPdfSafely(bytes);
  const pdfjsDoc = await loadPdfDocument(bytes.slice(0));
  const pageCount = src.getPageCount();
  const pagesToOcr = Array.from(selectedPages)
    .filter((p) => p >= 1 && p <= pageCount)
    .sort((a, b) => a - b);

  const worker = await createWorker(lang, undefined, {
    logger: (m) => {
      if (m.status?.includes("load") || m.status?.includes("init")) {
        onProgress?.({
          phase: "loading-language",
          totalPagesToOcr: pagesToOcr.length,
          fraction: m.progress ?? 0,
        });
      }
    },
  });

  try {
    const out = await PDFDocument.create();
    const textParts: string[] = [];
    const ocrSet = new Set(pagesToOcr);

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      if (!ocrSet.has(pageNum)) {
        const [copied] = await out.copyPages(src, [pageNum - 1]);
        out.addPage(copied);
        continue;
      }

      const doneCount = pagesToOcr.indexOf(pageNum);
      onProgress?.({
        phase: "recognizing",
        pageNumber: pageNum,
        ordinal: doneCount + 1,
        totalPagesToOcr: pagesToOcr.length,
        fraction: doneCount / Math.max(1, pagesToOcr.length),
      });

      const rendered = await renderPageToDataUrl(pdfjsDoc, pageNum, OCR_RENDER_SCALE, "image/png", 1);
      const { data } = await worker.recognize(
        rendered.dataUrl,
        { pdfTitle: file.name.replace(/\.pdf$/i, "") },
        { pdf: true, text: true }
      );

      if (data.text) textParts.push(data.text);
      if (data.pdf) {
        const singlePagePdf = await PDFDocument.load(new Uint8Array(data.pdf));
        const [copied] = await out.copyPages(singlePagePdf, [0]);
        out.addPage(copied);
      } else {
        // Recognition produced no PDF output for this page — fall back to the
        // original page rather than silently dropping it from the result.
        const [copied] = await out.copyPages(src, [pageNum - 1]);
        out.addPage(copied);
      }
    }

    onProgress?.({
      phase: "recognizing",
      totalPagesToOcr: pagesToOcr.length,
      fraction: 1,
    });

    copyMetadata(src, out);
    const pdfBytes = await out.save();
    return { pdfBytes, plainText: textParts.join("\n\n") };
  } finally {
    await worker.terminate();
  }
}
