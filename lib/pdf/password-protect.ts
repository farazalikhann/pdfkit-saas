import { PDFDocument } from "@cantoo/pdf-lib";

export interface ProtectOptions {
  userPassword: string;
  /** Owner password unlocks full permissions; defaults to the user password. */
  ownerPassword?: string;
  allowPrinting?: boolean;
  allowCopying?: boolean;
}

export async function protectPdf(
  file: File,
  options: ProtectOptions
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);

  doc.encrypt({
    userPassword: options.userPassword,
    ownerPassword: options.ownerPassword || options.userPassword,
    permissions: {
      printing: options.allowPrinting === false ? undefined : "highResolution",
      copying: options.allowCopying ?? true,
      modifying: false,
      annotating: true,
      fillingForms: true,
      contentAccessibility: true,
      documentAssembly: false,
    },
  });

  return doc.save();
}
