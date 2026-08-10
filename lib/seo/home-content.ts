import type { FaqItem } from "@/components/seo/faq-list";

/**
 * Homepage body copy, kept out of app/page.tsx so the page component stays
 * readable. Numbers here (26 tools, 35MB, 50 pages/100,000 characters) must
 * stay in sync with lib/tools.ts, lib/files/memory-guard.ts, and the AI tools'
 * documented limits, not be rounded up for effect.
 */
export const HOME_INTRO: string[] = [
  "PDFKit is a set of 26 PDF tools that run inside your browser tab instead of on a remote server. You compress, merge, split, convert, and edit PDFs the same way you would use any other website, except the actual file processing happens on your own device using JavaScript, not somewhere in a data center. It is built for anyone who needs a quick PDF fix without installing desktop software or handing a document to a company they have never heard of: students turning in assignments, job seekers formatting resumes, small business owners preparing contracts, and anyone dealing with scanned paperwork on a phone.",
  "Most PDF tools online work by uploading your file to a server, processing it there, and sending back a result. PDFKit skips that step for every tool except two AI features, Summarize and Translate, which are upfront about sending extracted text, not the file itself, to Google's Gemini API. Everything else, compression, merging, splitting, watermarking, password protection, redaction, happens using your browser's own JavaScript engine, and the result is handed back to you as a download without a network request. That distinction matters most for documents you would rather not put on a stranger's server: a scanned passport, a signed rental agreement, a bank statement you are trimming before sending to an accountant, or a medical form with your health history on it. If a tool never uploads your file, there is no server log and no third party that could see it, because it never left your device.",
  "The tools are grouped into six categories. Convert handles turning PDFs into JPGs or Word documents into PDFs, and back. Organize covers merging, splitting, reordering, and extracting pages. Optimize is where Compress and OCR live, for shrinking file size or making a scanned document searchable. Edit adds text, images, annotations, watermarks, and page numbers onto a page. Security handles password protection, unlocking, e-signatures, and redaction. AI Tools, the two exceptions above, summarize or translate a document using Google's Gemini model. If you are not sure which one you need, the search bar at the top matches by what you are trying to do, not just a tool's exact name.",
  "PDFKit is not magic, and it is worth being upfront about where it struggles. Files above roughly 35MB can run out of memory on an older phone's browser tab, though a laptop or desktop handles much larger files without trouble. It needs a reasonably modern browser, current Chrome, Firefox, Safari, or Edge, since several tools rely on Web Workers and OffscreenCanvas that do not exist in Internet Explorer or older mobile browsers. Scanned, image-only PDFs compress well but need OCR before their text becomes searchable; a born-digital PDF that is mostly text will not shrink much, since there is no image data to recompress. The two AI tools cap documents at 50 pages or 100,000 characters, and will not work on a scanned PDF that has not been OCR'd first, since there is no text layer to read.",
];

export const HOME_FAQS: FaqItem[] = [
  {
    q: "Does PDFKit really never upload my files anywhere?",
    a: "For every tool except Summarize and Translate, yes: your file is processed entirely in your browser and never touches a server. Those two AI tools extract text locally and send only that extracted text, never the file itself, to Google's Gemini API to generate a summary or translation.",
  },
  {
    q: "Is PDFKit actually free, or is there a paid tier?",
    a: "It is free, with no account, no paywall, and no usage limits on the tools themselves. There is no premium tier to upgrade to.",
  },
  {
    q: "Which browsers does PDFKit work on?",
    a: "Current versions of Chrome, Firefox, Safari, and Edge all work. Some tools use Web Workers and OffscreenCanvas for background processing, which is not supported in Internet Explorer or very old mobile browser builds.",
  },
  {
    q: "Can I use PDFKit on my phone?",
    a: "Yes, every tool is built mobile-first and works with touch input, though very large files, roughly above 35MB, can be slower or risk running out of memory on an older phone compared to a laptop.",
  },
  {
    q: "What happens to scanned PDFs that have no selectable text?",
    a: "Compression still works well on them since it targets embedded images, but you will not be able to search or copy text until you run the OCR tool first, which adds an invisible, searchable text layer over the scanned image.",
  },
  {
    q: "Who built PDFKit?",
    a: "PDFKit is a product by Faraz Ali Khan. You can read more about how files are handled on the Privacy page.",
  },
];
