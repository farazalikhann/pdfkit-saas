import { PDFDocument } from "@cantoo/pdf-lib";
import { copyMetadata } from "./copy-metadata";
import { loadPdfSafely } from "./errors";

export interface ExtractResult {
  name: string;
  bytes: Uint8Array;
}

/** Builds a single new PDF containing only the selected pages, in document order. */
export async function extractPages(
  file: File,
  selected: Set<number>,
  namePrefix?: string
): Promise<ExtractResult> {
  const bytes = await file.arrayBuffer();
  const src = await loadPdfSafely(bytes);
  const baseName = (namePrefix?.trim() || file.name.replace(/\.pdf$/i, "")).replace(/[/\\?%*:|"<>]/g, "-");

  const indices = Array.from(selected)
    .sort((a, b) => a - b)
    .map((p) => p - 1);

  const doc = await PDFDocument.create();
  const pages = await doc.copyPages(src, indices);
  pages.forEach((page) => doc.addPage(page));
  copyMetadata(src, doc);

  return { name: `${baseName}-extracted.pdf`, bytes: await doc.save() };
}

/** Builds one standalone PDF per selected page. */
export async function extractPagesSeparately(
  file: File,
  selected: Set<number>,
  namePrefix?: string
): Promise<ExtractResult[]> {
  const bytes = await file.arrayBuffer();
  const src = await loadPdfSafely(bytes);
  const baseName = (namePrefix?.trim() || file.name.replace(/\.pdf$/i, "")).replace(/[/\\?%*:|"<>]/g, "-");

  const results: ExtractResult[] = [];
  for (const page of Array.from(selected).sort((a, b) => a - b)) {
    const doc = await PDFDocument.create();
    const [copied] = await doc.copyPages(src, [page - 1]);
    doc.addPage(copied);
    copyMetadata(src, doc);
    results.push({ name: `${baseName}-page-${page}.pdf`, bytes: await doc.save() });
  }
  return results;
}
