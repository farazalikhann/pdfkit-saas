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

  // The encryption algorithm is chosen from the PDF's declared version header
  // (1.4/1.5 -> RC4-128, 1.6/1.7 -> AES-128), not from an option here. Forcing
  // "1.7ext3" makes every file get the strongest tier (AES-256, /V 5) regardless
  // of what version the source PDF happened to declare. The fields are typed
  // `private readonly` in pdf-lib's .d.ts (a real class privacy at the JS level
  // doesn't exist here — just a compile-time annotation), so a cast is needed.
  const header = doc.context.header as unknown as { major: string; minor: string };
  header.major = "1";
  header.minor = "7ext3";

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
