/**
 * Hand-written, per-tool SEO content — titles, descriptions, on-page copy, HowTo
 * steps, and FAQs. Deliberately NOT auto-generated from lib/tools.ts's short
 * `description` field: search engines and readers both need real, specific text,
 * and FAQPage/HowTo schema must only ever describe what's genuinely visible and
 * genuinely true of the tool (accuracy checked against each tool's actual
 * implementation, not aspirational copy).
 *
 * metaTitle is the pre-brand portion — the root layout's title template appends
 * " | PDFKit" automatically. Aim for 41-51 chars here so the rendered title lands
 * in the 50-60 char sweet spot. metaDescription should be 150-160 chars as-is.
 */

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolSeoContent {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string[];
  howTo: string[];
  faqs: ToolFaq[];
  related: string[];
}

export const toolSeoContent: Record<string, ToolSeoContent> = {
  // ---------- Convert ----------
  "pdf-to-jpg": {
    metaTitle: "Convert PDF to JPG Free — No Upload, No Signup",
    metaDescription:
      "Export every page of a PDF as a JPG or PNG image, free and unlimited. Runs entirely in your browser, so your file is never uploaded anywhere — no signup required.",
    h1: "Convert PDF to JPG Online — Free, No Upload Required",
    intro: [
      "This tool turns each page of a PDF into a separate JPG or PNG image, then bundles them into a ZIP you can download in one click. It's useful for pulling a single page out of a report to paste into a slide deck, sharing a document on a platform that only accepts images, or archiving pages as pictures instead of a live PDF.",
      "Everything happens in your browser using pdf.js, the same rendering engine Firefox uses to display PDFs natively. Your file is read locally, rendered to a canvas, and encoded to JPG or PNG on your device — nothing is ever sent to a server. That means it works the same whether you're converting a one-page receipt or a 200-page scanned book, and it keeps working even with patchy Wi-Fi, since there's no upload to wait on.",
      "The main limit is memory: very large or very high-page-count PDFs can use a meaningful chunk of RAM while every page renders, which matters more on an older phone than on a laptop. For most everyday PDFs — invoices, forms, scanned letters, slide handouts — conversion takes a few seconds and the output images are sized to match the original page resolution.",
      "People reach for this most often when a platform simply won't accept a PDF — a form that only takes an image upload, a forum post, a product listing — or when they want a quick visual of one page without opening a full PDF viewer. It's also a common first step before further image editing: crop, annotate, or resize a single page in an image editor once it's a JPG, then bring it back into a document elsewhere if needed. Because each page becomes its own file inside the ZIP, numbered in page order, it's easy to grab just the one or two pages you actually need instead of digging through a PDF viewer.",
    ],
    howTo: [
      "Drop your PDF into the upload area, or tap to browse for it.",
      "Wait a moment while the pages render as thumbnails in your browser.",
      "Tap \"Convert to JPG\" (or switch to PNG first if you need a transparent background).",
      "Download the ZIP file — it contains one image per page, numbered in order.",
    ],
    faqs: [
      {
        q: "Is this really free with no limits?",
        a: "Yes. There's no page limit, no daily quota, and no account required — convert as many PDFs as you like.",
      },
      {
        q: "Does my PDF get uploaded to a server?",
        a: "No. The conversion runs entirely in your browser using pdf.js. Your file never leaves your device.",
      },
      {
        q: "Can I choose JPG or PNG?",
        a: "Yes, both formats are supported. PNG is better if a page has transparency or crisp line art; JPG is smaller for photo-heavy pages.",
      },
      {
        q: "Does it work on mobile?",
        a: "Yes, the tool is built mobile-first and works on phones and tablets, though very long PDFs may take longer on older devices.",
      },
      {
        q: "Will the image quality match the original PDF?",
        a: "Pages are rendered at a resolution that matches the PDF's own page size, so text and images come out sharp — not blurry or over-compressed.",
      },
    ],
    related: ["jpg-to-pdf", "compress-pdf", "split-pdf", "merge-pdf"],
  },

  "word-to-pdf": {
    metaTitle: "Word to PDF Converter — Free, Private, No Signup",
    metaDescription:
      "Convert .docx files to PDF for free, right in your browser. No file size limits, no watermarks, no account — your document never leaves your device.",
    h1: "Convert Word to PDF Online Free — No Signup Needed",
    intro: [
      "This tool converts .docx Word documents into shareable PDF files, keeping the layout, fonts, and formatting as close to the original as the browser can render. It's the step most people need before emailing a resume, submitting an assignment, or sending a contract somewhere that expects a PDF instead of an editable Word file.",
      "The conversion happens locally in your browser rather than on a server, which means your document — which might contain a resume's personal details, a client contract, or unpublished writing — is never transmitted anywhere. There's no size cap enforced by an account tier and no watermark stamped across the output, because there's no backend billing model behind this tool at all.",
      "Where it has real limits: very complex Word layouts — heavy use of text boxes, embedded objects, tracked changes, or unusual custom fonts — may not render pixel-perfect, since the conversion relies on standard web fonts and layout rules rather than Microsoft Word's own rendering engine. For typical documents (letters, resumes, reports, contracts) the result is clean and print-ready.",
      "This is usually the last step before a document goes somewhere final — a job application, a signed agreement, a submission portal — precisely because a PDF looks the same on every device and can't be casually edited afterward, unlike a Word file. It's a good habit to open the resulting PDF and skim it before sending, the same way you'd proofread anything important; for most everyday documents that quick check confirms everything carried over exactly as expected, and for the rare complex layout it catches anything worth fixing in the original Word file first.",
      "Because there's no file-count limit, it's just as reasonable to convert a single-page cover letter as a fifty-page dissertation draft, and to do it as many times as a document goes through revisions before its final version is ready to send.",
    ],
    howTo: [
      "Upload your .docx file by dropping it in or selecting it from your device.",
      "Wait while the document is parsed and laid out for conversion — this happens on-device.",
      "Review the automatic preview if one is shown.",
      "Click \"Convert to PDF\" and download the finished file.",
    ],
    faqs: [
      {
        q: "Does this work with older .doc files, or only .docx?",
        a: "It's built for the modern .docx format. If you have an older .doc file, save it as .docx from Word first, then convert.",
      },
      {
        q: "Will my formatting stay intact?",
        a: "Standard formatting — fonts, headings, tables, images, spacing — carries over well. Very complex layouts with text boxes or embedded objects may shift slightly.",
      },
      {
        q: "Is there a file size limit?",
        a: "No artificial limit is enforced — the practical ceiling is your device's own memory, which comfortably handles typical multi-page documents.",
      },
      {
        q: "Is my document uploaded anywhere?",
        a: "No. The whole conversion runs in your browser, so your document never leaves your device.",
      },
      {
        q: "Do I need a Microsoft account or Office installed?",
        a: "No. You don't need Word, Office, or any account — just a modern browser.",
      },
    ],
    related: ["excel-to-pdf", "html-to-pdf", "merge-pdf", "compress-pdf"],
  },

  "excel-to-pdf": {
    metaTitle: "Excel to PDF Converter Online — Free & Private",
    metaDescription:
      "Turn .xlsx spreadsheets into clean, paginated PDF files for free and unlimited. No upload, no signup — your spreadsheet is processed entirely in your browser.",
    h1: "Convert Excel to PDF Online — Free, No Upload",
    intro: [
      "This tool converts .xlsx spreadsheets into PDF documents, laying out each sheet's data into properly paginated tables rather than one giant unreadable image. It's built for the common case of needing to send a spreadsheet to someone who just needs to read the numbers, print them, or attach them somewhere that only accepts PDFs.",
      "Conversion runs client-side: your spreadsheet is parsed and rendered into a table layout directly in your browser, with no server involved and nothing uploaded. That matters if your spreadsheet has anything sensitive in it — payroll figures, client lists, financial models — since it's never transmitted over the network.",
      "Because it renders data as real tabular PDF content (not a screenshot), text stays sharp and searchable in the output. The main limitation is on very wide sheets with dozens of columns, which may need to be scaled down or split across pages to fit — a normal constraint of putting spreadsheet data on paper-sized pages, not specific to this tool.",
      "It's commonly used for turning a working spreadsheet — a budget, an inventory count, a client list — into something that reads cleanly when someone just needs to review or print the numbers rather than edit them. Since the output is a real PDF table rather than an image, recipients can still search for a specific value or copy a row of numbers out, which a plain screenshot of a spreadsheet never allows. For anything with many columns, it's worth checking the print-layout preview first, the same way you would in Excel itself, since very wide data sometimes reads better in landscape orientation.",
      "It's also a quick way to snapshot a spreadsheet at a particular point in time — sending a static PDF copy of this month's numbers rather than a live file that someone could accidentally edit further.",
    ],
    howTo: [
      "Upload your .xlsx spreadsheet.",
      "The sheet is parsed and laid out into a paginated table automatically.",
      "Check the preview to confirm the layout looks right.",
      "Click \"Convert to PDF\" and download the result.",
    ],
    faqs: [
      {
        q: "Does it handle multiple sheets in one workbook?",
        a: "Yes, each sheet in the workbook is converted and included in the output PDF.",
      },
      {
        q: "What happens with very wide tables?",
        a: "Wide tables are scaled to fit the page width, the same tradeoff you'd face printing a wide spreadsheet from Excel itself.",
      },
      {
        q: "Are formulas or just values converted?",
        a: "The calculated values shown in your spreadsheet are what get rendered — the PDF is a snapshot of the data, not a live spreadsheet.",
      },
      {
        q: "Is my spreadsheet data private?",
        a: "Yes. Everything runs in your browser; the file is never uploaded to a server.",
      },
      {
        q: "Is there a signup or file limit?",
        a: "No signup, and no artificial file-size cap — it's free and unlimited.",
      },
    ],
    related: ["word-to-pdf", "merge-pdf", "compress-pdf", "add-page-numbers"],
  },

  "jpg-to-pdf": {
    metaTitle: "JPG to PDF Converter — Free, Offline, No Signup",
    metaDescription:
      "Combine JPG, PNG, or WebP images into a single PDF for free. Reorder pages before converting. 100% private — works entirely offline in your browser.",
    h1: "Convert JPG to PDF Online — Free & Works Offline",
    intro: [
      "This tool combines one or more images — JPG, PNG, or WebP — into a single PDF document, in whatever order you choose. It's the tool for turning a stack of scanned pages, receipt photos, or screenshots into one shareable PDF instead of a folder of loose image files.",
      "Because it's 100% client-side, it also works completely offline once the page is loaded — genuinely useful if you're scanning documents on your phone somewhere without reliable signal. Images are decoded, laid out onto PDF pages, and encoded locally; nothing is uploaded, so there's no wait on a slow connection and no risk of a private photo passing through a server.",
      "You can drag to reorder images before combining them, so the page order in the final PDF matches what you intend rather than just the order you selected files in. Each image is placed on its own page, sized to fit, which keeps the output looking like a normal scanned document rather than a warped or cropped mess.",
      "This is the tool people reach for right after photographing a stack of paperwork with their phone — receipts for an expense report, pages of a signed lease, a handwritten form — since it turns a folder of individual photos into the single PDF that most offices and portals actually expect. It works equally well for combining screenshots into one document to send as a unified file instead of five separate attachments. Because nothing is uploaded, it's also a reasonable choice for combining images of anything sensitive, like ID documents or medical paperwork, without that content passing through anyone else's server.",
      "It also handles a mix of formats in one go — combine a couple of PNG screenshots with several JPG photos into a single ordered PDF without needing to convert anything to a common format first.",
    ],
    howTo: [
      "Select or drag in all the images you want to combine.",
      "Drag the thumbnails to reorder them into the sequence you want in the final PDF.",
      "Tap \"Convert to PDF\" once the order looks right.",
      "Download the combined PDF file.",
    ],
    faqs: [
      {
        q: "Can I combine images of different sizes?",
        a: "Yes — each image gets its own page sized to fit it, so mixed portrait and landscape photos are both handled correctly.",
      },
      {
        q: "Does it work without an internet connection?",
        a: "Yes, once the tool page has loaded once, the actual conversion works offline since everything runs on your device.",
      },
      {
        q: "How many images can I combine?",
        a: "There's no fixed limit — realistically it's bounded by your device's memory, which comfortably handles dozens of typical photos.",
      },
      {
        q: "Can I reorder the images before converting?",
        a: "Yes, drag and drop the thumbnails into the order you want before hitting convert.",
      },
      {
        q: "Is this safe for private photos, like scanned ID documents?",
        a: "Yes — since nothing is uploaded, your images never leave your device at any point in the process.",
      },
    ],
    related: ["pdf-to-jpg", "merge-pdf", "compress-pdf", "rotate-pages"],
  },

  "html-to-pdf": {
    metaTitle: "HTML to PDF Converter — Free, No Signup Needed",
    metaDescription:
      "Convert any web page or pasted HTML into a PDF for free. Choose page size, orientation, and margins — no account, no watermark, and no per-file limit at all.",
    h1: "Convert HTML or a Web Page to PDF — Free Online Tool",
    intro: [
      "This tool turns a web page URL or raw pasted HTML into a downloadable PDF, with control over page size, orientation, and margins. It's handy for saving an article to read later, archiving a page that might change or disappear, or turning a styled HTML report into something you can email or print.",
      "There's one honest difference from most of the tools on this site: converting a URL requires fetching that page's HTML through our server first, because browsers block a webpage from directly reading another site's HTML across domains (a security rule called CORS). Once the HTML is retrieved, the actual rendering into a PDF happens in your browser, the same as everywhere else — we don't store the page or your PDF anywhere.",
      "If you'd rather not have the fetch step touch our server at all, use the \"paste HTML\" mode instead: paste HTML you already have (say, exported from an email or a local file) and the whole conversion happens on-device with nothing sent anywhere. Very large or script-heavy pages can take longer to render and, rarely, may not lay out identically to how they appear live in a browser tab.",
      "This tool gets used for archiving an article or recipe before it disappears behind a paywall or a site redesign, turning an email newsletter into a shareable PDF, or converting an internal HTML report — the kind generated by another tool or a dashboard export — into something that prints cleanly. Because you control page size and margins directly, it's better suited to that kind of document conversion than to trying to perfectly replicate a highly interactive, JavaScript-heavy web app as a static page.",
      "For anything you'll reference again later — a recipe, a set of instructions, a reference article — having a stable, print-ready PDF copy also protects against the original page changing or going offline entirely.",
    ],
    howTo: [
      "Choose \"From URL\" and paste a web address, or switch to \"Paste HTML\" and paste your own markup.",
      "Pick a page size, orientation, and margin preset.",
      "Click \"Convert to PDF.\"",
      "Download the generated PDF once rendering finishes.",
    ],
    faqs: [
      {
        q: "Does this tool store the pages I convert?",
        a: "No. The URL's HTML is fetched on request to get around cross-origin browser restrictions, then discarded — nothing is stored server-side.",
      },
      {
        q: "Is this tool fully offline like the others?",
        a: "The \"paste HTML\" mode is fully client-side and works offline. Converting from a URL needs a network request to fetch that page's HTML first.",
      },
      {
        q: "Can I control the page size and margins?",
        a: "Yes — pick from standard page sizes, portrait or landscape orientation, and none/normal/wide margins before converting.",
      },
      {
        q: "Will JavaScript-heavy pages render correctly?",
        a: "Simple to moderately complex pages render well. Pages that rely heavily on client-side scripts to build their content may not capture perfectly.",
      },
      {
        q: "Is there a cost or signup required?",
        a: "No — it's free with no account needed, same as every other tool here.",
      },
    ],
    related: ["word-to-pdf", "merge-pdf", "add-header-footer", "compress-pdf"],
  },

  // ---------- Organize ----------
  "merge-pdf": {
    metaTitle: "Merge PDF Files Online Free — No Upload Needed",
    metaDescription:
      "Combine multiple PDF files into one document for free, right in your browser. Reorder pages before merging — no upload, no signup, no limit on file count.",
    h1: "Merge PDF Files Online — Free, Without Uploading Anything",
    intro: [
      "This tool combines two or more PDF files into a single document, in whatever order you arrange them. It's the fix for the common mess of having a contract, an invoice, and a set of scanned signatures as three separate files when you need to send one.",
      "The merge happens entirely on your device using pdf-lib, a PDF-manipulation library that runs in the browser — your files are read locally, stitched together in memory, and the combined PDF is handed back to you as a download. None of it touches a server, so there's no upload wait, no file left sitting on someone else's storage, and it works the same on a phone with one bar of signal as it does on fiber.",
      "You can drag files into any order before merging, and the page count of each source document carries through unchanged — nothing gets rasterized or recompressed, so text stays selectable and image quality stays exactly as it was in the originals. The only real ceiling is your device's own memory when combining a very large number of very large files, which is rarely a practical issue for normal use.",
      "This is one of the most-used tools here for a reason: assembling a single PDF from parts that arrived separately is one of the most common everyday document tasks there is — a signed page that needs to go back into the main contract, a cover letter that needs to sit in front of a resume, scanned receipts that need to become one expense report. Since merging on most sites means uploading every file first and waiting, doing it on-device instead is noticeably faster in practice, especially when merging several large scanned PDFs on a phone connection.",
    ],
    howTo: [
      "Add two or more PDF files — drag them in or select from your device.",
      "Drag the file thumbnails to set the order you want them merged in.",
      "Tap \"Merge PDFs.\"",
      "Download the single combined PDF file.",
    ],
    faqs: [
      {
        q: "Is there a limit on how many PDFs I can merge?",
        a: "No hard limit — you can merge as many files as your device can comfortably hold in memory at once.",
      },
      {
        q: "Do my files get uploaded to merge them?",
        a: "No. Merging happens entirely in your browser using pdf-lib; your files never leave your device.",
      },
      {
        q: "Can I merge PDFs on my phone?",
        a: "Yes, the tool is mobile-first and works the same on a phone browser as on a desktop.",
      },
      {
        q: "Will merging affect the quality of my pages?",
        a: "No — pages are combined as-is, not re-rendered or recompressed, so text and images stay exactly as sharp as the originals.",
      },
      {
        q: "Do I need to create an account?",
        a: "No account, no signup — just open the tool and use it.",
      },
    ],
    related: ["split-pdf", "reorder-pages", "compress-pdf", "extract-pages"],
  },

  "split-pdf": {
    metaTitle: "Split PDF Files Online — Free & 100% Private",
    metaDescription:
      "Split a PDF into multiple separate files by custom page range, free and unlimited. Runs entirely in your browser — no upload, no account, no watermark.",
    h1: "Split a PDF Into Multiple Files — Free, No Upload",
    intro: [
      "This tool splits one PDF into several smaller PDF files, based on the page ranges you set — useful for breaking a scanned book into chapters, separating a bundle of invoices that got merged into one file, or pulling a single section out of a long report to send on its own.",
      "The split happens locally using pdf-lib: your document is read once in the browser, divided according to the ranges you specify, and each resulting file is packaged for download without any of it passing through a server. That's a real difference from most online split tools, which need you to upload the whole file before they can even start.",
      "Because pages are copied rather than re-rendered, the output files keep their original text, fonts, images, and quality exactly intact. There's no limit on how many pieces you can split a document into, though splitting a very large file into many separate downloads at once is naturally a bit slower than a single quick operation.",
      "A common case is a scanned batch of separate invoices or forms that got saved as one long PDF by a scanner's default settings — splitting by range turns that back into individual files matching the original documents. It's also useful for breaking a long report into per-chapter files for easier sharing, or pulling out just the pages relevant to one recipient from a document that covers several topics, without needing a full PDF editor installed.",
      "Because you set the exact ranges yourself, splitting works whether you need two roughly equal halves or a dozen small, unevenly sized pieces matching the document's real structure.",
    ],
    howTo: [
      "Upload the PDF you want to split.",
      "Set the page ranges for each resulting file (for example, 1-5, 6-10).",
      "Preview the split to confirm the page ranges are correct.",
      "Tap \"Split PDF\" and download the resulting files.",
    ],
    faqs: [
      {
        q: "Can I split by custom page ranges, not just even chunks?",
        a: "Yes, you set exactly which pages go into each output file.",
      },
      {
        q: "Is my file uploaded anywhere to split it?",
        a: "No — splitting happens entirely in your browser using pdf-lib, so the file never leaves your device.",
      },
      {
        q: "Does splitting reduce the quality of the pages?",
        a: "No, pages are copied exactly as they are in the source file — nothing is recompressed or re-rendered.",
      },
      {
        q: "Is there a page count limit?",
        a: "No artificial limit — it handles documents from a couple of pages up to several hundred, bounded only by your device's memory.",
      },
      {
        q: "Do I need to sign up to use it?",
        a: "No signup and no watermark on the output — it's free to use directly.",
      },
    ],
    related: ["merge-pdf", "extract-pages", "remove-pages", "reorder-pages"],
  },

  "extract-pages": {
    metaTitle: "Extract PDF Pages Free — No Upload, No Signup",
    metaDescription:
      "Pull specific pages out of a PDF into a brand-new file, free and unlimited. Pick exactly which pages you need — everything runs locally in your browser.",
    h1: "Extract Pages From a PDF — Free, No Upload Required",
    intro: [
      "This tool lets you pick specific pages out of a PDF — a single page, a range, or a scattered set — and save just those pages as a new, separate PDF file. It's the tool for when you only need page 4 of a 60-page contract, or three specific pages out of a scanned form.",
      "You select pages visually, from thumbnails of the actual document, rather than guessing page numbers blind. Selection and extraction both happen in your browser via pdf-lib, so the source file is never uploaded — the new PDF is built locally from the pages you choose and handed straight to you as a download.",
      "The extracted pages keep their original quality, since they're copied directly rather than being rasterized into images. This also means any real text on those pages stays selectable and searchable in the new file, unlike screenshotting a PDF viewer, which is the workaround a lot of people resort to without a tool like this.",
      "This is the natural tool for pulling just your own signature page out of a long lease, grabbing one relevant chapter from a textbook PDF to reference separately, or sharing only the pages of a report that apply to one department without handing over the whole document. Because selection happens visually against real thumbnails of your document, it's much less error-prone than trying to guess page numbers from a table of contents, especially in scanned documents where the printed and PDF page numbers don't always match.",
      "It works just as well for a single page as for a large scattered selection, so it fits both the \"just this one page\" case and the \"everything except a few pages\" case equally directly.",
    ],
    howTo: [
      "Upload your PDF.",
      "Tap the thumbnails of the pages you want to extract — you'll see them highlighted as you select.",
      "Confirm your selection in the page picker.",
      "Tap \"Extract Pages\" and download the new PDF containing just those pages.",
    ],
    faqs: [
      {
        q: "Can I extract non-consecutive pages, like 2, 5, and 9?",
        a: "Yes, the page picker lets you select any combination of pages, not just a continuous range.",
      },
      {
        q: "Does the original file get modified?",
        a: "No, the source PDF is untouched — extraction creates a brand-new file containing only the pages you selected.",
      },
      {
        q: "Is this tool private?",
        a: "Yes, extraction happens entirely on your device; your PDF is never uploaded to a server.",
      },
      {
        q: "Will the extracted pages still have selectable text?",
        a: "Yes — pages are copied directly from the source, so any real text stays selectable and searchable, not flattened into an image.",
      },
      {
        q: "Is there a cost for extracting a lot of pages?",
        a: "No, it's free with no page limit or account requirement.",
      },
    ],
    related: ["split-pdf", "remove-pages", "merge-pdf", "reorder-pages"],
  },

  "remove-pages": {
    metaTitle: "Remove PDF Pages Online — Free, Works Offline",
    metaDescription:
      "Delete unwanted pages from a PDF for free, right in your browser. Select pages visually, no uploads required — it works completely offline once the page has loaded.",
    h1: "Remove Pages From a PDF — Free & Works Offline",
    intro: [
      "This tool deletes specific pages from a PDF — a blank scanned page, an outdated cover sheet, a page with information you don't want to share — and gives you back a clean file with just the pages you want to keep.",
      "You choose which pages to remove using a visual page picker showing thumbnails of the actual document, so you're never guessing based on page numbers alone. The whole operation runs in your browser through pdf-lib: the file is loaded locally, the pages you marked are dropped, and the result is rebuilt and handed to you as a download — no upload involved at any point.",
      "Because it's fully client-side, it also works offline once the page has loaded, which matters if you're cleaning up a document somewhere without a reliable connection. Remaining pages keep their original quality and any real text stays selectable, since nothing is flattened or re-rendered in the process.",
      "A frequent use case is cleaning up a scan where the feeder picked up a stray blank page, or trimming a document down to only the sections a specific recipient needs to see — removing internal notes pages before sending a report externally, for instance. Because it edits the actual PDF page tree rather than producing a new rasterized copy, the file that comes out is a normal, fully editable PDF, not a flattened image dressed up to look like one.",
      "It's a quick fix for a document that's otherwise finished and just needs a page or two taken out, rather than a reason to rebuild or re-export the whole file from its original source.",
    ],
    howTo: [
      "Upload the PDF you want to edit.",
      "Tap the thumbnails of the pages you want to remove.",
      "Double-check the pages marked for removal in the picker.",
      "Tap \"Remove Pages\" and download the cleaned-up PDF.",
    ],
    faqs: [
      {
        q: "Can I remove multiple, non-consecutive pages at once?",
        a: "Yes, select as many pages as you like from anywhere in the document in a single pass.",
      },
      {
        q: "Is my document uploaded to remove pages?",
        a: "No — this runs entirely on your device using pdf-lib, so your file is never sent anywhere.",
      },
      {
        q: "Does it work without an internet connection?",
        a: "Yes, once the tool page has loaded, removing pages works fully offline.",
      },
      {
        q: "Will the remaining pages lose quality?",
        a: "No, the pages you keep are untouched copies from the original — no recompression or re-rendering happens.",
      },
      {
        q: "Is there a limit to how many pages I can remove?",
        a: "No — remove as many pages as you need, for free, with no account required.",
      },
    ],
    related: ["extract-pages", "split-pdf", "reorder-pages", "merge-pdf"],
  },

  "rotate-pages": {
    metaTitle: "Rotate PDF Pages Free — No Upload, No Signup",
    metaDescription:
      "Fix sideways or upside-down PDF pages for free. Rotate individual pages or the whole document 90, 180, or 270 degrees — all processed locally in your browser.",
    h1: "Rotate PDF Pages Online — Free, No Upload",
    intro: [
      "This tool fixes PDFs where one or more pages ended up sideways or upside down — a common outcome of scanning a stack of paper that wasn't perfectly aligned in the feeder. You can rotate the whole document at once or fix individual pages independently.",
      "Rotation is applied directly to each page's orientation metadata using pdf-lib, entirely in your browser. That's a meaningfully better approach than tools that re-render the page as a rotated image: the underlying text, links, and image quality are completely unaffected, since nothing is redrawn — only the page's rotation value changes.",
      "Because it's client-side, there's no upload step and no wait for a server to process your file, which matters most when you're fixing a scan on your phone right after taking it. The tool works the same for a single stray sideways page in an otherwise fine document as it does for a whole file that came out rotated.",
      "This comes up constantly with scanned paperwork: a multi-page fax or scan where one sheet was fed in sideways, or a phone-scanned document where the orientation got misread. Rather than re-scanning the whole thing, fixing the one or two affected pages directly in the PDF is faster and avoids any loss of quality that re-scanning could introduce. It also works well as a quick fix right before sending a document somewhere, when you've just noticed a page is wrong and don't want to track down the original scan again.",
      "Since only the orientation flag changes, rotating a page back and forth is completely reversible, so there's no risk in experimenting until every page reads the right way up.",
    ],
    howTo: [
      "Upload your PDF.",
      "Select the pages that need rotating (or select all).",
      "Choose 90°, 180°, or 270° for the selected pages.",
      "Tap \"Rotate PDF\" and download the corrected file.",
    ],
    faqs: [
      {
        q: "Can I rotate just one page instead of the whole document?",
        a: "Yes, you can select individual pages and rotate them independently of the rest of the document.",
      },
      {
        q: "Does rotating reduce image or text quality?",
        a: "No — only the page's orientation is changed. The actual content isn't re-rendered, so nothing loses quality.",
      },
      {
        q: "Is my file uploaded to rotate it?",
        a: "No, rotation happens entirely on your device, so your PDF is never sent to a server.",
      },
      {
        q: "Can I rotate a page 180 degrees to fix an upside-down scan?",
        a: "Yes, 90°, 180°, and 270° rotation are all supported per page.",
      },
      {
        q: "Is this free for large documents too?",
        a: "Yes, there's no page-count limit or pricing tier — it's free either way.",
      },
    ],
    related: ["reorder-pages", "remove-pages", "extract-pages", "merge-pdf"],
  },

  "reorder-pages": {
    metaTitle: "Reorder PDF Pages Online — Free & Private",
    metaDescription:
      "Drag and drop to rearrange PDF pages into any order you want, free and private. No upload — the whole file stays and processes right on your own device.",
    h1: "Reorder PDF Pages — Free, Drag-and-Drop Tool",
    intro: [
      "This tool lets you rearrange the pages of a PDF by dragging thumbnails into a new order — fixing a scan that came out of sequence, moving an appendix to the back, or putting a cover page first.",
      "Reordering happens visually: you see every page as a thumbnail and drag them directly into the order you want, then the tool rebuilds the PDF with that exact page sequence using pdf-lib in your browser. There's no upload step, so the whole thing works as fast as your device can render the thumbnails, and it works offline once the page has loaded.",
      "Since pages are moved, not modified, everything about each page — text, images, links, annotations — stays exactly as it was in the source document. This is a genuinely common fix: PDFs assembled from multiple scans or exports often end up with pages in the wrong order, and re-scanning or rebuilding the whole file from scratch is far more work than just dragging the pages into place.",
      "It's especially useful right after merging several PDFs together, when the pieces landed in a slightly different order than intended, or after scanning a stack of loose paper where a few sheets ended up out of sequence. Because you can see every page as a real thumbnail while dragging, it's easy to spot at a glance whether the final order is correct before saving, rather than having to open the finished file separately to check.",
      "It pairs naturally with merging and splitting — reorder right after combining several files, or fix the sequence of a document before splitting it into individually correct pieces.",
    ],
    howTo: [
      "Upload the PDF you want to reorder.",
      "Drag the page thumbnails into the order you want.",
      "Double-check the new page sequence in the preview.",
      "Tap \"Save\" (or equivalent) and download the reordered PDF.",
    ],
    faqs: [
      {
        q: "Can I move a single page to any position, not just swap two?",
        a: "Yes, drag any page thumbnail to any position — the rest of the pages shift around it automatically.",
      },
      {
        q: "Is my document uploaded to reorder it?",
        a: "No, the whole process runs locally in your browser using pdf-lib — your file never leaves your device.",
      },
      {
        q: "Does reordering affect page quality or content?",
        a: "No, pages are only moved, not modified — content, links, and quality stay exactly as they were.",
      },
      {
        q: "Does it work on a touchscreen?",
        a: "Yes, dragging pages works with touch as well as a mouse, so it's fully usable on a phone or tablet.",
      },
      {
        q: "Is there a limit on document length?",
        a: "No fixed limit — very long documents just take a little longer to render thumbnails for.",
      },
    ],
    related: ["rotate-pages", "merge-pdf", "extract-pages", "split-pdf"],
  },

  // ---------- Optimize ----------
  "compress-pdf": {
    metaTitle: "Compress PDF Online Free — Offline PDF Compressor",
    metaDescription:
      "Shrink PDF file size by up to 90% for free. Five presets, or type an exact target size like 500KB — a real offline PDF compressor, not just a re-save trick.",
    h1: "Compress PDF Online — Free Offline PDF Compressor",
    intro: [
      "This tool actually shrinks your PDF's file size, rather than just re-saving it with a smaller number attached. It works by finding every embedded image inside the PDF, downsampling it to a target resolution, and re-encoding it at a chosen quality level — the same category of technique desktop compression software uses, running fully in your browser via pdf.js and an image-recompression pipeline.",
      "There are five presets — Minimal, Light, Recommended, Strong, and Extreme — trading off quality against file size, plus a Target Size mode where you type an exact goal like \"500 KB\" and the tool searches across quality and resolution settings to get as close as it can, honestly reporting if a particular target genuinely isn't reachable rather than pretending to hit it. On a typical image-heavy scanned PDF, the Recommended preset alone can cut file size by more than half; more aggressive presets go further at the cost of visible image quality.",
      "Because compression happens entirely on-device — nothing is uploaded — it also means there's no file-size ceiling imposed by a server upload limit, and no watermark. The tool shows your original size, the new size, and the percentage saved side by side, plus a visual preview of page one before and after, so you can see exactly what a given preset does before committing to it. If a compressed result somehow comes out larger than the original (rare, but possible for already-optimized files), the tool flags it and lets you keep the original instead.",
      "This matters most for exactly the kind of PDF that's hardest to shrink well: a phone-scanned document or a report full of high-resolution photos, where file size balloons far beyond what the actual content needs for on-screen reading or email attachment limits. Since compression runs in a background Web Worker with a real progress bar, you can watch it work through a large file instead of staring at a frozen page, and everything happens on your own device regardless of file size.",
    ],
    howTo: [
      "Upload the PDF you want to shrink.",
      "Pick a preset (Minimal through Extreme) or switch to Target Size and type a goal like \"1 MB.\"",
      "Compare the before/after preview and the percentage saved.",
      "Download the compressed file, or keep the original if compression didn't help.",
    ],
    faqs: [
      {
        q: "Is this a real compressor, or does it just re-save the file?",
        a: "It's a real image-recompression pipeline — it decodes, downsamples, and re-encodes every embedded image, which is why it can achieve genuine 50%+ reductions on image-heavy PDFs, not the 2-3% you get from just re-saving.",
      },
      {
        q: "Can I compress a PDF to an exact size, like 500KB?",
        a: "Yes — switch to Target Size mode, type your goal, and the tool searches across quality/resolution settings to get as close as possible, and tells you honestly if that exact size isn't achievable.",
      },
      {
        q: "Does compressing reduce text quality or make it blurry?",
        a: "No — text and vector content are left alone; only embedded raster images are downsampled and re-encoded, so document text stays sharp.",
      },
      {
        q: "Is my PDF uploaded to compress it?",
        a: "No, the entire pipeline — decoding, resizing, re-encoding, rebuilding the PDF — runs in your browser using a Web Worker, so your file never leaves your device.",
      },
      {
        q: "Does it work on mobile for large scanned PDFs?",
        a: "Yes, it runs in a background Web Worker with a real progress bar, though very large scanned PDFs will naturally take longer on a phone than a laptop.",
      },
    ],
    related: ["ocr-pdf", "merge-pdf", "pdf-to-jpg", "add-watermark"],
  },

  "ocr-pdf": {
    metaTitle: "OCR PDF Free — Make Scanned PDFs Searchable",
    metaDescription:
      "Turn scanned PDFs into searchable, selectable text for free. Supports 10+ languages and runs offline in your browser — no upload, no per-page limit at all.",
    h1: "OCR a Scanned PDF Online — Free & Private",
    intro: [
      "This tool reads the text inside a scanned PDF — a document that's really just a picture of text, with nothing selectable or searchable — and produces a new PDF with an invisible, searchable text layer placed exactly over the original image, plus a plain .txt file of everything it recognized.",
      "It uses Tesseract, a genuinely capable open-source OCR engine, running entirely in your browser via WebAssembly. The first time you use a given language, it downloads a roughly 15MB language model, which is then cached so every OCR run after that is instant to start — we're upfront about that download rather than hiding it behind a silent delay. English and Hindi are supported alongside several other languages, and you can OCR just the pages you select instead of an entire long document.",
      "Recognition quality depends heavily on scan quality: crisp, high-contrast scans of typed text OCR very accurately, while blurry photos, tight handwriting, or low-contrast faxes will have more errors — this is a real limitation of OCR technology generally, not something specific to this tool. Because it runs client-side in a Web Worker, your document is never uploaded, which matters for anything scanned that shouldn't leave your device — IDs, medical paperwork, signed contracts.",
      "The most common reason people need this is a paper document that only exists as a phone photo or a flatbed scan — an old contract, a printed article, a form filled out by hand and then scanned — where you need to search for a specific word, copy a paragraph, or just make the file accessible to a screen reader. Once OCR'd, the searchable PDF behaves like any normal digital document for those purposes, while the plain-text export is useful for pasting content straight into an email or another document without retyping it.",
    ],
    howTo: [
      "Upload your scanned PDF.",
      "Choose the document's language from the picker.",
      "Select which pages to OCR (or leave all pages selected).",
      "Run OCR and download the searchable PDF and/or the plain text file.",
    ],
    faqs: [
      {
        q: "Which languages are supported?",
        a: "English and Hindi at minimum, plus several other major languages — pick the one that matches your document before running OCR.",
      },
      {
        q: "Why does it download something the first time I use it?",
        a: "OCR needs a language-specific recognition model (about 15MB) the first time you use that language. It's cached afterward, so every later use starts instantly.",
      },
      {
        q: "Is my scanned document uploaded to recognize the text?",
        a: "No — recognition runs entirely in your browser in a background Web Worker, so your file is never sent to a server.",
      },
      {
        q: "How accurate is the OCR on handwriting?",
        a: "OCR generally works best on typed or printed text with a clean scan. Handwriting recognition is much less reliable — expect more errors there than with printed text.",
      },
      {
        q: "Can I OCR only some pages instead of the whole document?",
        a: "Yes, use the page picker to select just the pages you need recognized, which also speeds up longer documents.",
      },
    ],
    related: ["compress-pdf", "add-text-image", "annotate-pdf", "summarize-pdf"],
  },

  // ---------- Edit ----------
  "add-text-image": {
    metaTitle: "Add Text & Images to PDF — Free, No Signup",
    metaDescription:
      "Type text or drop in images anywhere on a PDF page, free and unlimited. Drag, resize, and rotate freely — everything runs locally in your browser.",
    h1: "Add Text and Images to a PDF — Free Online Editor",
    intro: [
      "This tool lets you place editable text boxes and images anywhere on a PDF's pages — filling in a form that has no fillable fields, adding a note in the margin, dropping in a logo or a scanned signature, or labelling a diagram. You place elements by tapping the page, then drag, resize, and rotate them into position with on-screen handles, the same interaction model as a design app.",
      "Text supports font family, size, colour, bold, italic, underline, and alignment; images support PNG and JPG with optional locked aspect ratio while resizing, plus simple snap guides that help you center something on the page. Everything is \"flattened\" into the PDF's real content when you export, meaning the text and images become a permanent part of the page — not a movable overlay a viewer could accidentally drag around later.",
      "All of this happens directly in your browser: the page renders via pdf.js underneath an interactive canvas, and the final flattening is done with pdf-lib, so your document is never uploaded. It works with touch as well as mouse input, including pinch-to-resize, so placing and adjusting elements works the same on a phone as it does on a laptop.",
      "People use this to fill in a form that wasn't built with fillable fields, stamp a company logo onto a template, add a quick explanatory note next to a diagram, or label a photo before sending it on as a PDF. Because placement is entirely visual — you see exactly where the text or image sits on the real page as you drag it — it's much more direct than trying to describe a position or use a separate PDF form editor with rigid field placement.",
    ],
    howTo: [
      "Upload your PDF.",
      "Tap \"Add text\" or \"Add image,\" then tap the page where you want to place it.",
      "Drag to move it, use the corner handles to resize, and the top handle to rotate.",
      "Style text (font, size, colour) or adjust image aspect ratio from the panel below, then save.",
    ],
    faqs: [
      {
        q: "Can I edit text that's already in the PDF?",
        a: "No — this tool adds new text and images on top of the page; it doesn't let you edit existing text embedded in the original PDF.",
      },
      {
        q: "Will the text and images I add be movable after I download the file?",
        a: "No — everything is flattened into the page's actual content on export, so it becomes a permanent, non-movable part of the PDF.",
      },
      {
        q: "Does it work with touch, for placing things on a phone?",
        a: "Yes, dragging, resizing, and rotating all work with touch, including pinch gestures, not just a mouse.",
      },
      {
        q: "Can I add a logo or scanned signature image?",
        a: "Yes, upload a PNG or JPG image and place, resize, and rotate it anywhere on the page.",
      },
      {
        q: "Is my PDF uploaded while I'm editing it?",
        a: "No, the whole editor runs in your browser — your file is never sent to a server, even while you're actively placing elements.",
      },
    ],
    related: ["annotate-pdf", "esign-pdf", "add-watermark", "add-page-numbers"],
  },

  "annotate-pdf": {
    metaTitle: "Annotate PDF Online Free — Highlight & Draw",
    metaDescription:
      "Highlight text, draw, and add sticky notes on a PDF for free. Pen, shapes, and real text-highlighting — all running in your browser, nothing ever uploaded.",
    h1: "Annotate a PDF Online — Free, Private, No Signup",
    intro: [
      "This tool adds real annotations to a PDF — freehand pen strokes, a semi-transparent highlighter, shapes (rectangles, circles, lines, arrows), sticky notes, and a text-highlighter that snaps to actual lines of text rather than just drawing a rough box over them. It's built for marking up a draft, highlighting key clauses in a contract, or sketching a quick diagram directly on a page.",
      "The text-highlight tool specifically uses the PDF's real text positions (via pdf.js) to find and highlight whole lines accurately, rather than eyeballing a semi-transparent rectangle. Every annotation supports undo/redo, layering (bring to front / send to back), and full touch support, including pinch-to-resize — you can annotate comfortably on a phone, not just a desktop with a mouse.",
      "On export, everything is flattened permanently into the PDF, so your annotations become part of the document rather than a separate, removable layer. As with the rest of the editing tools, all of this runs in your browser: the page renders via pdf.js, your annotations live on an interactive canvas, and pdf-lib bakes them into the final file — nothing about your document is ever uploaded.",
      "This gets used for the everyday work of reviewing something on paper's digital equivalent — circling a figure that looks off in a report, highlighting the clause a client should look at in a contract, sketching an arrow between two points on a diagram, or leaving a sticky note with a quick comment for a collaborator. Because every tool works with touch, it holds up well for marking up a document on a tablet during a meeting, not just at a desktop with a mouse.",
      "Layering support means a sticky note or shape can sit cleanly above or below other annotations, so a busy, heavily marked-up page still stays readable and organized rather than becoming a jumble.",
    ],
    howTo: [
      "Upload your PDF.",
      "Pick a tool from the toolbar — pen, highlighter, shape, sticky note, or text-highlight.",
      "Draw directly on the page; switch to Select to move, resize, or delete anything you've added.",
      "Save to flatten your annotations permanently into the PDF and download it.",
    ],
    faqs: [
      {
        q: "Can I highlight actual text, not just draw a box over it?",
        a: "Yes — the text-highlight tool uses the PDF's real text positions to snap to whole lines, so it lines up accurately instead of approximating with a rectangle.",
      },
      {
        q: "Can I undo a mistake?",
        a: "Yes, undo and redo are supported for every annotation you make, up to the last several actions.",
      },
      {
        q: "Will my annotations be removable after I download the file?",
        a: "No — annotations are flattened into the page's actual content on export, so they become a permanent part of the PDF.",
      },
      {
        q: "Does drawing work on a touchscreen?",
        a: "Yes, the whole canvas is built on native touch/pointer events, including pinch gestures, so it works naturally on phones and tablets.",
      },
      {
        q: "Is my document uploaded while I'm annotating it?",
        a: "No, annotation happens entirely in your browser — nothing is sent to a server at any point.",
      },
    ],
    related: ["add-text-image", "add-watermark", "esign-pdf", "redact-pdf"],
  },

  "add-page-numbers": {
    metaTitle: "Add Page Numbers to a PDF — Free & Private",
    metaDescription:
      "Add page numbers to a PDF in any style or position, free and unlimited. Skip pages, set a start number, and preview live — no upload required at all.",
    h1: "Add Page Numbers to a PDF — Free Online Tool",
    intro: [
      "This tool stamps page numbers onto every page of a PDF, with control over position (any of nine spots on the page), format — plain \"1\", \"1 of 10\", \"Page 1\", \"- 1 -\", or a fully custom pattern using {n} and {total} — plus a custom start number, which page counts as \"page 1\", and specific pages to skip (a cover page, for instance).",
      "You get a live preview showing the number rendered on an actual page before you commit, so you can check the font size, colour, and position look right at a glance rather than exporting blind and re-doing it. The numbering is added directly into the PDF's real content with pdf-lib, running entirely in your browser — there's no upload step and no limit on document length.",
      "This is a common finishing step for anything that's going to be printed or referenced by page — a thesis, a contract, a report — and doing it by hand in a PDF editor is fiddly, especially if you need to skip a cover page or start counting from something other than 1. This tool handles those specific cases directly rather than forcing a one-size-fits-all numbering scheme.",
      "It's particularly useful for academic or legal documents where a specific citation or clause needs to be referenced by exact page number, and for any long report where readers will naturally ask \"what page is that on\" during a discussion. Because a cover page or table of contents can be excluded from the count entirely, the numbering that appears matches how people actually refer to the document, rather than being off by however many front pages exist before the content starts.",
      "The nine-position grid also means numbers can sit wherever fits the document's existing layout best, rather than being forced into a single fixed corner regardless of what else is already printed there.",
    ],
    howTo: [
      "Upload your PDF.",
      "Choose a position on the page (one of nine grid spots) and a number format.",
      "Set a start number and pick any pages to skip, like a cover page.",
      "Check the live preview, then add the numbers and download.",
    ],
    faqs: [
      {
        q: "Can I start numbering from something other than 1?",
        a: "Yes, set any start number, and pick which page in the document that number should apply to first.",
      },
      {
        q: "Can I skip a cover page or table of contents?",
        a: "Yes, use the page picker to exclude specific pages from being numbered.",
      },
      {
        q: "What number formats are available?",
        a: "Plain numbers, \"1 of 10\", \"Page 1\", \"- 1 -\", or a fully custom pattern using {n} for the number and {total} for the page count.",
      },
      {
        q: "Can I preview where the numbers will appear before exporting?",
        a: "Yes, a live preview shows the number rendered on an actual page, so you can adjust position and style before committing.",
      },
      {
        q: "Is my document uploaded to add page numbers?",
        a: "No, the whole process runs in your browser — your PDF is never sent to a server.",
      },
    ],
    related: ["add-header-footer", "add-watermark", "annotate-pdf", "merge-pdf"],
  },

  "add-watermark": {
    metaTitle: "Add Watermark to PDF Free — Text or Image",
    metaDescription:
      "Add a text or image watermark to a PDF for free — tiled or positioned, in front of or behind your content. No upload, no signup, live preview included.",
    h1: "Add a Watermark to a PDF — Free, No Signup",
    intro: [
      "This tool stamps a watermark — either your own text (like \"CONFIDENTIAL\" or \"DRAFT\") or an image (like a logo) — across a PDF's pages. You control opacity, rotation angle, size, and position: any of nine fixed spots on the page, or a full tiled pattern repeating across the whole page for stronger deterrence against unauthorized copies.",
      "A genuinely useful option here is choosing whether the watermark sits in front of your content or behind it. \"Behind\" mode places the watermark under the existing text and images so the original content stays fully legible with the watermark as a subtle background layer — implemented by reordering the PDF's content streams rather than rebuilding the page, which also means original annotations and links are left completely untouched.",
      "You can apply the watermark to every page or only a specific range using the page picker, and a live preview shows exactly how it will look — including a full tiled-grid preview when that mode is selected — before you commit. As with the rest of the editing tools, everything runs in your browser via pdf-lib, so your document is never uploaded.",
      "Marking a draft as \"DRAFT\" or a confidential report as \"CONFIDENTIAL\" is the most common use, but a tiled logo watermark across every page also discourages a shared PDF from being redistributed without attribution — useful for anything from a portfolio sample to a paid course PDF. Since the source content stays completely intact underneath a watermark placed in \"behind\" mode, this works even on documents where the recipient still needs to read every word normally.",
      "Choosing opacity carefully matters here: a light, subtle watermark signals ownership without distracting from the content, while a bold, high-opacity one is more appropriate when the goal is actively discouraging misuse of a sensitive draft.",
    ],
    howTo: [
      "Upload your PDF.",
      "Choose text or image, then set opacity, rotation, and size.",
      "Pick a position — one of nine spots, or tile it across the whole page.",
      "Choose front or behind content, apply to all pages or a range, then download.",
    ],
    faqs: [
      {
        q: "Can the watermark go behind my existing text instead of covering it?",
        a: "Yes — \"behind\" mode places the watermark under your content so the original text and images stay fully legible.",
      },
      {
        q: "Can I use my own logo as a watermark instead of text?",
        a: "Yes, upload a PNG or JPG image to use as the watermark instead of typed text.",
      },
      {
        q: "Can I apply it to only some pages?",
        a: "Yes, use the page picker to apply the watermark to a specific range instead of the whole document.",
      },
      {
        q: "Does adding a watermark affect existing links or annotations?",
        a: "No — the watermark is layered in without touching the page's existing annotations or links.",
      },
      {
        q: "Is this free for tiled, full-page watermarks too?",
        a: "Yes, tiled/repeating watermarks are included free, same as every other option in the tool.",
      },
    ],
    related: ["add-page-numbers", "add-header-footer", "password-protect", "add-text-image"],
  },

  "add-header-footer": {
    metaTitle: "Add Header & Footer to PDF — Free, No Signup",
    metaDescription:
      "Add a custom header and footer to a PDF for free, with page numbers, dates, and filenames. Left/center/right layout, a live preview, and no upload ever.",
    h1: "Add Header and Footer to a PDF — Free Online Tool",
    intro: [
      "This tool adds a header and/or footer to every page of a PDF, with independently editable left, centre, and right slots in each — so you can put a document title on the left, the page number in the centre, and a date on the right, for example. Dynamic tokens fill in automatically: {page} and {total} for numbering, {date} for the current date, and {filename} for the document's name.",
      "You control font, size, colour, and margin, and a live preview shows the header/footer positioned on an actual page before you export, so there's no guessing how it'll look. You can apply it across the whole document or just a specific page range using the page picker — useful if a cover page shouldn't carry the same footer as the rest of the report.",
      "This is standard practice for anything formal — reports, theses, contracts — where a consistent header or footer signals a finished, professional document rather than a loose PDF. As with the rest of the editing tools here, it's applied directly into the PDF's real content using pdf-lib, entirely in your browser, so nothing is uploaded.",
      "A running footer with the document title and page count helps anyone who prints the file keep loose pages in order, while a header with the current date is useful for anything that gets revised and reprinted periodically, like a policy document or a price list. Because the {filename} token pulls the document's actual name automatically, it also saves the small hassle of retyping a title that might change if the file itself gets renamed later.",
      "Setting up header and footer text once and applying it across an entire long document is far faster than editing a master template and re-exporting from whatever program originally created the file.",
    ],
    howTo: [
      "Upload your PDF.",
      "Fill in the left/centre/right slots for the header and/or footer, using tokens like {page}, {total}, {date}, or {filename}.",
      "Adjust font size, colour, and margin, and check the live preview.",
      "Apply to all pages or a specific range, then download.",
    ],
    faqs: [
      {
        q: "What dynamic tokens are supported?",
        a: "{page} and {total} for page numbering, {date} for today's date, and {filename} for the document's name — mix them with your own text in any slot.",
      },
      {
        q: "Can I have different content in the left, centre, and right of the footer?",
        a: "Yes, each of the three slots in the header and footer is edited independently.",
      },
      {
        q: "Can I apply it to only some pages?",
        a: "Yes, use the page picker to restrict the header/footer to a specific page range instead of the whole document.",
      },
      {
        q: "Can I preview it before exporting?",
        a: "Yes, a live preview shows the header/footer positioned on an actual page so you can check font, size, and spacing first.",
      },
      {
        q: "Is my document uploaded to add a header or footer?",
        a: "No — this runs entirely in your browser, so your PDF is never sent to a server.",
      },
    ],
    related: ["add-page-numbers", "add-watermark", "add-text-image", "merge-pdf"],
  },

  // ---------- Security ----------
  "password-protect": {
    metaTitle: "Password Protect PDF — Free AES-256 Encryption",
    metaDescription:
      "Encrypt a PDF with a real password for free — genuine AES-256 encryption, not a fake lock. Set permissions for printing and copying. No upload, ever.",
    h1: "Password Protect a PDF — Free, Real AES-256 Encryption",
    intro: [
      "This tool encrypts a PDF with a password using AES-256, the same encryption standard used for genuinely sensitive data — not a cosmetic \"lock\" that just hides a file behind an app-level password check. Once encrypted, any PDF reader (not just this site) will refuse to open the file without the correct password, because the encryption is baked into the PDF format itself.",
      "You set a password with a confirm field and a strength hint, and can optionally restrict permissions — for instance, allowing someone to view a document without being able to print or copy text out of it. Encryption happens entirely in your browser: your file, and the password you choose, are never transmitted anywhere, which matters given the sensitivity of anything worth password-protecting in the first place.",
      "It's worth being clear about what this does and doesn't protect against: it stops someone from opening the file without the password, which is real, meaningful protection for a document sent over email or stored on a shared drive. It isn't a substitute for physical device security or account security — if someone has both your device and the password, the encryption isn't doing any more work at that point.",
      "This is the right tool for anything genuinely sensitive that has to travel somewhere less trusted than your own inbox — tax documents shared with an accountant, a contract sent through a work channel you don't fully control, financial statements attached to an email. Because the strength hint reacts as you type, it's easy to tell at a glance whether a password is likely to actually resist a guessing attempt, rather than assuming any password is equally protective.",
      "Restricting printing or copying separately from the open password is also useful when a document should be readable but not easily redistributed further, such as a proprietary report shared for review only.",
    ],
    howTo: [
      "Upload the PDF you want to protect.",
      "Enter and confirm a password — check the strength hint as you type.",
      "Optionally restrict permissions, like disallowing printing or copying.",
      "Tap \"Protect PDF\" and download the encrypted file.",
    ],
    faqs: [
      {
        q: "Is this real encryption, or just a password prompt?",
        a: "It's genuine AES-256 encryption applied to the PDF file itself — any standard PDF reader will require the correct password to open it, not just this site.",
      },
      {
        q: "Is my password sent anywhere?",
        a: "No — encryption happens entirely in your browser, so neither your file nor the password you set ever leaves your device.",
      },
      {
        q: "Can I restrict printing or copying separately from the open password?",
        a: "Yes, you can set permissions to allow opening the file while restricting actions like printing or copying text.",
      },
      {
        q: "What happens if I forget the password?",
        a: "There's no way to recover it — encryption is real, so a lost password means the file genuinely can't be opened. Store it somewhere safe.",
      },
      {
        q: "Does this work on any PDF, or only ones created here?",
        a: "It works on any standard PDF you upload, regardless of where it came from.",
      },
    ],
    related: ["unlock-pdf", "redact-pdf", "esign-pdf", "compress-pdf"],
  },

  "unlock-pdf": {
    metaTitle: "Unlock PDF Online Free — Remove Known Password",
    metaDescription:
      "Remove a password you already know from a protected PDF, for free. A wrong password gets a clear message — this doesn't crack files you can't access.",
    h1: "Remove a Password From a PDF — Free, No Upload",
    intro: [
      "This tool removes password protection from a PDF, producing an unlocked copy that opens without a password from then on. It's built for a specific, common situation: you have a PDF that's password-protected, and you already know the password, but you're tired of typing it in every time or need to share the content with someone who shouldn't need the password too.",
      "To be direct about what this is not: it does not crack, guess, or bypass a password on a file you don't have the password for. If you don't know the password, this tool won't help — it decrypts the file properly using the password you provide, the same as any PDF reader would, and it will tell you plainly if the password you entered is wrong.",
      "The whole process runs locally in your browser: the file is decrypted with the password you supply, then re-saved without encryption, and none of that — the file or the password — ever leaves your device. This matters since anything worth removing a password from is, by definition, something you were treating as sensitive.",
      "A common case is a PDF a bank, employer, or government portal sends out password-protected by default — often locked with something predictable like a date of birth or the last four digits of an ID number, which you already know — and you'd rather not re-enter it every single time you open the file. Once unlocked, the file behaves like any normal PDF: it opens instantly in any viewer, and can be attached, merged, or edited by other tools without needing the password again first.",
      "It's also the natural first step before running an unlocked file through another tool here — merging it with other documents or adding a watermark, for instance — since most editing tools expect to work with an unencrypted PDF.",
    ],
    howTo: [
      "Upload the password-protected PDF.",
      "Enter the password you already know for this file.",
      "Tap \"Unlock PDF.\"",
      "Download the unlocked copy, which opens without a password from then on.",
    ],
    faqs: [
      {
        q: "Can this crack a password I don't know?",
        a: "No — this removes a password you already have, using it exactly as a PDF reader would. It cannot guess or bypass a password you don't know.",
      },
      {
        q: "What happens if I enter the wrong password?",
        a: "You'll get a clear, friendly error telling you the password doesn't match — nothing crashes or silently fails.",
      },
      {
        q: "Is my password or file uploaded anywhere?",
        a: "No, decryption happens entirely in your browser — neither the file nor the password you enter ever leaves your device.",
      },
      {
        q: "Does the unlocked file work in every PDF reader afterward?",
        a: "Yes, once unlocked, the file opens normally in any PDF reader, with no password required.",
      },
      {
        q: "Is this free with no limit?",
        a: "Yes, unlocking is free with no file-count limit or account requirement.",
      },
    ],
    related: ["password-protect", "redact-pdf", "esign-pdf", "compress-pdf"],
  },

  "esign-pdf": {
    metaTitle: "eSign PDF Free — Sign Documents Online, No Signup",
    metaDescription:
      "Sign a PDF for free — draw, type, or upload your signature, then place it anywhere on any page. Flattened permanently into the file. No account needed.",
    h1: "eSign a PDF Online — Free, No Account Needed",
    intro: [
      "This tool lets you sign a PDF directly in your browser: draw your signature with a mouse or finger, type your name in a handwriting-style script font, or upload an image of your actual signature — whichever you're most comfortable with. Once created, drag your signature onto any page, resize and rotate it into place with on-screen handles, and it's ready to export.",
      "Signatures are saved locally in your browser so you can reuse the same one across multiple documents without redrawing it every time, and on export the signature is permanently flattened into the PDF's actual page content — it becomes part of the document, not a movable overlay someone could drag away or delete after the fact.",
      "This tool is meant for adding your own signature to a document quickly and privately, not as a certified e-signature service with identity verification, audit trails, or legal-compliance certifications (the kind of thing services like DocuSign specialize in) — for straightforward personal or business signing where that heavier apparatus isn't needed, it does the job without an account, a subscription, or your document ever touching a server.",
      "It covers the everyday cases people actually run into: signing a lease or a permission slip, initialing each page of an agreement, or adding a signature to a form that would otherwise need to be printed, signed by hand, and scanned back in. Typing your name in a script font is the fastest option when a quick, legible signature is all that's needed; drawing or uploading an image of your real signature suits anything where matching your usual handwritten signature matters more.",
      "Saving a signature once and reusing it means a multi-page contract needing initials on every page takes seconds per page instead of redrawing your signature each time.",
    ],
    howTo: [
      "Upload the PDF you need to sign.",
      "Tap \"Add signature,\" then draw, type, or upload your signature.",
      "Drag it onto the page, and resize or rotate it into position.",
      "Save to flatten the signature into the PDF and download the signed file.",
    ],
    faqs: [
      {
        q: "Can I reuse the same signature on multiple documents?",
        a: "Yes, signatures you create are saved in your browser's local storage, so you can place the same one again without redrawing it.",
      },
      {
        q: "Will my signature stay editable or movable after I download the file?",
        a: "No — it's flattened into the page's real content on export, becoming a permanent part of the PDF, not a layer that can be moved or removed afterward.",
      },
      {
        q: "Is this a legally certified e-signature service like DocuSign?",
        a: "No — this adds your signature to a document quickly and privately, without the identity verification or audit-trail features of a certified e-signature service.",
      },
      {
        q: "Is my document uploaded while I'm signing it?",
        a: "No, the whole process runs in your browser — your file is never sent to a server.",
      },
      {
        q: "Can I place my signature on any page, not just the first?",
        a: "Yes, navigate to any page in the document and place your signature there.",
      },
    ],
    related: ["add-text-image", "password-protect", "redact-pdf", "annotate-pdf"],
  },

  "redact-pdf": {
    metaTitle: "Redact PDF Online Free — Permanently Hide Text",
    metaDescription:
      "Permanently redact sensitive text in a PDF for free — genuinely destroyed, not just covered. Redact Aadhaar numbers, SSNs, or private data safely offline.",
    h1: "Redact a PDF Online — Free, Genuinely Permanent",
    intro: [
      "This tool permanently removes sensitive information from a PDF — an Aadhaar or Social Security number, an account number, a name — by drawing black boxes over it and then converting the affected page into a flattened image. That last step is the part that actually matters: the underlying text is destroyed, not just visually covered, so it can't be recovered by selecting, copying, or searching the file afterward.",
      "A lot of \"redaction\" tools online just draw a black rectangle on top of the text while leaving the original text sitting underneath it in the PDF's data — trivially recoverable by anyone who selects the \"blacked-out\" area or runs a text search. This tool avoids that entirely by re-rendering any page with a redaction box as a picture of that page with the box burned in, so there's no text layer left to extract at all.",
      "The tradeoff, which the tool is upfront about: any page containing a redaction box becomes an image, so text elsewhere on that same page also stops being selectable or searchable — an unavoidable consequence of making the redaction genuinely permanent. Pages with no redaction boxes are left completely untouched, keeping their original selectable text. Everything runs in your browser, so a document containing something as sensitive as a government ID number is never uploaded anywhere in the process.",
      "This matters a great deal for documents shared in India specifically, where an Aadhaar number is routinely printed on bank forms, rental agreements, and ID copies people are asked to share — and where a black box that merely sits on top of the number in a normal PDF editor is not real redaction, since the digits are still sitting in the file's text layer underneath, extractable in seconds by anyone who knows to try. The same applies to a Social Security number, a passport number, or an account number on any document you need to share more widely than the original was intended for.",
    ],
    howTo: [
      "Upload the PDF containing sensitive information.",
      "Switch to \"Draw\" mode and drag boxes over each area you want to redact.",
      "Switch to \"Select\" mode to adjust or remove a box if needed.",
      "Tap \"Redact & Save\" — affected pages are rasterized and the file downloads.",
    ],
    faqs: [
      {
        q: "Is the redacted text actually gone, or just covered by a black box?",
        a: "Actually gone. Any page with a redaction box is converted into a flattened image, which destroys the underlying text rather than just visually hiding it.",
      },
      {
        q: "Can I use this to redact an Aadhaar number or SSN safely?",
        a: "Yes — draw a box over the number, and once exported, that page becomes an image with the number genuinely destroyed, not recoverable by copying or searching.",
      },
      {
        q: "Will other text on the same page still be selectable?",
        a: "No — because the whole page is converted to an image to guarantee the redacted text is destroyed, the rest of that page's text also stops being selectable. Other pages without redaction boxes are unaffected.",
      },
      {
        q: "Is my document uploaded to redact it?",
        a: "No, the entire process — drawing boxes, rendering, rasterizing — happens in your browser, so your file never leaves your device.",
      },
      {
        q: "How can I be sure the text is really gone?",
        a: "Try searching the exported PDF for the redacted text yourself — since the page is now an image, there's no text there to find.",
      },
    ],
    related: ["password-protect", "esign-pdf", "annotate-pdf", "compress-pdf"],
  },

  // ---------- AI ----------
  "summarize-pdf": {
    metaTitle: "AI PDF Summarizer Free — Quick Document Summary",
    metaDescription:
      "Get a free AI summary of a long PDF in seconds. Choose short, detailed, or bullet-point style. Text extraction is local — only the text is sent to AI.",
    h1: "Summarize a PDF With AI — Free, Fast Document Summary",
    intro: [
      "This tool reads a long PDF and produces a summary — short, detailed, or as bullet points, whichever you need — using Google's Gemini AI model. It's built for skimming a long report, a research paper, or a contract quickly, when reading the whole thing isn't practical.",
      "Unlike every other tool on this site, this one genuinely isn't fully private: text extraction from your PDF happens locally in your browser, but that extracted text is then sent to Google's Gemini API to generate the summary, since running a capable AI model entirely on-device isn't realistic yet. We're upfront about this with a clear notice before you use it, and only the extracted text is sent — never the original file itself.",
      "There are real limits worth knowing: documents are capped at 50 pages or 100,000 characters, whichever comes first, since AI summarization quality and cost both degrade on very long inputs. If a PDF is a scanned image with no real text layer (and hasn't been OCR'd first), there's nothing for this tool to extract or summarize — run it through the OCR tool first in that case.",
      "This is built for getting the gist of something long before deciding whether to read the whole thing — a research paper you're evaluating for relevance, a lengthy contract before a call with a lawyer, a long report before a meeting where you need the key points rather than every detail. The bullet-point format works well for scanning key facts quickly, while the detailed option is better when you need enough context to discuss the document intelligently without having read every page yourself.",
      "The short option is useful for quickly checking whether a document is even relevant to what you're looking for, before spending time on a more detailed summary or the full document itself.",
    ],
    howTo: [
      "Upload your PDF (up to 50 pages or 100,000 characters).",
      "Choose a summary style — short, detailed, or bullet points.",
      "Tap \"Summarize with AI.\"",
      "Read or download the generated summary as a text file.",
    ],
    faqs: [
      {
        q: "Is this tool as private as the others on the site?",
        a: "No, and we say so clearly before you use it — text extraction is local, but the extracted text is sent to Google's Gemini API to generate the summary. The original file itself is never uploaded.",
      },
      {
        q: "Is there a document length limit?",
        a: "Yes — up to 50 pages or 100,000 characters, whichever limit is reached first, to keep summaries fast and accurate.",
      },
      {
        q: "Can I choose how long the summary is?",
        a: "Yes, pick short (a couple of sentences), bullet points, or a detailed multi-paragraph summary.",
      },
      {
        q: "What happens if my PDF is a scanned image?",
        a: "If there's no real text layer to extract, there's nothing to summarize — run the document through the OCR tool first, then summarize the result.",
      },
      {
        q: "Is this free, and is there a rate limit?",
        a: "It's free to use. There are modest rate limits in place to keep the tool available for everyone, since each summary has a real API cost behind it.",
      },
    ],
    related: ["ocr-pdf", "compress-pdf", "add-text-image", "annotate-pdf"],
  },
};

export function getToolSeoContent(slug: string): ToolSeoContent | undefined {
  return toolSeoContent[slug];
}
