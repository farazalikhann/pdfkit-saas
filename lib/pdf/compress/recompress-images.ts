import {
  PDFDocument,
  PDFName,
  PDFDict,
  PDFRawStream,
  PDFArray,
  PDFNumber,
  PDFRef,
  decodePDFRawStream,
} from "@cantoo/pdf-lib";
import type { CompressSettings } from "./presets";

export interface RecompressResult {
  bytes: Uint8Array;
  imagesProcessed: number;
  imagesSkipped: number;
}

interface ImageCandidate {
  ref: PDFRef;
  dict: PDFDict;
  stream: PDFRawStream;
  /** Largest page (in points) that draws this image, used as a downsample target. */
  maxPageWidthPt: number;
  maxPageHeightPt: number;
}

function filterNames(dict: PDFDict): string[] {
  const filter = dict.lookup(PDFName.of("Filter"));
  if (filter instanceof PDFName) return [filter.decodeText()];
  if (filter instanceof PDFArray) {
    const names: string[] = [];
    for (let i = 0; i < filter.size(); i++) {
      const f = filter.lookup(i, PDFName);
      if (f) names.push(f.decodeText());
    }
    return names;
  }
  return [];
}

function numberField(dict: PDFDict, key: string): number | undefined {
  const val = dict.lookup(PDFName.of(key));
  return val instanceof PDFNumber ? val.asNumber() : undefined;
}

/** Walks a Resources dict's /XObject entries, recursing into nested Form XObjects (depth-capped). */
function collectImageRefs(
  doc: PDFDocument,
  resources: PDFDict | undefined,
  pageWidthPt: number,
  pageHeightPt: number,
  found: Map<string, ImageCandidate>,
  depth = 0
): void {
  if (!resources || depth > 4) return;
  const xObjectDict = resources.lookup(PDFName.of("XObject"));
  if (!(xObjectDict instanceof PDFDict)) return;

  for (const [, value] of xObjectDict.entries()) {
    const ref = value instanceof PDFRef ? value : undefined;
    const obj = doc.context.lookup(value);
    if (!(obj instanceof PDFRawStream)) continue;
    const subtype = obj.dict.lookup(PDFName.of("Subtype"));
    const subtypeName = subtype instanceof PDFName ? subtype.decodeText() : undefined;

    if (subtypeName === "Image" && ref) {
      const key = ref.toString();
      const existing = found.get(key);
      if (existing) {
        existing.maxPageWidthPt = Math.max(existing.maxPageWidthPt, pageWidthPt);
        existing.maxPageHeightPt = Math.max(existing.maxPageHeightPt, pageHeightPt);
      } else {
        found.set(key, {
          ref,
          dict: obj.dict,
          stream: obj,
          maxPageWidthPt: pageWidthPt,
          maxPageHeightPt: pageHeightPt,
        });
      }
    } else if (subtypeName === "Form") {
      const formResources = obj.dict.lookup(PDFName.of("Resources"));
      collectImageRefs(
        doc,
        formResources instanceof PDFDict ? formResources : undefined,
        pageWidthPt,
        pageHeightPt,
        found,
        depth + 1
      );
    }
  }
}

async function decodeToImageBitmap(candidate: ImageCandidate): Promise<ImageBitmap | null> {
  const { dict, stream } = candidate;
  const filters = filterNames(dict);
  const lastFilter = filters[filters.length - 1];

  // Already-JPEG streams are literal JPEG file bytes — decode directly, no PDF-level decoding needed.
  if (lastFilter === "DCTDecode" && filters.length === 1) {
    const blob = new Blob([stream.getContents().slice()], { type: "image/jpeg" });
    return createImageBitmap(blob);
  }

  // JPEG2000 and CCITT fax are specialist image codecs this pipeline doesn't decode —
  // leave these objects untouched rather than risk corrupting them.
  if (filters.some((f) => f === "JPXDecode" || f === "CCITTFaxDecode" || f === "DCTDecode")) {
    return null;
  }

  const width = numberField(dict, "Width");
  const height = numberField(dict, "Height");
  const bpc = numberField(dict, "BitsPerComponent") ?? 8;
  if (!width || !height || bpc !== 8) return null;

  // Soft-masked (transparent) images would lose their alpha channel if round-tripped
  // through JPEG — leave them alone rather than silently drop transparency.
  if (dict.lookup(PDFName.of("SMask")) || dict.lookup(PDFName.of("Mask"))) return null;

  const colorSpace = dict.lookup(PDFName.of("ColorSpace"));
  const colorSpaceName = colorSpace instanceof PDFName ? colorSpace.decodeText() : undefined;
  if (colorSpaceName !== "DeviceRGB" && colorSpaceName !== "DeviceGray") return null; // skip CMYK/indexed — edge case

  let raw: Uint8Array;
  try {
    raw = decodePDFRawStream(stream).decode();
  } catch {
    return null;
  }

  const channels = colorSpaceName === "DeviceGray" ? 1 : 3;
  const expectedBytes = width * height * channels;
  if (raw.length < expectedBytes) return null;

  const rgba = new Uint8ClampedArray(width * height * 4);
  for (let px = 0; px < width * height; px++) {
    if (channels === 1) {
      const v = raw[px];
      rgba[px * 4] = v;
      rgba[px * 4 + 1] = v;
      rgba[px * 4 + 2] = v;
    } else {
      rgba[px * 4] = raw[px * 3];
      rgba[px * 4 + 1] = raw[px * 3 + 1];
      rgba[px * 4 + 2] = raw[px * 3 + 2];
    }
    rgba[px * 4 + 3] = 255;
  }
  const imageData = new ImageData(rgba, width, height);
  return createImageBitmap(imageData);
}

function computeTargetSize(
  bitmap: ImageBitmap,
  candidate: ImageCandidate,
  dpi: number
): { width: number; height: number } {
  const targetW = Math.max(1, Math.round((candidate.maxPageWidthPt / 72) * dpi));
  const targetH = Math.max(1, Math.round((candidate.maxPageHeightPt / 72) * dpi));
  // Never upscale — only downsample when the source genuinely exceeds the target.
  if (bitmap.width <= targetW && bitmap.height <= targetH) {
    return { width: bitmap.width, height: bitmap.height };
  }
  const scale = Math.min(targetW / bitmap.width, targetH / bitmap.height);
  return {
    width: Math.max(1, Math.round(bitmap.width * scale)),
    height: Math.max(1, Math.round(bitmap.height * scale)),
  };
}

async function reencodeJpeg(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  quality: number
): Promise<Uint8Array> {
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable in this environment.");
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  return new Uint8Array(await blob.arrayBuffer());
}

/**
 * Recompresses embedded raster images in place (extract -> decode -> downsample ->
 * re-encode as JPEG -> write back into the same XObject), leaving page content
 * streams — and therefore any real vector text — completely untouched. Images use
 * an unsupported codec (JPEG2000/CCITT fax/CMYK/indexed) or carry a soft mask are
 * left alone rather than risk corrupting them.
 */
export async function recompressPdfImages(
  fileBytes: ArrayBuffer,
  settings: CompressSettings,
  opts: { stripMetadata?: boolean; onProgress?: (fraction: number) => void } = {}
): Promise<RecompressResult> {
  const doc = await PDFDocument.load(fileBytes, { updateMetadata: false });
  opts.onProgress?.(0.05);

  const candidates = new Map<string, ImageCandidate>();
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const resources = page.node.Resources();
    collectImageRefs(doc, resources, width, height, candidates);
    page.node.delete(PDFName.of("Thumb"));
  }

  const list = Array.from(candidates.values());
  let processed = 0;
  let skipped = 0;

  for (let i = 0; i < list.length; i++) {
    const candidate = list[i];
    try {
      const bitmap = await decodeToImageBitmap(candidate);
      if (!bitmap) {
        skipped++;
        continue;
      }
      const { width: targetW, height: targetH } = computeTargetSize(bitmap, candidate, settings.dpi);
      const jpegBytes = await reencodeJpeg(bitmap, targetW, targetH, settings.quality);
      bitmap.close();

      // Only keep the recompressed version if it's actually smaller than the source stream.
      if (jpegBytes.byteLength < candidate.stream.getContentsSize()) {
        candidate.dict.set(PDFName.of("Width"), PDFNumber.of(targetW));
        candidate.dict.set(PDFName.of("Height"), PDFNumber.of(targetH));
        candidate.dict.set(PDFName.of("Filter"), PDFName.of("DCTDecode"));
        candidate.dict.set(PDFName.of("ColorSpace"), PDFName.of("DeviceRGB"));
        candidate.dict.set(PDFName.of("BitsPerComponent"), PDFNumber.of(8));
        candidate.dict.delete(PDFName.of("DecodeParms"));
        candidate.dict.delete(PDFName.of("Decode"));
        candidate.stream.updateContents(jpegBytes);
        processed++;
      } else {
        skipped++;
      }
    } catch {
      skipped++;
    }
    opts.onProgress?.(0.05 + 0.85 * ((i + 1) / Math.max(1, list.length)));
  }

  if (opts.stripMetadata) {
    doc.setTitle("");
    doc.setAuthor("");
    doc.setSubject("");
    doc.setKeywords([]);
    doc.setCreator("");
    doc.setProducer("");
  }

  const bytes = await doc.save();
  opts.onProgress?.(1);
  return { bytes, imagesProcessed: processed, imagesSkipped: skipped };
}
