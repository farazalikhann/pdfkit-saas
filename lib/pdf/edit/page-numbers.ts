import { StandardFonts, rgb } from "@cantoo/pdf-lib";
import { loadPdfSafely } from "@/lib/pdf/errors";

export type NinePosition =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

export interface PageNumberOptions {
  position: NinePosition;
  pattern: string; // e.g. "Page {n} of {total}"
  startNumber: number;
  firstPageToNumber: number; // 1-indexed
  pagesToNumber: Set<number> | null; // null = all pages from firstPageToNumber onward
  fontSize: number;
  color: { r: number; g: number; b: number };
  marginPt: number;
}

export function formatPageNumber(pattern: string, n: number, total: number): string {
  return pattern.replace(/\{n\}/g, String(n)).replace(/\{total\}/g, String(total));
}

function anchorFor(position: NinePosition, pageWidth: number, pageHeight: number, margin: number, textWidth: number, textHeight: number) {
  const [v, h] = position.split("-") as ["top" | "middle" | "bottom", "left" | "center" | "right"];
  const x = h === "left" ? margin : h === "right" ? pageWidth - margin - textWidth : (pageWidth - textWidth) / 2;
  const y = v === "top" ? pageHeight - margin - textHeight : v === "bottom" ? margin : (pageHeight - textHeight) / 2;
  return { x, y };
}

export async function addPageNumbers(file: File, options: PageNumberOptions): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await loadPdfSafely(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const color = rgb(options.color.r, options.color.g, options.color.b);

  let counter = options.startNumber;
  const totalNumbered = options.pagesToNumber
    ? options.pagesToNumber.size
    : pages.length - options.firstPageToNumber + 1;

  for (let i = 0; i < pages.length; i++) {
    const pageNum1Indexed = i + 1;
    if (pageNum1Indexed < options.firstPageToNumber) continue;
    if (options.pagesToNumber && !options.pagesToNumber.has(pageNum1Indexed)) continue;

    const label = formatPageNumber(options.pattern, counter, options.pagesToNumber ? options.startNumber + totalNumbered - 1 : options.startNumber + totalNumbered - 1);
    const page = pages[i];
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(label, options.fontSize);
    const { x, y } = anchorFor(options.position, width, height, options.marginPt, textWidth, options.fontSize);
    page.drawText(label, { x, y, size: options.fontSize, font, color });
    counter++;
  }

  return doc.save();
}
