"use client";

import * as React from "react";

const MAX_HISTORY = 50;

/** Generic snapshot-based undo/redo for a caller-owned array of editor elements. */
export function useElementHistory<T>(initial: T[] = []) {
  const [elements, setElementsState] = React.useState<T[]>(initial);
  const undoStack = React.useRef<T[][]>([]);
  const redoStack = React.useRef<T[][]>([]);
  const [, forceRender] = React.useReducer((c) => c + 1, 0);

  function setElements(updater: T[] | ((prev: T[]) => T[]), opts: { pushHistory?: boolean } = {}) {
    const pushHistory = opts.pushHistory ?? true;
    setElementsState((prev) => {
      const next = typeof updater === "function" ? (updater as (p: T[]) => T[])(prev) : updater;
      if (pushHistory) {
        undoStack.current.push(prev);
        if (undoStack.current.length > MAX_HISTORY) undoStack.current.shift();
        redoStack.current = [];
      }
      return next;
    });
    forceRender();
  }

  function undo() {
    const prev = undoStack.current.pop();
    if (!prev) return;
    setElementsState((current) => {
      redoStack.current.push(current);
      return prev;
    });
    forceRender();
  }

  function redo() {
    const next = redoStack.current.pop();
    if (!next) return;
    setElementsState((current) => {
      undoStack.current.push(current);
      return next;
    });
    forceRender();
  }

  function reset(next: T[]) {
    setElementsState(next);
    undoStack.current = [];
    redoStack.current = [];
    forceRender();
  }

  return {
    elements,
    setElements,
    undo,
    redo,
    reset,
    canUndo: undoStack.current.length > 0,
    canRedo: redoStack.current.length > 0,
  };
}
