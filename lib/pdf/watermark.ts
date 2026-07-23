import { StandardFonts, rgb, degrees, PDFArray, type PDFPage, type PDFRef } from "@cantoo/pdf-lib";
import { loadPdfSafely } from "./errors";

export type WatermarkPosition =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right"
  | "tiled";

export interface WatermarkOptions {
  kind: "text" | "image";
  text: string;
  fontSize: number;
  color: { r: number; g: number; b: number };
  imageDataUrl?: string;
  imageMimeType?: "image/png" | "image/jpeg";
  imageScale: number; // 0-1, relative to page width
  opacity: number; // 0-1
  rotationDegrees: number;
  position: WatermarkPosition;
  layer: "front" | "behind";
  pages: Set<number> | null; // null = all pages
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

function anchorForPosition(position: WatermarkPosition, pageW: number, pageH: number, w: number, h: number, margin = 36) {
  const [v, hpos] = position === "tiled" ? ["middle", "center"] : (position.split("-") as ["top" | "middle" | "bottom", "left" | "center" | "right"]);
  const x = hpos === "left" ? margin : hpos === "right" ? pageW - margin - w : (pageW - w) / 2;
  const y = v === "top" ? pageH - margin - h : v === "bottom" ? margin : (pageH - h) / 2;
  return { x, y };
}

/** Moves the content stream a draw call just created to the front of the page's
 *  Contents array, so it renders underneath everything already on the page —
 *  pdf-lib always appends new drawing (i.e. on top), so "behind" needs this. */
function moveLastContentStreamToFront(page: PDFPage, sizeBefore: number) {
  const contents = page.node.Contents();
  if (!(contents instanceof PDFArray) || contents.size() <= sizeBefore) return;
  const ref = contents.get(contents.size() - 1) as PDFRef;
  const idx = contents.indexOf(ref);
  if (idx === undefined || idx <= 0) return;
  contents.remove(idx);
  contents.insert(0, ref);
}

export async function addWatermark(file: File, options: WatermarkOptions): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await loadPdfSafely(bytes);
  const pages = doc.getPages();
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  let image: Awaited<ReturnType<typeof doc.embedPng>> | null = null;
  if (options.kind === "image" && options.imageDataUrl) {
    const imgBytes = await dataUrlToBytes(options.imageDataUrl);
    image = options.imageMimeType === "image/png" ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
  }

  for (let i = 0; i < pages.length; i++) {
    const pageNum = i + 1;
    if (options.pages && !options.pages.has(pageNum)) continue;
    const page = pages[i];
    const { width: pageW, height: pageH } = page.getSize();

    // Force Contents into (already-normalized) array form and note its length so we
    // can find exactly which new stream this draw call adds, without touching any
    // existing content, annotations, or links on the page.
    page.node.normalizedEntries();
    const contentsBefore = page.node.Contents();
    const sizeBefore = contentsBefore instanceof PDFArray ? contentsBefore.size() : 0;

    const drawOnce = (cx: number, cy: number) => {
      if (options.kind === "text") {
        const textWidth = font.widthOfTextAtSize(options.text, options.fontSize);
        page.drawText(options.text, {
          x: cx - textWidth / 2,
          y: cy - options.fontSize / 2,
          size: options.fontSize,
          font,
          color: rgb(options.color.r, options.color.g, options.color.b),
          opacity: options.opacity,
          rotate: degrees(options.rotationDegrees),
        });
      } else if (image) {
        const w = pageW * options.imageScale;
        const h = w * (image.height / image.width);
        page.drawImage(image, {
          x: cx - w / 2,
          y: cy - h / 2,
          width: w,
          height: h,
          opacity: options.opacity,
          rotate: degrees(options.rotationDegrees),
        });
      }
    };

    if (options.position === "tiled") {
      const stepX = pageW / 3;
      const stepY = pageH / 4;
      for (let gx = 0; gx < 3; gx++) {
        for (let gy = 0; gy < 4; gy++) {
          drawOnce(stepX * gx + stepX / 2, stepY * gy + stepY / 2);
        }
      }
    } else {
      const approxW = options.kind === "text" ? font.widthOfTextAtSize(options.text, options.fontSize) : pageW * options.imageScale;
      const approxH = options.kind === "text" ? options.fontSize : approxW * ((image?.height ?? 1) / (image?.width ?? 1));
      const { x, y } = anchorForPosition(options.position, pageW, pageH, approxW, approxH);
      drawOnce(x + approxW / 2, y + approxH / 2);
    }

    if (options.layer === "behind") {
      moveLastContentStreamToFront(page, sizeBefore);
    }
  }

  return doc.save();
}
