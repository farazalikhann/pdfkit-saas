export const FREE_TIER = {
  tasksPerDay: 3,
  maxFileSizeBytes: 25 * 1024 * 1024, // 25MB
  batchProcessing: false,
} as const;

export const PRO_TIER = {
  tasksPerDay: Infinity,
  maxFileSizeBytes: 500 * 1024 * 1024, // 500MB
  batchProcessing: true,
} as const;

/** How long a server-processed result stays available before auto-delete. */
export const RESULT_TTL_SECONDS = 60 * 60; // 1 hour

export const SITE_NAME = "PDFKit";
export const SITE_DESCRIPTION =
  "Fast, private PDF tools that run right in your browser — merge, split, compress, convert and more.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://pdfkit.example.com";
