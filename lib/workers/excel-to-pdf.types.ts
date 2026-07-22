export interface ExcelToPdfRequest {
  fileBuffer: ArrayBuffer;
  /** Sheets to include, in the order they should appear in the PDF. */
  sheetNames: string[];
  orientation: "auto" | "portrait" | "landscape";
}

export interface ExcelToPdfResult {
  bytes: ArrayBuffer;
}
