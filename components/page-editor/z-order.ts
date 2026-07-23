import type { EditorElementBase } from "./types";

export function bringToFront<T extends EditorElementBase>(elements: T[], id: string): T[] {
  const maxZ = Math.max(0, ...elements.map((e) => e.zIndex));
  return elements.map((e) => (e.id === id ? { ...e, zIndex: maxZ + 1 } : e));
}

export function sendToBack<T extends EditorElementBase>(elements: T[], id: string): T[] {
  const minZ = Math.min(0, ...elements.map((e) => e.zIndex));
  return elements.map((e) => (e.id === id ? { ...e, zIndex: minZ - 1 } : e));
}

export function nextZIndex<T extends EditorElementBase>(elements: T[]): number {
  return elements.length === 0 ? 0 : Math.max(...elements.map((e) => e.zIndex)) + 1;
}
