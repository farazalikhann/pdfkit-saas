import { PDFDocument } from "@cantoo/pdf-lib";

export class WrongPasswordError extends Error {
  constructor() {
    super("That password doesn't match this file. Double-check it and try again.");
    this.name = "WrongPasswordError";
  }
}

/** Decrypts a password-protected PDF using a password the user already knows, and re-saves it without encryption. */
export async function unlockPdf(file: File, password: string): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  try {
    const doc = await PDFDocument.load(bytes, { password });
    return await doc.save();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (/password/i.test(message)) throw new WrongPasswordError();
    throw err;
  }
}
