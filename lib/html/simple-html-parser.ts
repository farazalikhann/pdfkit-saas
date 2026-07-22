/**
 * A small, deliberately narrow HTML parser for mammoth's output (headings, p,
 * strong/b, em/i, ul/ol/li, table/tr/td/th, img, a, br). No DOMParser — this
 * runs inside a Web Worker, which doesn't have one. Not a general HTML parser.
 */

export interface TextRun {
  type: "text";
  text: string;
  bold: boolean;
  italic: boolean;
  href?: string;
}
export interface BreakRun {
  type: "br";
}
export type InlineRun = TextRun | BreakRun;

export interface HeadingBlock {
  type: "heading";
  level: 1 | 2 | 3 | 4 | 5 | 6;
  runs: InlineRun[];
}
export interface ParagraphBlock {
  type: "paragraph";
  runs: InlineRun[];
}
export interface ListBlock {
  type: "list";
  ordered: boolean;
  items: InlineRun[][];
}
export interface TableBlock {
  type: "table";
  rows: InlineRun[][][]; // rows -> cells -> runs
}
export interface ImageBlock {
  type: "image";
  src: string;
  alt?: string;
}
export type Block = HeadingBlock | ParagraphBlock | ListBlock | TableBlock | ImageBlock;

interface ListFrame {
  kind: "list";
  ordered: boolean;
  items: InlineRun[][];
}
interface TableFrame {
  kind: "table";
  rows: InlineRun[][][];
}
interface RowFrame {
  kind: "row";
  cells: InlineRun[][];
}
type ContainerFrame = ListFrame | TableFrame | RowFrame;

function decodeEntities(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

const HEADING_LEVELS: Record<string, 1 | 2 | 3 | 4 | 5 | 6> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

export function parseSimpleHtml(html: string): Block[] {
  const blocks: Block[] = [];
  const containerStack: ContainerFrame[] = [];
  const inlineStack: { tag: string; href?: string }[] = [];
  let currentRuns: InlineRun[] | null = null;
  let currentHeadingLevel: 1 | 2 | 3 | 4 | 5 | 6 | null = null;

  const isBold = () => inlineStack.some((t) => t.tag === "strong" || t.tag === "b");
  const isItalic = () => inlineStack.some((t) => t.tag === "em" || t.tag === "i");
  const currentHref = () =>
    [...inlineStack].reverse().find((t) => t.tag === "a")?.href;

  function pushText(text: string) {
    if (currentRuns === null || !text) return;
    currentRuns.push({
      type: "text",
      text,
      bold: isBold(),
      italic: isItalic(),
      href: currentHref(),
    });
  }

  function finishCurrentRuns() {
    if (currentRuns === null) return;
    const runs = currentRuns;
    currentRuns = null;
    if (currentHeadingLevel) {
      blocks.push({ type: "heading", level: currentHeadingLevel, runs });
      currentHeadingLevel = null;
      return;
    }
    const top = containerStack[containerStack.length - 1];
    if (top?.kind === "list") top.items.push(runs);
    else if (top?.kind === "row") top.cells.push(runs);
    else blocks.push({ type: "paragraph", runs });
  }

  const TAG_RE = /<(\/?)([a-zA-Z0-9]+)([^>]*)>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAG_RE.exec(html))) {
    const text = html.slice(lastIndex, match.index);
    if (text) pushText(decodeEntities(text));
    lastIndex = TAG_RE.lastIndex;

    const closing = match[1] === "/";
    const tag = match[2].toLowerCase();
    const attrs = match[3] ?? "";

    if (!closing) {
      if (tag === "p" || tag === "li" || tag === "td" || tag === "th") {
        currentRuns = [];
      } else if (HEADING_LEVELS[tag]) {
        currentRuns = [];
        currentHeadingLevel = HEADING_LEVELS[tag];
      } else if (tag === "ul" || tag === "ol") {
        containerStack.push({ kind: "list", ordered: tag === "ol", items: [] });
      } else if (tag === "table") {
        containerStack.push({ kind: "table", rows: [] });
      } else if (tag === "tr") {
        containerStack.push({ kind: "row", cells: [] });
      } else if (tag === "strong" || tag === "b" || tag === "em" || tag === "i") {
        inlineStack.push({ tag });
      } else if (tag === "a") {
        const hrefMatch = attrs.match(/href="([^"]*)"/);
        inlineStack.push({ tag: "a", href: hrefMatch?.[1] });
      } else if (tag === "br") {
        currentRuns?.push({ type: "br" });
      } else if (tag === "img") {
        const srcMatch = attrs.match(/src="([^"]*)"/);
        const altMatch = attrs.match(/alt="([^"]*)"/);
        finishCurrentRuns();
        if (srcMatch?.[1]) blocks.push({ type: "image", src: srcMatch[1], alt: altMatch?.[1] });
      }
    } else {
      if (tag === "p" || tag === "li" || tag === "td" || tag === "th" || HEADING_LEVELS[tag]) {
        finishCurrentRuns();
      } else if (tag === "ul" || tag === "ol") {
        const frame = containerStack.pop();
        if (frame?.kind === "list") blocks.push({ type: "list", ordered: frame.ordered, items: frame.items });
      } else if (tag === "table") {
        const frame = containerStack.pop();
        if (frame?.kind === "table") blocks.push({ type: "table", rows: frame.rows });
      } else if (tag === "tr") {
        const frame = containerStack.pop();
        const table = containerStack[containerStack.length - 1];
        if (frame?.kind === "row" && table?.kind === "table") table.rows.push(frame.cells);
      } else if (tag === "strong" || tag === "b" || tag === "em" || tag === "i" || tag === "a") {
        for (let i = inlineStack.length - 1; i >= 0; i--) {
          if (inlineStack[i].tag === tag) {
            inlineStack.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  const trailing = html.slice(lastIndex);
  if (trailing) pushText(decodeEntities(trailing));
  finishCurrentRuns();

  return blocks;
}
