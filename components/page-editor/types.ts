/** All coordinates/sizes are in PDF points, top-left origin (y grows downward —
 *  flipped to PDF's bottom-left/y-up space only at export time). */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees
}

export interface EditorElementBase extends Rect {
  id: string;
  pageIndex: number; // 0-indexed
  zIndex: number;
}
