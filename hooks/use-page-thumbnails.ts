"use client";

import * as React from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { loadPdfDocument, renderPageToDataUrl } from "@/lib/pdf/thumbnails";
import { toFriendlyPdfLoadError } from "@/lib/pdf/errors";

const MAX_CONCURRENT_RENDERS = 3;
const THUMB_SCALE = 0.32;

export interface UsePageThumbnailsResult {
  pageCount: number;
  isLoading: boolean;
  error: string | null;
  getThumbnail: (pageNumber: number) => string | undefined;
  /** Enqueues a page for rendering if it isn't already cached/queued. Cheap to call repeatedly. */
  requestThumbnail: (pageNumber: number) => void;
  renderedCount: number;
}

/**
 * Lazily renders PDF page thumbnails via pdf.js, one small batch at a time,
 * so a 200+ page document doesn't block the main thread rendering pages no
 * one has scrolled to yet. Callers (grid cells) request a thumbnail once
 * they're near the viewport; this hook queues and caps concurrency.
 */
export function usePageThumbnails(file: File | null): UsePageThumbnailsResult {
  const [pageCount, setPageCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [thumbnails, setThumbnails] = React.useState<Map<number, string>>(new Map());
  const [renderedCount, setRenderedCount] = React.useState(0);

  const docRef = React.useRef<PDFDocumentProxy | null>(null);
  const cacheRef = React.useRef<Map<number, string>>(new Map());
  const queuedRef = React.useRef<Set<number>>(new Set());
  const renderingRef = React.useRef<Set<number>>(new Set());
  const renderedCountRef = React.useRef(0);

  React.useEffect(() => {
    docRef.current = null;
    cacheRef.current = new Map();
    queuedRef.current = new Set();
    renderingRef.current = new Set();
    renderedCountRef.current = 0;
    setRenderedCount(0);
    setThumbnails(new Map());
    setPageCount(0);
    setError(null);

    if (!file) return;

    let cancelled = false;
    setIsLoading(true);
    (async () => {
      try {
        const buffer = await file.arrayBuffer();
        const doc = await loadPdfDocument(buffer);
        if (cancelled) return;
        docRef.current = doc;
        setPageCount(doc.numPages);
      } catch (err) {
        if (!cancelled) setError(toFriendlyPdfLoadError(err));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [file]);

  const pump = React.useCallback(() => {
    const doc = docRef.current;
    if (!doc) return;

    while (renderingRef.current.size < MAX_CONCURRENT_RENDERS && queuedRef.current.size > 0) {
      const next = queuedRef.current.values().next().value as number;
      queuedRef.current.delete(next);
      renderingRef.current.add(next);

      renderPageToDataUrl(doc, next, THUMB_SCALE, "image/jpeg", 0.75)
        .then((rendered) => {
          cacheRef.current.set(next, rendered.dataUrl);
          setThumbnails(new Map(cacheRef.current));
          renderedCountRef.current += 1;
          setRenderedCount(renderedCountRef.current);
        })
        .catch(() => {
          // Leave this page uncached — its cell falls back to a placeholder icon
          // instead of retrying forever or crashing the whole grid.
        })
        .finally(() => {
          renderingRef.current.delete(next);
          pump();
        });
    }
  }, []);

  const requestThumbnail = React.useCallback(
    (pageNumber: number) => {
      if (
        cacheRef.current.has(pageNumber) ||
        queuedRef.current.has(pageNumber) ||
        renderingRef.current.has(pageNumber)
      ) {
        return;
      }
      queuedRef.current.add(pageNumber);
      pump();
    },
    [pump]
  );

  const getThumbnail = React.useCallback(
    (pageNumber: number) => thumbnails.get(pageNumber),
    [thumbnails]
  );

  return { pageCount, isLoading, error, getThumbnail, requestThumbnail, renderedCount };
}
