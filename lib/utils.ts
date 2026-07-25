import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(i === 0 ? 0 : decimals)} ${units[i]}`;
}

/** Triggers a browser download for in-memory bytes/blob without a server round-trip. */
export function downloadBlob(data: Uint8Array | Blob, fileName: string) {
  const blob =
    data instanceof Blob
      ? data
      : new Blob([new Uint8Array(data)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Truncates a long filename in the middle rather than at the end, so both the
 * start and the distinguishing tail (page ranges, sequence numbers, extension —
 * generated filenames like "merged-pages-15-108.pdf" put the part that tells
 * files in a batch apart right before the extension) stay visible — e.g.
 * "merged (4)-pages-15-108.pdf" -> "merged (4)...ges-15-108.pdf". Biased 35/65
 * toward the tail for that reason. A CSS `truncate` class should still be
 * layered on top as a hard safety net for containers narrower than this
 * character budget anticipates.
 */
export function truncateMiddle(text: string, maxLength = 20): string {
  if (text.length <= maxLength) return text;
  const keepStart = Math.floor((maxLength - 3) * 0.35);
  const keepEnd = Math.ceil((maxLength - 3) * 0.65);
  return `${text.slice(0, keepStart)}...${text.slice(text.length - keepEnd)}`;
}
