"use client";

import { loadPdfDocument } from "./thumbnails";

export interface ExtractedText {
  text: string;
  pageCount: number;
}

export interface ExtractTextLimits {
  maxPages: number;
  maxCharacters: number;
}

export class ExtractTextLimitError extends Error {
  constructor(
    message: string,
    public readonly pageCount: number
  ) {
    super(message);
    this.name = "ExtractTextLimitError";
  }
}

/**
 * Extracts plain text from every page of a PDF, entirely in the browser.
 * Throws ExtractTextLimitError if the document exceeds the given page/char
 * caps — callers should surface that message and stop, not truncate silently.
 */
export async function extractPdfText(
  file: File,
  limits: ExtractTextLimits,
  onProgress?: (fraction: number) => void
): Promise<ExtractedText> {
  const buffer = await file.arrayBuffer();
  const pdf = await loadPdfDocument(buffer);
  const pageCount = pdf.numPages;

  if (pageCount > limits.maxPages) {
    throw new ExtractTextLimitError(
      `This PDF has ${pageCount} pages — Summarize supports up to ${limits.maxPages}.`,
      pageCount
    );
  }

  const pageTexts: string[] = [];
  let totalLength = 0;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    totalLength += pageText.length;

    if (totalLength > limits.maxCharacters) {
      throw new ExtractTextLimitError(
        `This document has more than ${limits.maxCharacters.toLocaleString()} characters of text — too long for Summarize.`,
        pageCount
      );
    }

    pageTexts.push(pageText);
    onProgress?.(i / pageCount);
  }

  return { text: pageTexts.join("\n\n"), pageCount };
}
