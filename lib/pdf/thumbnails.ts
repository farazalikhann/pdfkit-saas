"use client";

import * as pdfjsLib from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

let workerConfigured = false;

function configureWorker() {
  if (workerConfigured) return;
  // Served as a static asset (see scripts/copy-pdf-worker.mjs) rather than bundled by
  // webpack — bundling this pre-minified ESM worker breaks Next's production Terser pass.
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  workerConfigured = true;
}

export async function loadPdfDocument(
  data: ArrayBuffer | Uint8Array
): Promise<PDFDocumentProxy> {
  configureWorker();
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  const task = pdfjsLib.getDocument({ data: bytes });
  return task.promise;
}

export interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/** Renders a single PDF page to a JPEG/PNG data URL for thumbnails or rasterized export. */
export async function renderPageToDataUrl(
  pdf: PDFDocumentProxy,
  pageNumber: number,
  scale = 0.4,
  mime: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.85
): Promise<RenderedPage> {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(viewport.width));
  canvas.height = Math.max(1, Math.round(viewport.height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D context unavailable");

  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;

  const dataUrl = canvas.toDataURL(mime, quality);
  return {
    pageNumber,
    dataUrl,
    width: canvas.width,
    height: canvas.height,
  };
}

/** Renders thumbnails for every page (capped) of a PDF file for a preview grid. */
export async function renderAllThumbnails(
  file: File,
  opts: { scale?: number; maxPages?: number } = {}
): Promise<RenderedPage[]> {
  const { scale = 0.35, maxPages = 60 } = opts;
  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfDocument(buffer);
  const count = Math.min(pdf.numPages, maxPages);
  const pages: RenderedPage[] = [];
  for (let i = 1; i <= count; i++) {
    pages.push(await renderPageToDataUrl(pdf, i, scale));
  }
  return pages;
}

export async function getPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfDocument(buffer);
  return pdf.numPages;
}
