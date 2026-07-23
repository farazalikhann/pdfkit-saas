import { PDFDocument } from "@cantoo/pdf-lib";
import { loadPdfDocument } from "@/lib/pdf/thumbnails";
import { loadPdfSafely } from "@/lib/pdf/errors";
import { copyMetadata } from "@/lib/pdf/copy-metadata";
import type { EditorElementBase } from "@/components/page-editor/types";

export interface RedactBoxElement extends EditorElementBase {
  kind: "redact";
}

// Rendered at 2x (144 DPI) before burning in the black boxes — sharp enough to stay
// legible for anything that wasn't redacted, without the file size exploding.
const REDACT_RENDER_SCALE = 2;

async function renderPageWithRedactions(
  pdfDoc: Awaited<ReturnType<typeof loadPdfDocument>>,
  pageNumber: number,
  boxes: RedactBoxElement[]
): Promise<{ dataUrl: string; widthPt: number; heightPt: number }> {
  const page = await pdfDoc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: REDACT_RENDER_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;

  ctx.fillStyle = "#000000";
  for (const box of boxes) {
    ctx.fillRect(
      box.x * REDACT_RENDER_SCALE,
      box.y * REDACT_RENDER_SCALE,
      box.width * REDACT_RENDER_SCALE,
      box.height * REDACT_RENDER_SCALE
    );
  }

  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.85),
    widthPt: baseViewport.width,
    heightPt: baseViewport.height,
  };
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

/**
 * Burns black boxes into rasterized copies of any page that has redactions, so the
 * underlying text/vector content is genuinely gone — not just hidden behind a shape a
 * viewer could delete or select-through. Pages with no redaction boxes are copied over
 * unmodified (kept as real vector/text pages).
 */
export async function redactPdf(
  file: File,
  boxes: RedactBoxElement[],
  onProgress?: (fraction: number) => void
): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  const pdfjsDoc = await loadPdfDocument(buffer.slice(0));
  const srcDoc = await loadPdfSafely(buffer.slice(0));
  const outDoc = await PDFDocument.create();

  const boxesByPage = new Map<number, RedactBoxElement[]>();
  for (const box of boxes) {
    const list = boxesByPage.get(box.pageIndex) ?? [];
    list.push(box);
    boxesByPage.set(box.pageIndex, list);
  }

  const pageCount = srcDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const pageBoxes = boxesByPage.get(i);
    if (pageBoxes && pageBoxes.length > 0) {
      const { dataUrl, widthPt, heightPt } = await renderPageWithRedactions(pdfjsDoc, i + 1, pageBoxes);
      const imgBytes = await dataUrlToBytes(dataUrl);
      const image = await outDoc.embedJpg(imgBytes);
      const newPage = outDoc.addPage([widthPt, heightPt]);
      newPage.drawImage(image, { x: 0, y: 0, width: widthPt, height: heightPt });
    } else {
      const [copied] = await outDoc.copyPages(srcDoc, [i]);
      outDoc.addPage(copied);
    }
    onProgress?.((i + 1) / pageCount);
  }

  copyMetadata(srcDoc, outDoc);
  return outDoc.save();
}
