import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import DOMPurify from "dompurify";

export type PageSize = "a4" | "letter";
export type Orientation = "portrait" | "landscape";

export interface HtmlToPdfOptions {
  pageSize: PageSize;
  orientation: Orientation;
  marginMm: number;
}

const PAGE_SIZES_MM: Record<PageSize, { w: number; h: number }> = {
  a4: { w: 210, h: 297 },
  letter: { w: 215.9, h: 279.4 },
};

function mmToPx(mm: number): number {
  return Math.round((mm / 25.4) * 96);
}

/**
 * <style> is a RAWTEXT element — its content is parsed as raw text (no entity
 * decoding) up to the first literal "</style" sequence. Inserting any character
 * between "<" and "/" stops the tokenizer from recognizing a close tag there
 * (it only enters "RAWTEXT end tag open state" when "/" immediately follows
 * "<"), which is inert for CSS but blocks CSS text from smuggling in markup
 * that ends the tag early.
 */
function escapeRawTextClose(text: string, tagName: string): string {
  const re = new RegExp(`</(${tagName})`, "gi");
  return text.replace(re, "<\\/$1");
}

function waitForImages(doc: Document, timeoutMs = 8000): Promise<void> {
  const imgs = Array.from(doc.images).filter((img) => !img.complete);
  if (imgs.length === 0) return Promise.resolve();
  const perImage = imgs.map(
    (img) =>
      new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      })
  );
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  return Promise.race([Promise.all(perImage).then(() => undefined), timeout]);
}

/**
 * Rasterizes HTML into a paginated PDF via html2canvas + jsPDF. Runs the
 * content inside an isolated blank iframe rather than the live app DOM:
 * html2canvas's CSS color parser predates oklch()/color-mix() and throws on
 * them, and appending straight into document.body would let it inherit (and
 * choke on) this app's own Tailwind theme variables. An iframe with its own
 * blank document sidesteps both that crash and any accidental bleed-through
 * of the app's styling into the user's rendered content.
 */
export async function renderHtmlToPdf(
  rawHtml: string,
  options: HtmlToPdfOptions,
  onProgress?: (fraction: number) => void
): Promise<Uint8Array> {
  const parsed = new DOMParser().parseFromString(rawHtml, "text/html");
  // DOMPurify unconditionally empties <style> tag bodies (its FORBID_CONTENTS
  // default, which config options can only add to, never override) — sensible
  // for markup destined for a live page, but it means <style> can't survive a
  // pass through DOMPurify at all. Pull the raw CSS out and inline it directly,
  // RAWTEXT-escaped instead: the actual XSS surface (script tags, event-handler
  // attributes, javascript: URLs) all live in the body markup, which still goes
  // through DOMPurify below.
  const styleBlocks = Array.from(parsed.querySelectorAll("style"))
    .map((s) => `<style>${escapeRawTextClose(s.textContent ?? "", "style")}</style>`)
    .join("\n");
  const bodyHtml = parsed.body?.innerHTML ?? rawHtml;
  const cleanBody = DOMPurify.sanitize(bodyHtml);
  const clean = styleBlocks + cleanBody;

  const { w: pageWmm, h: pageHmm } =
    options.orientation === "landscape"
      ? { w: PAGE_SIZES_MM[options.pageSize].h, h: PAGE_SIZES_MM[options.pageSize].w }
      : PAGE_SIZES_MM[options.pageSize];
  const contentWmm = pageWmm - options.marginMm * 2;
  const contentHmm = pageHmm - options.marginMm * 2;
  const contentWpx = mmToPx(contentWmm);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-99999px";
  iframe.style.top = "0";
  iframe.style.width = `${contentWpx}px`;
  iframe.style.height = "100px";
  iframe.style.border = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) throw new Error("Couldn't create an isolated rendering frame.");

    iframeDoc.open();
    iframeDoc.write(
      `<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0;background:#ffffff;color:#111111;font-family:Arial,Helvetica,sans-serif;">${clean}</body></html>`
    );
    iframeDoc.close();

    await waitForImages(iframeDoc);
    onProgress?.(0.15);

    const fullHeightPx = Math.max(1, iframeDoc.documentElement.scrollHeight);
    iframe.style.height = `${fullHeightPx}px`;

    const canvas = await html2canvas(iframeDoc.body, {
      useCORS: true,
      backgroundColor: "#ffffff",
      scale: 2,
      width: contentWpx,
      windowWidth: contentWpx,
    });
    onProgress?.(0.6);

    const pxPerMm = canvas.width / contentWmm;
    const pageHeightPx = Math.max(1, Math.floor(contentHmm * pxPerMm));

    const doc = new jsPDF({ orientation: options.orientation, unit: "mm", format: options.pageSize });
    let renderedPx = 0;
    let pageIndex = 0;

    while (renderedPx < canvas.height) {
      if (pageIndex > 0) doc.addPage(options.pageSize, options.orientation);

      const sliceHeightPx = Math.min(pageHeightPx, canvas.height - renderedPx);
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeightPx;
      const ctx = pageCanvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");
      ctx.drawImage(canvas, 0, renderedPx, canvas.width, sliceHeightPx, 0, 0, canvas.width, sliceHeightPx);

      const imgData = pageCanvas.toDataURL("image/jpeg", 0.92);
      doc.addImage(imgData, "JPEG", options.marginMm, options.marginMm, contentWmm, sliceHeightPx / pxPerMm);

      renderedPx += sliceHeightPx;
      pageIndex += 1;
      onProgress?.(0.6 + 0.4 * Math.min(1, renderedPx / canvas.height));
    }

    return new Uint8Array(doc.output("arraybuffer"));
  } finally {
    document.body.removeChild(iframe);
  }
}
