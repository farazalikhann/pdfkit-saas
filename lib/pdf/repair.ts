import { PDFDocument } from "@cantoo/pdf-lib";
import { loadPdfDocument, renderPageToDataUrl } from "./thumbnails";
import { copyMetadata } from "./copy-metadata";

export interface RepairResult {
  bytes: Uint8Array | null;
  recoveredPages: number;
  totalPages: number;
  /** true if real vector content couldn't be salvaged and pages were rescued as rasterized images. */
  usedRasterFallback: boolean;
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Best-effort PDF repair, in two tiers:
 *  1. Try a lenient pdf-lib load + full page copy + fresh save. This alone fixes the
 *     most common damage (a broken/missing xref table, a mangled trailer, a dangling
 *     incremental-update chain) because saving always writes a brand new, valid
 *     structure — and it preserves real vector text/images since pages are copied,
 *     not rasterized.
 *  2. If that fails outright, or throws on specific pages, fall back to pdf.js (which
 *     has its own, more forgiving recovery heuristics) and rescue whatever pages it
 *     can still render, page by page, as images in a fresh document. Never claims
 *     success it didn't earn — pages that fail both tiers are simply left out, and
 *     the caller is told exactly how many of how many were recovered.
 */
export async function repairPdf(
  file: File,
  onProgress?: (fraction: number) => void
): Promise<RepairResult> {
  const bytes = await file.arrayBuffer();

  try {
    const src = await PDFDocument.load(bytes, {
      throwOnInvalidObject: false,
      ignoreEncryption: true,
      updateMetadata: false,
    });
    const pageCount = src.getPageCount();
    if (pageCount > 0) {
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
      copyMetadata(src, out);
      onProgress?.(1);
      return {
        bytes: await out.save(),
        recoveredPages: pageCount,
        totalPages: pageCount,
        usedRasterFallback: false,
      };
    }
  } catch {
    // Structurally too damaged for pdf-lib's own parser — fall through to the pdf.js tier.
  }

  let pdfjsDoc;
  try {
    pdfjsDoc = await loadPdfDocument(bytes.slice(0));
  } catch {
    return { bytes: null, recoveredPages: 0, totalPages: 0, usedRasterFallback: true };
  }

  const totalPages = pdfjsDoc.numPages;
  if (totalPages === 0) {
    return { bytes: null, recoveredPages: 0, totalPages: 0, usedRasterFallback: true };
  }

  const out = await PDFDocument.create();
  let recovered = 0;
  for (let i = 1; i <= totalPages; i++) {
    try {
      const rendered = await renderPageToDataUrl(pdfjsDoc, i, 2, "image/jpeg", 0.92);
      const jpgBytes = await dataUrlToBytes(rendered.dataUrl);
      const image = await out.embedJpg(jpgBytes);
      const page = out.addPage([rendered.width, rendered.height]);
      page.drawImage(image, { x: 0, y: 0, width: rendered.width, height: rendered.height });
      recovered++;
    } catch {
      // This specific page is unrecoverable — drop it rather than fail the whole job.
    }
    onProgress?.(i / totalPages);
  }

  if (recovered === 0) {
    return { bytes: null, recoveredPages: 0, totalPages, usedRasterFallback: true };
  }

  return {
    bytes: await out.save(),
    recoveredPages: recovered,
    totalPages,
    usedRasterFallback: true,
  };
}
