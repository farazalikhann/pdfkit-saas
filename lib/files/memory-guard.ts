import { formatBytes } from "@/lib/utils";

/**
 * Warns (never blocks) before processing a file large enough to risk an
 * out-of-memory crash on a mobile browser tab. The user always decides.
 */
const RISKY_SIZE_BYTES = 35 * 1024 * 1024; // ~35MB

export function checkFileMemoryRisk(file: File): string | null {
  if (file.size <= RISKY_SIZE_BYTES) return null;
  return `${file.name} is ${formatBytes(file.size)} — large enough that processing it on a phone could run out of memory and crash the tab. It should be fine on a desktop browser.`;
}
