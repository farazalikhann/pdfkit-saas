import { StandardFonts, rgb } from "@cantoo/pdf-lib";
import { loadPdfSafely } from "@/lib/pdf/errors";

export interface HeaderFooterSlots {
  headerLeft: string;
  headerCenter: string;
  headerRight: string;
  footerLeft: string;
  footerCenter: string;
  footerRight: string;
}

export interface HeaderFooterOptions extends HeaderFooterSlots {
  fontSize: number;
  color: { r: number; g: number; b: number };
  marginPt: number;
  pages: Set<number> | null; // null = every page
  filename: string;
}

/** Expands {page}, {total}, {date}, {filename} tokens in a slot's raw text. */
export function formatHeaderFooterToken(pattern: string, page: number, total: number, filename: string): string {
  const dateStr = new Date().toLocaleDateString();
  return pattern
    .replace(/\{page\}/g, String(page))
    .replace(/\{total\}/g, String(total))
    .replace(/\{date\}/g, dateStr)
    .replace(/\{filename\}/g, filename);
}

export async function addHeaderFooter(file: File, options: HeaderFooterOptions): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await loadPdfSafely(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const color = rgb(options.color.r, options.color.g, options.color.b);
  const total = options.pages ? options.pages.size : pages.length;

  const slots: { text: string; align: "left" | "center" | "right"; fromTop: boolean }[] = [
    { text: options.headerLeft, align: "left", fromTop: true },
    { text: options.headerCenter, align: "center", fromTop: true },
    { text: options.headerRight, align: "right", fromTop: true },
    { text: options.footerLeft, align: "left", fromTop: false },
    { text: options.footerCenter, align: "center", fromTop: false },
    { text: options.footerRight, align: "right", fromTop: false },
  ];

  let counter = 1;
  for (let i = 0; i < pages.length; i++) {
    const pageNum = i + 1;
    if (options.pages && !options.pages.has(pageNum)) {
      continue;
    }
    const page = pages[i];
    const { width, height } = page.getSize();

    for (const slot of slots) {
      if (!slot.text.trim()) continue;
      const label = formatHeaderFooterToken(slot.text, counter, total, options.filename);
      const textWidth = font.widthOfTextAtSize(label, options.fontSize);
      const x =
        slot.align === "left"
          ? options.marginPt
          : slot.align === "right"
          ? width - options.marginPt - textWidth
          : (width - textWidth) / 2;
      const y = slot.fromTop ? height - options.marginPt : options.marginPt;
      page.drawText(label, { x, y, size: options.fontSize, font, color });
    }
    counter++;
  }

  return doc.save();
}
