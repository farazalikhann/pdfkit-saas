import { PDFDocument, degrees } from "@cantoo/pdf-lib";

export interface PageRotation {
  /** 0-indexed page number */
  pageIndex: number;
  /** Degrees to add to the page's current rotation (e.g. 90, -90, 180) */
  deltaDegrees: number;
}

/** Applies a relative rotation to specific pages and returns the new PDF bytes. */
export async function rotatePages(
  file: File,
  rotations: PageRotation[]
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const byIndex = new Map(rotations.map((r) => [r.pageIndex, r.deltaDegrees]));

  doc.getPages().forEach((page, index) => {
    const delta = byIndex.get(index);
    if (!delta) return;
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + delta + 360) % 360));
  });

  return doc.save();
}

/** Rotates every page in the document by the same delta. */
export async function rotateAllPages(
  file: File,
  deltaDegrees: number
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  doc.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + deltaDegrees + 360) % 360));
  });
  return doc.save();
}
