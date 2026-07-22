import { PDFDocument } from "@cantoo/pdf-lib";
import { copyMetadata } from "./copy-metadata";
import { loadPdfSafely } from "./errors";

/** Rebuilds the PDF with pages in the given order (1-indexed original page numbers). */
export async function reorderPages(file: File, order: number[]): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await loadPdfSafely(bytes);

  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(
    src,
    order.map((p) => p - 1)
  );
  pages.forEach((page) => doc.addPage(page));
  copyMetadata(src, doc);

  return doc.save();
}
