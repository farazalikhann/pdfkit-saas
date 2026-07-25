export interface CropRect {
  /** All fields are 0-1 fractions of the (already-rotated) image's width/height. */
  x: number;
  y: number;
  width: number;
  height: number;
}

/** "Document filter" presets applied to scanned/photographed pages. */
export type DocumentFilter = "original" | "grayscale" | "bw" | "enhance";

export const DOCUMENT_FILTER_CSS: Record<DocumentFilter, string> = {
  original: "none",
  grayscale: "grayscale(1) contrast(1.1)",
  bw: "grayscale(1) contrast(2.4) brightness(1.15)",
  enhance: "contrast(1.25) brightness(1.08) saturate(1.05)",
};

async function loadBitmap(file: File): Promise<ImageBitmap> {
  return createImageBitmap(file);
}

/**
 * Applies a 90-degree-step rotation, a crop, and/or a document filter to an
 * image file, returning a new File with the same name and a matching mime
 * type. Crop coordinates are fractions (0-1) of the image AFTER rotation is
 * applied, matching what the user sees in the crop UI regardless of the
 * original photo's orientation.
 */
export async function applyImageTransform(
  file: File,
  opts: {
    rotationDeg?: 0 | 90 | 180 | 270;
    crop?: CropRect | null;
    filter?: DocumentFilter;
  }
): Promise<File> {
  const rotationDeg = opts.rotationDeg ?? 0;
  const crop = opts.crop ?? null;
  const filter = opts.filter ?? "original";
  if (rotationDeg === 0 && !crop && filter === "original") return file;

  const bitmap = await loadBitmap(file);
  const swapDims = rotationDeg === 90 || rotationDeg === 270;
  const rotatedWidth = swapDims ? bitmap.height : bitmap.width;
  const rotatedHeight = swapDims ? bitmap.width : bitmap.height;

  // Rotate onto an intermediate canvas first, sized to the rotated image.
  const rotatedCanvas = new OffscreenCanvas(rotatedWidth, rotatedHeight);
  const rctx = rotatedCanvas.getContext("2d");
  if (!rctx) throw new Error("Canvas 2D context unavailable");
  rctx.translate(rotatedWidth / 2, rotatedHeight / 2);
  rctx.rotate((rotationDeg * Math.PI) / 180);
  rctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  bitmap.close();

  let outputCanvas: OffscreenCanvas = rotatedCanvas;
  if (crop) {
    const cropX = Math.round(crop.x * rotatedWidth);
    const cropY = Math.round(crop.y * rotatedHeight);
    const cropW = Math.max(1, Math.round(crop.width * rotatedWidth));
    const cropH = Math.max(1, Math.round(crop.height * rotatedHeight));
    const croppedCanvas = new OffscreenCanvas(cropW, cropH);
    const cctx = croppedCanvas.getContext("2d");
    if (!cctx) throw new Error("Canvas 2D context unavailable");
    cctx.drawImage(rotatedCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    outputCanvas = croppedCanvas;
  }

  if (filter !== "original") {
    const filteredCanvas = new OffscreenCanvas(outputCanvas.width, outputCanvas.height);
    const fctx = filteredCanvas.getContext("2d");
    if (!fctx) throw new Error("Canvas 2D context unavailable");
    fctx.filter = DOCUMENT_FILTER_CSS[filter];
    fctx.drawImage(outputCanvas, 0, 0);
    outputCanvas = filteredCanvas;
  }

  const isPng = /png$/i.test(file.type) || /\.png$/i.test(file.name);
  const mimeType = isPng ? "image/png" : "image/jpeg";
  const blob = await outputCanvas.convertToBlob({ type: mimeType, quality: 0.92 });
  return new File([blob], file.name, { type: mimeType });
}
