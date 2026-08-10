/**
 * A deliberately tiny Markdown subset, just what the Summarize prompt is
 * instructed to produce (## headings, - bullets, plain paragraphs, a TLDR
 * line), parsed once and rendered two ways: as React elements for the
 * on-screen result, and as an HTML string for the PDF export. Keeping one
 * parser for both means the screen and the PDF can never show different
 * structure for the same response.
 */
export type MarkdownBlock =
  | { type: "h1" | "h2"; text: string }
  | { type: "bullets"; items: string[] }
  | { type: "tldr"; text: string }
  | { type: "p"; text: string };

export function parseMarkdownLite(source: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let currentBullets: string[] | null = null;

  function flushBullets() {
    if (currentBullets && currentBullets.length > 0) {
      blocks.push({ type: "bullets", items: currentBullets });
    }
    currentBullets = null;
  }

  for (const rawLine of source.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      continue;
    }
    if (line.startsWith("## ")) {
      flushBullets();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else if (line.startsWith("# ")) {
      flushBullets();
      blocks.push({ type: "h1", text: line.slice(2).trim() });
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      if (!currentBullets) currentBullets = [];
      currentBullets.push(line.slice(2).trim());
    } else if (/^TLDR:\s*/i.test(line)) {
      flushBullets();
      blocks.push({ type: "tldr", text: line.replace(/^TLDR:\s*/i, "").trim() });
    } else {
      flushBullets();
      blocks.push({ type: "p", text: line });
    }
  }
  flushBullets();
  return blocks;
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Renders parsed blocks to an HTML fragment for the PDF export pipeline. */
export function markdownBlocksToHtml(blocks: MarkdownBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "h1":
          return `<h1 style="font-size:18px;margin:16px 0 8px;">${escapeHtml(b.text)}</h1>`;
        case "h2":
          return `<h2 style="font-size:15px;margin:14px 0 6px;">${escapeHtml(b.text)}</h2>`;
        case "bullets":
          return `<ul style="margin:0 0 10px;padding-left:20px;">${b.items
            .map((item) => `<li style="margin-bottom:4px;">${escapeHtml(item)}</li>`)
            .join("")}</ul>`;
        case "tldr":
          return `<p style="margin:12px 0;padding:8px 10px;background:#f3f4f6;border-left:3px solid #666;"><strong>TLDR:</strong> ${escapeHtml(b.text)}</p>`;
        case "p":
        default:
          return `<p style="margin:0 0 10px;">${escapeHtml(b.text)}</p>`;
      }
    })
    .join("\n");
}
