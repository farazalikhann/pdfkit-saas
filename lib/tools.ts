import {
  FileSpreadsheet,
  ImageIcon,
  FileText,
  Globe,
  Combine,
  Scissors,
  FileOutput,
  FileMinus,
  RotateCw,
  ListOrdered,
  Minimize2,
  ScanText,
  Type,
  Highlighter,
  Hash,
  Stamp,
  PanelTop,
  Lock,
  Unlock,
  PenTool,
  EyeOff,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import type { CategorySlug } from "./categories";
import { isSummarizeEnabled } from "./ai/is-enabled";

/** react-dropzone-style accept map: MIME type -> file extensions */
export type AcceptMap = Record<string, string[]>;

export interface ToolDefinition {
  slug: string;
  name: string;
  /** Short label for the 2-column home grid card */
  shortName: string;
  category: CategorySlug;
  description: string;
  icon: LucideIcon;
  /** True when the whole pipeline runs in-browser (shows the "never leaves your device" badge) */
  isClientSide: boolean;
  /** False = ToolShell renders with a TODO panel instead of a working action */
  isImplemented: boolean;
  accept: AcceptMap;
  multiple: boolean;
  maxFiles: number;
  /** File name suffix / extension used for the result download, e.g. "merged.pdf" */
  resultFileName: string;
  keywords: string[];
}

const PDF_ACCEPT: AcceptMap = { "application/pdf": [".pdf"] };
const IMAGE_ACCEPT: AcceptMap = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

export const tools: ToolDefinition[] = [
  // ---------- Convert ----------
  // Note: PDF-to-Word, PDF-to-Excel, PDF-to-PPT, and PPT-to-PDF are deliberately
  // absent — none can be done to an acceptable quality with free, client-side-only
  // libraries, so they were removed rather than shipped rough or as fake scaffolds.
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    shortName: "PDF → JPG",
    category: "convert",
    description: "Export every page of a PDF as a JPG or PNG image.",
    icon: ImageIcon,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "pages.zip",
    keywords: ["jpg", "jpeg", "png", "image", "export"],
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    shortName: "Word → PDF",
    category: "convert",
    description: "Convert .docx documents into shareable PDF files.",
    icon: FileText,
    isClientSide: true,
    isImplemented: true,
    accept: {
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: false,
    maxFiles: 1,
    resultFileName: "converted.pdf",
    keywords: ["word", "docx", "import"],
  },
  {
    slug: "excel-to-pdf",
    name: "Excel to PDF",
    shortName: "Excel → PDF",
    category: "convert",
    description: "Convert spreadsheets into print-ready PDF tables.",
    icon: FileSpreadsheet,
    isClientSide: true,
    isImplemented: true,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    multiple: false,
    maxFiles: 1,
    resultFileName: "converted.pdf",
    keywords: ["excel", "xlsx", "xls", "csv", "spreadsheet"],
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    shortName: "JPG → PDF",
    category: "convert",
    description: "Combine one or more images into a single PDF.",
    icon: ImageIcon,
    isClientSide: true,
    isImplemented: true,
    accept: IMAGE_ACCEPT,
    multiple: true,
    maxFiles: 50,
    resultFileName: "images.pdf",
    keywords: ["jpg", "jpeg", "png", "image", "import"],
  },
  {
    slug: "html-to-pdf",
    name: "HTML to PDF",
    shortName: "HTML → PDF",
    category: "convert",
    description: "Render a web page or HTML file as a PDF document.",
    icon: Globe,
    isClientSide: false,
    isImplemented: true,
    accept: { "text/html": [".html", ".htm"] },
    multiple: false,
    maxFiles: 1,
    resultFileName: "page.pdf",
    keywords: ["html", "web", "url"],
  },

  // ---------- Organize ----------
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    shortName: "Merge PDF",
    category: "organize",
    description: "Combine multiple PDFs into one document, in any order.",
    icon: Combine,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: true,
    maxFiles: 50,
    resultFileName: "merged.pdf",
    keywords: ["combine", "join"],
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    shortName: "Split PDF",
    category: "organize",
    description: "Split a PDF into separate files by page range.",
    icon: Scissors,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "split.zip",
    keywords: ["divide", "separate"],
  },
  {
    slug: "extract-pages",
    name: "Extract Pages",
    shortName: "Extract Pages",
    category: "organize",
    description: "Pull specific pages out of a PDF into a new file.",
    icon: FileOutput,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "extracted.pdf",
    keywords: ["pull", "pages"],
  },
  {
    slug: "remove-pages",
    name: "Remove Pages",
    shortName: "Remove Pages",
    category: "organize",
    description: "Delete unwanted pages from a PDF document.",
    icon: FileMinus,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "pages-removed.pdf",
    keywords: ["delete", "pages"],
  },
  {
    slug: "rotate-pages",
    name: "Rotate Pages",
    shortName: "Rotate Pages",
    category: "organize",
    description: "Rotate one, several, or all pages of a PDF.",
    icon: RotateCw,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "rotated.pdf",
    keywords: ["turn", "orientation"],
  },
  {
    slug: "reorder-pages",
    name: "Reorder Pages",
    shortName: "Reorder Pages",
    category: "organize",
    description: "Drag and drop page thumbnails to change their order.",
    icon: ListOrdered,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "reordered.pdf",
    keywords: ["drag", "order", "arrange"],
  },

  // ---------- Optimize ----------
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    shortName: "Compress PDF",
    category: "optimize",
    description: "Shrink file size with five presets, or target an exact size.",
    icon: Minimize2,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "compressed.pdf",
    keywords: ["shrink", "size", "reduce"],
  },
  {
    slug: "ocr-pdf",
    name: "OCR Scanned PDF",
    shortName: "OCR PDF",
    category: "optimize",
    description: "Make scanned PDFs searchable and selectable with OCR.",
    icon: ScanText,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "ocr.pdf",
    keywords: ["scan", "text recognition"],
  },

  // ---------- Edit ----------
  {
    slug: "add-text-image",
    name: "Add Text & Images",
    shortName: "Add Text/Image",
    category: "edit",
    description: "Place text boxes and images anywhere on a PDF page.",
    icon: Type,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "edited.pdf",
    keywords: ["text", "image", "insert"],
  },
  {
    slug: "annotate-pdf",
    name: "Annotate & Highlight",
    shortName: "Annotate",
    category: "edit",
    description: "Highlight, draw and add sticky notes on any page.",
    icon: Highlighter,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "annotated.pdf",
    keywords: ["highlight", "draw", "markup", "comment"],
  },
  {
    slug: "add-page-numbers",
    name: "Add Page Numbers",
    shortName: "Page Numbers",
    category: "edit",
    description: "Insert page numbers with custom position and style.",
    icon: Hash,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "numbered.pdf",
    keywords: ["numbers", "pagination"],
  },
  {
    slug: "add-watermark",
    name: "Add Watermark",
    shortName: "Watermark",
    category: "edit",
    description: "Stamp a text or image watermark across every page.",
    icon: Stamp,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "watermarked.pdf",
    keywords: ["stamp", "brand", "logo"],
  },
  {
    slug: "add-header-footer",
    name: "Add Header & Footer",
    shortName: "Header/Footer",
    category: "edit",
    description: "Add repeating header or footer text to every page.",
    icon: PanelTop,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "with-header.pdf",
    keywords: ["header", "footer"],
  },

  // ---------- Security ----------
  {
    slug: "password-protect",
    name: "Password Protect",
    shortName: "Add Password",
    category: "security",
    description: "Encrypt a PDF with a password so only you can open it.",
    icon: Lock,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "protected.pdf",
    keywords: ["encrypt", "lock", "secure"],
  },
  {
    slug: "unlock-pdf",
    name: "Unlock PDF",
    shortName: "Unlock PDF",
    category: "security",
    description: "Remove a known password from a protected PDF.",
    icon: Unlock,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "unlocked.pdf",
    keywords: ["decrypt", "remove password"],
  },
  {
    slug: "esign-pdf",
    name: "eSign PDF",
    shortName: "eSign",
    category: "security",
    description: "Draw your signature and place it anywhere on a page.",
    icon: PenTool,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "signed.pdf",
    keywords: ["signature", "sign"],
  },
  {
    slug: "redact-pdf",
    name: "Redact PDF",
    shortName: "Redact",
    category: "security",
    description: "Permanently black out sensitive text or areas.",
    icon: EyeOff,
    isClientSide: true,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "redacted.pdf",
    keywords: ["hide", "censor", "black out"],
  },

  // ---------- AI Tools ----------
  {
    slug: "summarize-pdf",
    name: "Summarize PDF",
    shortName: "Summarize",
    category: "ai",
    description: "Generate a concise AI summary of a long document.",
    icon: BookOpen,
    isClientSide: false,
    isImplemented: true,
    accept: PDF_ACCEPT,
    multiple: false,
    maxFiles: 1,
    resultFileName: "summary.txt",
    keywords: ["ai", "summary", "tldr", "gemini"],
  },
];

export function getToolBySlug(slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.slug === slug);
}

/** All tools minus ones that are hidden at runtime (currently just Summarize without a Gemini key). */
export function getVisibleTools(): ToolDefinition[] {
  if (isSummarizeEnabled()) return tools;
  return tools.filter((t) => t.slug !== "summarize-pdf");
}

export function getToolsByCategory(category: CategorySlug): ToolDefinition[] {
  return getVisibleTools().filter((t) => t.category === category);
}

export function searchTools(query: string): ToolDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return getVisibleTools().filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some((k) => k.toLowerCase().includes(q))
  );
}

export function getAllToolSlugs(): string[] {
  return getVisibleTools().map((t) => t.slug);
}
