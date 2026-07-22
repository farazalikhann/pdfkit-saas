import {
  PDFDocument,
  pushGraphicsState,
  popGraphicsState,
  rectangle,
  clip,
  endPath,
} from "@cantoo/pdf-lib";

const PAGE_SIZES_PT: Record<"a4" | "letter", { w: number; h: number }> = {
  a4: { w: 595.28, h: 841.89 },
  letter: { w: 612, h: 792 },
};

export type PageSizeOption = "a4" | "letter" | "match-image";
export type Orientation = "auto" | "portrait" | "landscape";
export type FitMode = "contain" | "cover" | "stretch";

export interface JpgToPdfOptions {
  pageSize?: PageSizeOption;
  orientation?: Orientation;
  /** Page margin in points. Ignored for "match-image" page size. */
  marginPt?: number;
  fitMode?: FitMode;
  onProgress?: (fraction: number) => void;
}

async function embedImage(doc: PDFDocument, file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (/png$/i.test(file.type) || /\.png$/i.test(file.name)) {
    return doc.embedPng(bytes);
  }
  return doc.embedJpg(bytes);
}

function resolvePageSize(
  pageSize: Exclude<PageSizeOption, "match-image">,
  orientation: Orientation,
  imageIsLandscape: boolean
): { w: number; h: number } {
  const base = PAGE_SIZES_PT[pageSize];
  const wantsLandscape =
    orientation === "landscape" || (orientation === "auto" && imageIsLandscape);
  return wantsLandscape ? { w: base.h, h: base.w } : { w: base.w, h: base.h };
}

/** Combines one or more images into a single PDF, one image per page. */
export async function imagesToPdf(
  files: File[],
  opts: JpgToPdfOptions = {}
): Promise<Uint8Array> {
  const {
    pageSize = "a4",
    orientation = "auto",
    marginPt = 24,
    fitMode = "contain",
    onProgress,
  } = opts;
  const doc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const image = await embedImage(doc, files[i]);
    const { width, height } = image;

    if (pageSize === "match-image") {
      const page = doc.addPage([width, height]);
      page.drawImage(image, { x: 0, y: 0, width, height });
      onProgress?.((i + 1) / files.length);
      continue;
    }

    const { w: pageW, h: pageH } = resolvePageSize(
      pageSize,
      orientation,
      width > height
    );
    const page = doc.addPage([pageW, pageH]);

    const boxX = marginPt;
    const boxY = marginPt;
    const boxW = pageW - marginPt * 2;
    const boxH = pageH - marginPt * 2;

    if (fitMode === "stretch") {
      page.drawImage(image, { x: boxX, y: boxY, width: boxW, height: boxH });
    } else if (fitMode === "cover") {
      const scale = Math.max(boxW / width, boxH / height);
      const drawW = width * scale;
      const drawH = height * scale;
      const x = boxX + (boxW - drawW) / 2;
      const y = boxY + (boxH - drawH) / 2;

      page.pushOperators(
        pushGraphicsState(),
        rectangle(boxX, boxY, boxW, boxH),
        clip(),
        endPath()
      );
      page.drawImage(image, { x, y, width: drawW, height: drawH });
      page.pushOperators(popGraphicsState());
    } else {
      const scale = Math.min(boxW / width, boxH / height, 1);
      const drawW = width * scale;
      const drawH = height * scale;
      page.drawImage(image, {
        x: boxX + (boxW - drawW) / 2,
        y: boxY + (boxH - drawH) / 2,
        width: drawW,
        height: drawH,
      });
    }

    onProgress?.((i + 1) / files.length);
  }

  return doc.save();
}
