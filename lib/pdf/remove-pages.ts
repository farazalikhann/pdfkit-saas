import { PDFDocument } from "@cantoo/pdf-lib";
import { copyMetadata } from "./copy-metadata";
import { loadPdfSafely } from "./errors";

/** Builds a new PDF with the given (1-indexed) pages deleted, everything else kept in order. */
export async function removePages(file: File, toDelete: Set<number>): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const src = await loadPdfSafely(bytes);
  const pageCount = src.getPageCount();

  const keepIndices = Array.from({ length: pageCount }, (_, i) => i).filter(
    (i) => !toDelete.has(i + 1)
  );
  if (keepIndices.length === 0) {
    throw new Error("That would remove every page. Leave at least one page in the document.");
  }

  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, keepIndices);
  pages.forEach((page) => doc.addPage(page));
  copyMetadata(src, doc);

  return doc.save();
}
