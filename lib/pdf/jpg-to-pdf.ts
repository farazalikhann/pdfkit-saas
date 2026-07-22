import { PDFDocument } from "@cantoo/pdf-lib";

const A4 = { width: 595.28, height: 841.89 }; // points

export type PageFit = "a4" | "original";

export interface JpgToPdfOptions {
  fit?: PageFit;
  margin?: number; // points, only used for "a4" fit
  onProgress?: (fraction: number) => void;
}

async function embedImage(doc: PDFDocument, file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (/png$/i.test(file.type) || /\.png$/i.test(file.name)) {
    return doc.embedPng(bytes);
  }
  return doc.embedJpg(bytes);
}

/** Combines one or more images into a single PDF, one image per page. */
export async function imagesToPdf(
  files: File[],
  opts: JpgToPdfOptions = {}
): Promise<Uint8Array> {
  const { fit = "a4", margin = 24, onProgress } = opts;
  const doc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const image = await embedImage(doc, files[i]);
    const { width, height } = image;

    if (fit === "original") {
      const page = doc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
    } else {
      const page = doc.addPage([A4.width, A4.height]);
      const maxW = A4.width - margin * 2;
      const maxH = A4.height - margin * 2;
      const scale = Math.min(maxW / width, maxH / height, 1);
      const drawW = width * scale;
      const drawH = height * scale;
      page.drawImage(image, {
        x: (A4.width - drawW) / 2,
        y: (A4.height - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    }
    onProgress?.((i + 1) / files.length);
  }

  return doc.save();
}
