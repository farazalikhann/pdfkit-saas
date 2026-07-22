import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(
  rootDir,
  "node_modules/pdfjs-dist/build/pdf.worker.min.mjs"
);
const destDir = join(rootDir, "public");
const dest = join(destDir, "pdf.worker.min.mjs");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);
console.log("Copied pdfjs worker to public/pdf.worker.min.mjs");
