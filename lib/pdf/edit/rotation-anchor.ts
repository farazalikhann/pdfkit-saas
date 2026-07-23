import type { Rect } from "@/components/page-editor/types";

export interface PdfPlacement {
  x: number;
  y: number;
  rotateDegrees: number;
}

/**
 * Converts an editor element rect (points, y-down/top-left origin, rotation in the
 * screen sense the drag/rotate gesture produces) into the placement pdf-lib needs.
 *
 * Two corrections happen here, both easy to get backwards:
 *  1. Y-flip: PDF space is y-up from the bottom of the page; the editor is y-down
 *     from the top.
 *  2. Rotation direction: the same numeric angle is a clockwise sweep in y-down
 *     screen space but counter-clockwise in y-up PDF space, so the angle must be
 *     negated or the exported rotation spins the opposite way from what was dragged.
 *  3. Rotation pivot: pdf-lib rotates the whole local coordinate system around the
 *     (x, y) point you give it — that point IS the box's pre-rotation corner AND
 *     the pivot simultaneously. The editor rotates each box around its own center
 *     instead (the intuitive UI behavior), so the anchor has to be solved for
 *     rather than reusing the box's raw corner.
 */
export function getPdfPlacement(rect: Rect, pageHeightPt: number): PdfPlacement {
  const bottomLeftX = rect.x;
  const bottomLeftY = pageHeightPt - rect.y - rect.height;
  const pdfRotateDegrees = -rect.rotation;

  const centerX = bottomLeftX + rect.width / 2;
  const centerY = bottomLeftY + rect.height / 2;
  const rad = (pdfRotateDegrees * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const offsetX = (rect.width / 2) * cos - (rect.height / 2) * sin;
  const offsetY = (rect.width / 2) * sin + (rect.height / 2) * cos;

  return { x: centerX - offsetX, y: centerY - offsetY, rotateDegrees: pdfRotateDegrees };
}
