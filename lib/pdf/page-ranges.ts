/**
 * Forgiving parser for page-range text input ("1-3, 7, 10-12"). Tolerates
 * extra whitespace, trailing/empty commas, reversed ranges (5-2 -> 2-5),
 * and duplicate/overlapping entries — everything collapses into a Set.
 * Anything out of [1, totalPages] or unparseable is silently dropped rather
 * than rejected, since this drives a live UI, not a validated form submit.
 */
export function parsePageRange(input: string, totalPages: number): Set<number> {
  const result = new Set<number>();
  if (totalPages <= 0) return result;

  const parts = input
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  for (const part of parts) {
    const rangeMatch = part.match(/^(\d+)\s*-\s*(\d+)$/);
    if (rangeMatch) {
      let a = parseInt(rangeMatch[1], 10);
      let b = parseInt(rangeMatch[2], 10);
      if (a > b) [a, b] = [b, a];
      const from = Math.max(1, a);
      const to = Math.min(totalPages, b);
      for (let p = from; p <= to; p++) result.add(p);
      continue;
    }
    const single = part.match(/^\d+$/);
    if (single) {
      const n = parseInt(part, 10);
      if (n >= 1 && n <= totalPages) result.add(n);
    }
  }

  return result;
}

/** Renders a Set of page numbers back to compact canonical range text ("1-3, 7, 10-12"). */
export function formatPageRange(selected: Set<number>): string {
  const sorted = Array.from(selected).sort((a, b) => a - b);
  const parts: string[] = [];
  let i = 0;
  while (i < sorted.length) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    parts.push(i === j ? `${sorted[i]}` : `${sorted[i]}-${sorted[j]}`);
    i = j + 1;
  }
  return parts.join(", ");
}

export function invertSelection(selected: Set<number>, totalPages: number): Set<number> {
  const next = new Set<number>();
  for (let p = 1; p <= totalPages; p++) {
    if (!selected.has(p)) next.add(p);
  }
  return next;
}

export function allPages(totalPages: number): Set<number> {
  const next = new Set<number>();
  for (let p = 1; p <= totalPages; p++) next.add(p);
  return next;
}
