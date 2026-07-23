import type { PDFDocumentProxy } from "pdfjs-dist";

export interface TextLineBox {
  x: number;
  y: number; // editor (y-down) page-point space
  width: number;
  height: number;
}

const lineCache = new Map<string, TextLineBox[]>();

/** Extracts per-line bounding boxes (in editor y-down point space) for a page, merging
 *  pdf.js's individual word/run text items that share a line into one contiguous box —
 *  this is what lets a highlight snap to whole lines instead of arbitrary drag rectangles. */
export async function getPageTextLines(
  doc: PDFDocumentProxy,
  pageNumber: number,
  pageHeightPt: number
): Promise<TextLineBox[]> {
  const cacheKey = `${pageNumber}`;
  const cached = lineCache.get(cacheKey);
  if (cached) return cached;

  const page = await doc.getPage(pageNumber);
  const content = await page.getTextContent();

  interface Item {
    x: number;
    top: number;
    width: number;
    height: number;
  }
  const items: Item[] = [];
  for (const raw of content.items) {
    const item = raw as { str: string; width: number; height: number; transform: number[] };
    if (!item.str || !item.str.trim()) continue;
    const [, , , , e, f] = item.transform;
    const height = item.height || 10;
    const top = pageHeightPt - f - height * 0.85;
    items.push({ x: e, top, width: item.width, height });
  }

  // Group items into lines by rounding their top position, then merge each group's
  // x-range into one box.
  const groups = new Map<number, Item[]>();
  for (const item of items) {
    const key = Math.round(item.top / 3) * 3;
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }

  const lines: TextLineBox[] = Array.from(groups.values()).map((group) => {
    const minX = Math.min(...group.map((i) => i.x));
    const maxX = Math.max(...group.map((i) => i.x + i.width));
    const minTop = Math.min(...group.map((i) => i.top));
    const maxHeight = Math.max(...group.map((i) => i.height));
    return { x: minX, y: minTop, width: maxX - minX, height: maxHeight };
  });

  lineCache.set(cacheKey, lines);
  return lines;
}

export function clearTextLineCache() {
  lineCache.clear();
}

function intersects(a: TextLineBox, b: { x: number; y: number; width: number; height: number }): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

/** Returns the lines overlapping a drag-selection rectangle, ready to become highlight rects. */
export function findOverlappingLines(
  lines: TextLineBox[],
  selection: { x: number; y: number; width: number; height: number }
): TextLineBox[] {
  return lines.filter((l) => intersects(l, selection));
}
