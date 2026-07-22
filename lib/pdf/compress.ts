import { PDFDocument } from "@cantoo/pdf-lib";
import { loadPdfDocument, renderPageToDataUrl } from "./thumbnails";

export type CompressionLevel = "low" | "recommended" | "extreme";

const PRESETS: Record<CompressionLevel, { scale: number; quality: number }> = {
  low: { scale: 2, quality: 0.92 },
  recommended: { scale: 1.5, quality: 0.78 },
  extreme: { scale: 1, quality: 0.5 },
};

export interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/**
 * Rasterizes every page at a preset resolution/quality and rebuilds a new PDF
 * from the resulting JPEGs. This trades text-selectability for a real,
 * predictable size reduction — ideal for scanned or image-heavy documents.
 */
export async function compressPdf(
  file: File,
  level: CompressionLevel,
  onProgress?: (fraction: number) => void
): Promise<CompressResult> {
  const originalSize = file.size;
  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfDocument(buffer);
  const preset = PRESETS[level];

  const out = await PDFDocument.create();
  for (let i = 1; i <= pdf.numPages; i++) {
    const rendered = await renderPageToDataUrl(
      pdf,
      i,
      preset.scale,
      "image/jpeg",
      preset.quality
    );
    const jpgBytes = dataUrlToBytes(rendered.dataUrl);
    const image = await out.embedJpg(jpgBytes);
    const page = out.addPage([rendered.width, rendered.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: rendered.width,
      height: rendered.height,
    });
    onProgress?.(i / pdf.numPages);
  }

  const bytes = await out.save();
  return { bytes, originalSize, compressedSize: bytes.byteLength };
}
