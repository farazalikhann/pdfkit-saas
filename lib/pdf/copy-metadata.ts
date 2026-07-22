import type { PDFDocument } from "@cantoo/pdf-lib";

/**
 * Carries document-level metadata (title/author/subject/etc.) from a source
 * PDF to a freshly-built one. `copyPages` only copies page content/resources
 * (including each page's own rotation/annotations/links, since those live on
 * the page object) — the document Info dictionary has to be copied separately.
 */
export function copyMetadata(src: PDFDocument, dest: PDFDocument): void {
  if (src.getAuthor() !== undefined) dest.setAuthor(src.getAuthor()!);
  if (src.getCreationDate() !== undefined) dest.setCreationDate(src.getCreationDate()!);
  if (src.getCreator() !== undefined) dest.setCreator(src.getCreator()!);
  if (src.getLanguage() !== undefined) dest.setLanguage(src.getLanguage()!);
  if (src.getModificationDate() !== undefined) dest.setModificationDate(src.getModificationDate()!);
  if (src.getProducer() !== undefined) dest.setProducer(src.getProducer()!);
  if (src.getSubject() !== undefined) dest.setSubject(src.getSubject()!);
  if (src.getTitle() !== undefined) dest.setTitle(src.getTitle()!);
  if (src.getKeywords() !== undefined) dest.setKeywords(src.getKeywords()!.split(" ").filter(Boolean));
}
