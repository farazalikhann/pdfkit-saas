import { StandardFonts, rgb, degrees, type PDFFont } from "@cantoo/pdf-lib";
import { loadPdfSafely } from "@/lib/pdf/errors";
import { getPdfPlacement } from "./rotation-anchor";
import type { EditorElementBase } from "@/components/page-editor/types";

export type FontFamily = "Helvetica" | "TimesRoman" | "Courier";

export interface TextBoxElement extends EditorElementBase {
  kind: "text";
  text: string;
  fontFamily: FontFamily;
  fontSize: number;
  color: { r: number; g: number; b: number };
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: "left" | "center" | "right";
  opacity: number;
}

export interface ImageBoxElement extends EditorElementBase {
  kind: "image";
  dataUrl: string;
  mimeType: "image/png" | "image/jpeg";
  keepAspectRatio: boolean;
}

export type AddElement = TextBoxElement | ImageBoxElement;

function standardFontFor(family: FontFamily, bold: boolean, italic: boolean): StandardFonts {
  const table: Record<FontFamily, Record<string, StandardFonts>> = {
    Helvetica: {
      "0-0": StandardFonts.Helvetica,
      "1-0": StandardFonts.HelveticaBold,
      "0-1": StandardFonts.HelveticaOblique,
      "1-1": StandardFonts.HelveticaBoldOblique,
    },
    TimesRoman: {
      "0-0": StandardFonts.TimesRoman,
      "1-0": StandardFonts.TimesRomanBold,
      "0-1": StandardFonts.TimesRomanItalic,
      "1-1": StandardFonts.TimesRomanBoldItalic,
    },
    Courier: {
      "0-0": StandardFonts.Courier,
      "1-0": StandardFonts.CourierBold,
      "0-1": StandardFonts.CourierOblique,
      "1-1": StandardFonts.CourierBoldOblique,
    },
  };
  return table[family][`${bold ? 1 : 0}-${italic ? 1 : 0}`];
}

function rotateVec(x: number, y: number, angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: x * Math.cos(rad) - y * Math.sin(rad), y: x * Math.sin(rad) + y * Math.cos(rad) };
}

async function dataUrlToBytes(dataUrl: string): Promise<Uint8Array> {
  const res = await fetch(dataUrl);
  return new Uint8Array(await res.arrayBuffer());
}

const LINE_HEIGHT_MULT = 1.25;

export async function flattenTextImage(file: File, elements: AddElement[]): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await loadPdfSafely(bytes);
  const pages = doc.getPages();
  const fontCache = new Map<string, PDFFont>();

  async function getFont(family: FontFamily, bold: boolean, italic: boolean): Promise<PDFFont> {
    const key = `${family}-${bold}-${italic}`;
    const cached = fontCache.get(key);
    if (cached) return cached;
    const font = await doc.embedFont(standardFontFor(family, bold, italic));
    fontCache.set(key, font);
    return font;
  }

  for (const el of elements) {
    const page = pages[el.pageIndex];
    if (!page) continue;
    const { height: pageHeightPt } = page.getSize();
    const placement = getPdfPlacement(el, pageHeightPt);

    if (el.kind === "image") {
      const imgBytes = await dataUrlToBytes(el.dataUrl);
      const image = el.mimeType === "image/png" ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
      page.drawImage(image, {
        x: placement.x,
        y: placement.y,
        width: el.width,
        height: el.height,
        rotate: degrees(placement.rotateDegrees),
      });
      continue;
    }

    const font = await getFont(el.fontFamily, el.bold, el.italic);
    const color = rgb(el.color.r, el.color.g, el.color.b);
    const lineHeight = el.fontSize * LINE_HEIGHT_MULT;
    const lines = el.text.split("\n");

    lines.forEach((line, i) => {
      const lineWidth = font.widthOfTextAtSize(line, el.fontSize);
      const localX = el.align === "center" ? (el.width - lineWidth) / 2 : el.align === "right" ? el.width - lineWidth : 0;
      const localY = el.height - (i + 1) * lineHeight + (lineHeight - el.fontSize) * 0.5;
      const offset = rotateVec(localX, localY, placement.rotateDegrees);
      const drawX = placement.x + offset.x;
      const drawY = placement.y + offset.y;

      page.drawText(line, {
        x: drawX,
        y: drawY,
        size: el.fontSize,
        font,
        color,
        opacity: el.opacity,
        rotate: degrees(placement.rotateDegrees),
      });

      if (el.underline && line.length > 0) {
        const underlineOffsetY = -el.fontSize * 0.12;
        const start = rotateVec(localX, localY + underlineOffsetY, placement.rotateDegrees);
        const end = rotateVec(localX + lineWidth, localY + underlineOffsetY, placement.rotateDegrees);
        page.drawLine({
          start: { x: placement.x + start.x, y: placement.y + start.y },
          end: { x: placement.x + end.x, y: placement.y + end.y },
          thickness: Math.max(0.75, el.fontSize * 0.05),
          color,
          opacity: el.opacity,
        });
      }
    });
  }

  return doc.save();
}
