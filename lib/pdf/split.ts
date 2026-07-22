import { PDFDocument } from "@cantoo/pdf-lib";
import JSZip from "jszip";

export interface PageRange {
  from: number; // 1-indexed, inclusive
  to: number; // 1-indexed, inclusive
}

export type SplitMode =
  | { type: "ranges"; ranges: PageRange[] }
  | { type: "everyN"; n: number }
  | { type: "everyPage" };

export interface SplitResult {
  name: string;
  bytes: Uint8Array;
}

export async function splitPdf(
  file: File,
  mode: SplitMode
): Promise<SplitResult[]> {
  const bytes = await file.arrayBuffer();
  const src = await PDFDocument.load(bytes);
  const pageCount = src.getPageCount();
  const baseName = file.name.replace(/\.pdf$/i, "");

  const ranges: PageRange[] =
    mode.type === "ranges"
      ? mode.ranges
      : mode.type === "everyPage"
      ? Array.from({ length: pageCount }, (_, i) => ({
          from: i + 1,
          to: i + 1,
        }))
      : chunkRanges(pageCount, mode.n);

  const results: SplitResult[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const { from, to } = ranges[i];
    const clampedFrom = Math.max(1, from);
    const clampedTo = Math.min(pageCount, to);
    if (clampedFrom > clampedTo) continue;

    const doc = await PDFDocument.create();
    const indices = Array.from(
      { length: clampedTo - clampedFrom + 1 },
      (_, n) => clampedFrom - 1 + n
    );
    const pages = await doc.copyPages(src, indices);
    pages.forEach((page) => doc.addPage(page));
    const outBytes = await doc.save();

    const label =
      clampedFrom === clampedTo
        ? `page-${clampedFrom}`
        : `pages-${clampedFrom}-${clampedTo}`;
    results.push({ name: `${baseName}-${label}.pdf`, bytes: outBytes });
  }

  return results;
}

function chunkRanges(pageCount: number, n: number): PageRange[] {
  const chunks: PageRange[] = [];
  for (let start = 1; start <= pageCount; start += n) {
    chunks.push({ from: start, to: Math.min(pageCount, start + n - 1) });
  }
  return chunks;
}

export async function zipResults(
  results: SplitResult[],
  zipName = "split.zip"
): Promise<{ name: string; blob: Blob }> {
  const zip = new JSZip();
  for (const r of results) {
    zip.file(r.name, r.bytes);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  return { name: zipName, blob };
}
