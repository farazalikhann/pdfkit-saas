import { PDFDocument, EncryptedPDFError } from "@cantoo/pdf-lib";

const ENCRYPTED_MESSAGE =
  "This PDF is password-protected. Remove the password first, then try again.";
const CORRUPT_MESSAGE =
  "This doesn't look like a valid PDF file, or it may be corrupted.";

/** Normalizes whatever pdf-lib or pdf.js throw on load into one friendly message. */
export function toFriendlyPdfLoadError(err: unknown): string {
  if (err instanceof EncryptedPDFError) return ENCRYPTED_MESSAGE;
  if (err && typeof err === "object" && "name" in err) {
    const name = (err as { name?: unknown }).name;
    if (name === "PasswordException") return ENCRYPTED_MESSAGE;
  }
  if (err instanceof Error && /password|encrypt/i.test(err.message)) {
    return ENCRYPTED_MESSAGE;
  }
  return CORRUPT_MESSAGE;
}

/**
 * Defense in depth: the page pickers already catch encrypted/corrupt PDFs
 * before a transform ever runs, but this keeps every transform safe on its
 * own too (e.g. if it's ever called from somewhere that skipped the picker).
 */
export async function loadPdfSafely(bytes: ArrayBuffer): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes);
  } catch (err) {
    throw new Error(toFriendlyPdfLoadError(err));
  }
}
