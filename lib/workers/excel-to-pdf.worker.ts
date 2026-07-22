import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { ExcelToPdfRequest, ExcelToPdfResult } from "./excel-to-pdf.types";

// Shadow the ambient globals with a precise local shape instead of pulling in the
// "webworker" lib (which conflicts with the app's "dom" lib in the same tsconfig).
declare const self: {
  onmessage: ((event: MessageEvent<ExcelToPdfRequest>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

const WIDE_SHEET_COLUMN_THRESHOLD = 8;

self.onmessage = (event) => {
  try {
    const { fileBuffer, sheetNames, orientation } = event.data;
    if (sheetNames.length === 0) throw new Error("No sheets selected.");

    const workbook = XLSX.read(fileBuffer, { type: "array", sheets: sheetNames });
    let doc: jsPDF | null = null;

    sheetNames.forEach((name, index) => {
      const sheet = workbook.Sheets[name];
      if (!sheet) return;

      const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
        header: 1,
        raw: false,
        defval: "",
      });

      const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
      const useWide =
        orientation === "landscape" ||
        (orientation === "auto" && columnCount > WIDE_SHEET_COLUMN_THRESHOLD);
      const pageOrientation: "p" | "l" = useWide ? "l" : "p";

      if (!doc) {
        doc = new jsPDF({ orientation: pageOrientation, unit: "pt", format: "a4" });
      } else {
        doc.addPage("a4", pageOrientation);
      }

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(name, 20, 24);

      const [head, ...body] = rows.length > 0 ? rows : [[]];
      autoTable(doc, {
        head: head && head.length > 0 ? [head] : undefined,
        body,
        startY: 32,
        margin: { top: 32, left: 20, right: 20, bottom: 20 },
        styles: { fontSize: 8, cellPadding: 3, overflow: "linebreak" },
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
        theme: "grid",
      });

      self.postMessage({ type: "progress", fraction: (index + 1) / sheetNames.length });
    });

    if (!doc) throw new Error("None of the selected sheets had any data.");

    const bytes = (doc as jsPDF).output("arraybuffer");
    const result: ExcelToPdfResult = { bytes };
    self.postMessage({ type: "done", result }, [bytes]);
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : "Excel to PDF conversion failed.",
    });
  }
};
