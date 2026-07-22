import { PDFDocument, StandardFonts, rgb, degrees } from "@cantoo/pdf-lib";

export interface WatermarkOptions {
  text: string;
  opacity: number; // 0-1
  fontSize: number;
  rotationDegrees: number; // e.g. -45 for diagonal
  color: { r: number; g: number; b: number }; // 0-1 each
}

export const WATERMARK_DEFAULTS: WatermarkOptions = {
  text: "CONFIDENTIAL",
  opacity: 0.25,
  fontSize: 48,
  rotationDegrees: -45,
  color: { r: 0.6, g: 0.05, b: 0.05 },
};

export async function addWatermark(
  file: File,
  options: Partial<WatermarkOptions> = {}
): Promise<Uint8Array> {
  const opts = { ...WATERMARK_DEFAULTS, ...options };
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const textWidth = font.widthOfTextAtSize(opts.text, opts.fontSize);
    page.drawText(opts.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size: opts.fontSize,
      font,
      color: rgb(opts.color.r, opts.color.g, opts.color.b),
      opacity: opts.opacity,
      rotate: degrees(opts.rotationDegrees),
    });
  }

  return doc.save();
}
