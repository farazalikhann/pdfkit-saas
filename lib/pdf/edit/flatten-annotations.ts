import { rgb, degrees, BlendMode, StandardFonts } from "@cantoo/pdf-lib";
import { loadPdfSafely } from "@/lib/pdf/errors";
import { getPdfPlacement } from "./rotation-anchor";
import type { EditorElementBase } from "@/components/page-editor/types";

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface PathElement extends EditorElementBase {
  kind: "pen" | "highlighter";
  /** Points relative to the element's own top-left corner, in editor (y-down) space. */
  points: { x: number; y: number }[];
  color: RgbColor;
  strokeWidth: number;
  opacity: number;
}

export type ShapeKind = "rectangle" | "circle" | "line" | "arrow";

export interface ShapeElement extends EditorElementBase {
  kind: ShapeKind;
  color: RgbColor;
  strokeWidth: number;
  fillColor: RgbColor | null;
  opacity: number;
}

export interface StickyNoteElement extends EditorElementBase {
  kind: "sticky-note";
  text: string;
  color: RgbColor;
}

export interface TextHighlightElement extends EditorElementBase {
  kind: "text-highlight";
  color: RgbColor;
  opacity: number;
  /** Individual line rects, in absolute page (editor y-down) space — a highlight can span multiple lines. */
  rects: { x: number; y: number; width: number; height: number }[];
}

export type AnnotateElement = PathElement | ShapeElement | StickyNoteElement | TextHighlightElement;

function smoothSvgPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return "";
  if (points.length === 1) {
    const p = points[0];
    return `M ${p.x} ${p.y} L ${p.x + 0.01} ${p.y}`;
  }
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const mid = { x: (points[i].x + points[i + 1].x) / 2, y: (points[i].y + points[i + 1].y) / 2 };
    d += ` Q ${points[i].x} ${points[i].y} ${mid.x} ${mid.y}`;
  }
  const last = points[points.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

function rotateAroundCenter(
  px: number,
  py: number,
  cx: number,
  cy: number,
  angleDeg: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
    y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
  };
}

export async function flattenAnnotations(file: File, elements: AnnotateElement[]): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await loadPdfSafely(bytes);
  const pages = doc.getPages();
  const font = await doc.embedFont(StandardFonts.Helvetica);

  for (const el of elements) {
    const page = pages[el.pageIndex];
    if (!page) continue;
    const { height: pageHeightPt } = page.getSize();

    if (el.kind === "pen" || el.kind === "highlighter") {
      const path = smoothSvgPath(el.points);
      const anchor = { x: el.x, y: pageHeightPt - el.y };
      page.drawSvgPath(path, {
        x: anchor.x,
        y: anchor.y,
        borderColor: rgb(el.color.r, el.color.g, el.color.b),
        borderWidth: el.strokeWidth,
        borderOpacity: el.opacity,
        borderLineCap: 1, // round
        blendMode: el.kind === "highlighter" ? BlendMode.Multiply : BlendMode.Normal,
      });
      continue;
    }

    if (el.kind === "rectangle") {
      const placement = getPdfPlacement(el, pageHeightPt);
      page.drawRectangle({
        x: placement.x,
        y: placement.y,
        width: el.width,
        height: el.height,
        rotate: degrees(placement.rotateDegrees),
        borderColor: rgb(el.color.r, el.color.g, el.color.b),
        borderWidth: el.strokeWidth,
        color: el.fillColor ? rgb(el.fillColor.r, el.fillColor.g, el.fillColor.b) : undefined,
        opacity: el.fillColor ? el.opacity : undefined,
        borderOpacity: el.opacity,
      });
      continue;
    }

    if (el.kind === "circle") {
      const cx = el.x + el.width / 2;
      const cy = pageHeightPt - (el.y + el.height / 2);
      page.drawEllipse({
        x: cx,
        y: cy,
        xScale: el.width / 2,
        yScale: el.height / 2,
        rotate: degrees(-el.rotation),
        borderColor: rgb(el.color.r, el.color.g, el.color.b),
        borderWidth: el.strokeWidth,
        color: el.fillColor ? rgb(el.fillColor.r, el.fillColor.g, el.fillColor.b) : undefined,
        opacity: el.fillColor ? el.opacity : undefined,
        borderOpacity: el.opacity,
      });
      continue;
    }

    if (el.kind === "line" || el.kind === "arrow") {
      const cx = el.x + el.width / 2;
      const cy = pageHeightPt - (el.y + el.height / 2);
      const rawStart = { x: el.x, y: pageHeightPt - el.y };
      const rawEnd = { x: el.x + el.width, y: pageHeightPt - (el.y + el.height) };
      const start = rotateAroundCenter(rawStart.x, rawStart.y, cx, cy, -el.rotation);
      const end = rotateAroundCenter(rawEnd.x, rawEnd.y, cx, cy, -el.rotation);
      const color = rgb(el.color.r, el.color.g, el.color.b);

      page.drawLine({ start, end, thickness: el.strokeWidth, color, opacity: el.opacity });

      if (el.kind === "arrow") {
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLen = Math.max(8, el.strokeWidth * 4);
        const spread = Math.PI / 7;
        const left = {
          x: end.x - headLen * Math.cos(angle - spread),
          y: end.y - headLen * Math.sin(angle - spread),
        };
        const right = {
          x: end.x - headLen * Math.cos(angle + spread),
          y: end.y - headLen * Math.sin(angle + spread),
        };
        page.drawSvgPath(
          `M ${end.x} ${end.y} L ${left.x} ${left.y} L ${right.x} ${right.y} Z`,
          { x: 0, y: 0, color, opacity: el.opacity }
        );
      }
      continue;
    }

    if (el.kind === "sticky-note") {
      const noteSize = Math.min(el.width, el.height);
      const x = el.x;
      const y = pageHeightPt - el.y - noteSize;
      page.drawRectangle({
        x,
        y,
        width: noteSize,
        height: noteSize,
        color: rgb(el.color.r, el.color.g, el.color.b),
        opacity: 0.95,
        borderColor: rgb(0.2, 0.2, 0.2),
        borderWidth: 0.75,
      });
      if (el.text) {
        page.drawText(el.text, {
          x: x + noteSize + 6,
          y: y + noteSize / 2 - 4,
          size: 10,
          font,
          color: rgb(0.15, 0.15, 0.15),
          maxWidth: 220,
          lineHeight: 12,
        });
      }
      continue;
    }

    if (el.kind === "text-highlight") {
      for (const r of el.rects) {
        page.drawRectangle({
          x: r.x,
          y: pageHeightPt - r.y - r.height,
          width: r.width,
          height: r.height,
          color: rgb(el.color.r, el.color.g, el.color.b),
          opacity: el.opacity,
          blendMode: BlendMode.Multiply,
        });
      }
    }
  }

  return doc.save();
}
