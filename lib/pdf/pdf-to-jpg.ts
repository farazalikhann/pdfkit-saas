import JSZip from "jszip";
import { loadPdfDocument, renderPageToDataUrl } from "./thumbnails";

export type ImageFormat = "jpeg" | "png";

export interface PdfToJpgOptions {
  scale?: number; // render resolution multiplier
  quality?: number; // JPEG quality 0-1, ignored for PNG
  format?: ImageFormat;
  onProgress?: (fraction: number) => void;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Converts every page of a PDF into a JPG and returns them zipped into one blob. */
export async function pdfToJpgZip(
  file: File,
  opts: PdfToJpgOptions = {}
): Promise<{ name: string; blob: Blob; pageCount: number }> {
  const { scale = 2, quality = 0.9, format = "jpeg", onProgress } = opts;
  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfDocument(buffer);
  const baseName = file.name.replace(/\.pdf$/i, "");
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const ext = format === "png" ? "png" : "jpg";

  const zip = new JSZip();
  for (let i = 1; i <= pdf.numPages; i++) {
    const rendered = await renderPageToDataUrl(pdf, i, scale, mime, quality);
    zip.file(`${baseName}-page-${i}.${ext}`, dataUrlToBlob(rendered.dataUrl));
    onProgress?.(i / pdf.numPages);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  return { name: `${baseName}-${ext}.zip`, blob, pageCount: pdf.numPages };
}
