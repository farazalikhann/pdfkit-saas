import JSZip from "jszip";

const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04]; // "PK\x03\x04"

async function readHeaderBytes(file: File, length: number): Promise<Uint8Array> {
  return new Uint8Array(await file.slice(0, length).arrayBuffer());
}

function matches(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((b, i) => bytes[i] === b);
}

/** Sniffs the container format by magic bytes — never trusts the file extension. */
async function sniffContainer(file: File): Promise<"zip" | "ole" | "other"> {
  const header = await readHeaderBytes(file, 8);
  if (matches(header, ZIP_SIGNATURE)) return "zip";
  if (matches(header, OLE_SIGNATURE)) return "ole";
  return "other";
}

/** Validates a .docx upload is really a modern Word (OOXML/zip) document. */
export async function validateDocx(file: File): Promise<void> {
  const kind = await sniffContainer(file);
  if (kind === "ole") {
    throw new Error(
      "This looks like an old .doc file. Save it as .docx in Word (File → Save As → Word Document) and try again."
    );
  }
  if (kind !== "zip") {
    throw new Error("This doesn't look like a valid Word (.docx) file.");
  }
  const zip = await JSZip.loadAsync(file);
  if (!zip.file("word/document.xml")) {
    throw new Error("This doesn't look like a valid Word (.docx) file.");
  }
}

/** Validates a spreadsheet upload — SheetJS itself reads both legacy .xls (OLE) and .xlsx (zip). */
export async function validateSpreadsheet(file: File): Promise<void> {
  const isCsv = file.type === "text/csv" || /\.csv$/i.test(file.name);
  if (isCsv) return; // plain text — no container signature to check
  const kind = await sniffContainer(file);
  if (kind === "other") {
    throw new Error("This doesn't look like a valid Excel or CSV file.");
  }
}
