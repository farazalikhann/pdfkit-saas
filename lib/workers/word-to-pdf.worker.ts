import mammoth from "mammoth";
import { parseSimpleHtml } from "@/lib/html/simple-html-parser";
import { renderBlocksToPdf } from "@/lib/pdf/html-layout-to-pdf";
import type { WordToPdfRequest, WordToPdfResult } from "./word-to-pdf.types";

declare const self: {
  onmessage: ((event: MessageEvent<WordToPdfRequest>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};

self.onmessage = async (event) => {
  try {
    const { fileBuffer } = event.data;
    const { value: html } = await mammoth.convertToHtml(
      { arrayBuffer: fileBuffer },
      { convertImage: mammoth.images.dataUri }
    );

    const blocks = parseSimpleHtml(html);
    const bytes = await renderBlocksToPdf(blocks, (fraction) => {
      self.postMessage({ type: "progress", fraction });
    });

    const cleanBytes = new Uint8Array(bytes);
    const result: WordToPdfResult = { bytes: cleanBytes.buffer };
    self.postMessage({ type: "done", result }, [cleanBytes.buffer]);
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : "Word to PDF conversion failed.",
    });
  }
};
