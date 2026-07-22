import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "@cantoo/pdf-lib";
import type { Block, InlineRun, ListBlock, TableBlock, ImageBlock } from "@/lib/html/simple-html-parser";

const PAGE = { width: 595.28, height: 841.89 }; // A4, points
const MARGIN = 50;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;
const LINK_COLOR = rgb(0.09, 0.35, 0.75);
const BORDER_COLOR = rgb(0.75, 0.75, 0.75);

const HEADING_SIZES: Record<1 | 2 | 3 | 4 | 5 | 6, number> = {
  1: 22,
  2: 19,
  3: 16,
  4: 14,
  5: 13,
  6: 12,
};

interface Fonts {
  regular: PDFFont;
  bold: PDFFont;
  italic: PDFFont;
  boldItalic: PDFFont;
}

interface LayoutState {
  doc: PDFDocument;
  fonts: Fonts;
  page: PDFPage;
  y: number;
}

function pickFont(fonts: Fonts, bold: boolean, italic: boolean): PDFFont {
  if (bold && italic) return fonts.boldItalic;
  if (bold) return fonts.bold;
  if (italic) return fonts.italic;
  return fonts.regular;
}

function ensureSpace(state: LayoutState, neededHeight: number) {
  if (state.y - neededHeight < MARGIN) {
    state.page = state.doc.addPage([PAGE.width, PAGE.height]);
    state.y = PAGE.height - MARGIN;
  }
}

interface Token {
  text: string;
  bold: boolean;
  italic: boolean;
  href?: string;
  isBreak?: boolean;
}

function tokenize(runs: InlineRun[]): Token[] {
  const tokens: Token[] = [];
  for (const run of runs) {
    if (run.type === "br") {
      tokens.push({ text: "", bold: false, italic: false, isBreak: true });
      continue;
    }
    for (const part of run.text.split(/(\s+)/).filter((p) => p.length > 0)) {
      tokens.push({ text: part, bold: run.bold, italic: run.italic, href: run.href });
    }
  }
  return tokens;
}

interface LineSegment {
  text: string;
  font: PDFFont;
  href?: string;
  width: number;
}
interface Line {
  segments: LineSegment[];
}

function wrapTokens(tokens: Token[], fonts: Fonts, fontSize: number, maxWidth: number): Line[] {
  const lines: Line[] = [];
  let current: LineSegment[] = [];
  let currentWidth = 0;

  function pushLine() {
    while (current.length && current[current.length - 1].text.trim() === "") {
      currentWidth -= current.pop()!.width;
    }
    if (current.length > 0) lines.push({ segments: current });
    current = [];
    currentWidth = 0;
  }

  for (const token of tokens) {
    if (token.isBreak) {
      pushLine();
      continue;
    }
    const font = pickFont(fonts, token.bold, token.italic);
    const width = font.widthOfTextAtSize(token.text || " ", fontSize);
    const isSpace = token.text.trim() === "";
    if (currentWidth + width > maxWidth && current.length > 0 && !isSpace) {
      pushLine();
    }
    if (isSpace && current.length === 0) continue;
    current.push({ text: token.text, font, href: token.href, width });
    currentWidth += width;
  }
  pushLine();
  return lines;
}

function drawLines(state: LayoutState, lines: Line[], fontSize: number, lineHeight: number, indent = 0) {
  for (const line of lines) {
    ensureSpace(state, lineHeight);
    let x = MARGIN + indent;
    for (const seg of line.segments) {
      const isLink = Boolean(seg.href);
      state.page.drawText(seg.text, {
        x,
        y: state.y - fontSize,
        size: fontSize,
        font: seg.font,
        color: isLink ? LINK_COLOR : rgb(0.08, 0.08, 0.08),
      });
      if (isLink) {
        state.page.drawLine({
          start: { x, y: state.y - fontSize - 1 },
          end: { x: x + seg.width, y: state.y - fontSize - 1 },
          thickness: 0.6,
          color: LINK_COLOR,
        });
      }
      x += seg.width;
    }
    state.y -= lineHeight;
  }
}

function layoutParagraph(state: LayoutState, runs: InlineRun[], fontSize: number, spacingAfter = 6) {
  if (runs.length === 0) {
    state.y -= fontSize * 0.6;
    return;
  }
  const lines = wrapTokens(tokenize(runs), state.fonts, fontSize, CONTENT_WIDTH);
  drawLines(state, lines, fontSize, fontSize * 1.35);
  state.y -= spacingAfter;
}

function layoutList(state: LayoutState, block: ListBlock, fontSize: number) {
  const indent = 18;
  const lineHeight = fontSize * 1.35;
  block.items.forEach((itemRuns, i) => {
    const prefix = block.ordered ? `${i + 1}.` : "•";
    const lines = wrapTokens(tokenize(itemRuns), state.fonts, fontSize, CONTENT_WIDTH - indent);
    lines.forEach((line, li) => {
      ensureSpace(state, lineHeight);
      if (li === 0) {
        state.page.drawText(prefix, {
          x: MARGIN,
          y: state.y - fontSize,
          size: fontSize,
          font: state.fonts.regular,
          color: rgb(0.08, 0.08, 0.08),
        });
      }
      let x = MARGIN + indent;
      for (const seg of line.segments) {
        state.page.drawText(seg.text, {
          x,
          y: state.y - fontSize,
          size: fontSize,
          font: seg.font,
          color: seg.href ? LINK_COLOR : rgb(0.08, 0.08, 0.08),
        });
        x += seg.width;
      }
      state.y -= lineHeight;
    });
  });
  state.y -= 6;
}

function layoutTable(state: LayoutState, block: TableBlock, fontSize: number) {
  if (block.rows.length === 0) return;
  const columnCount = Math.max(...block.rows.map((r) => r.length), 1);
  const colWidth = CONTENT_WIDTH / columnCount;
  const padding = 4;
  const lineHeight = fontSize * 1.3;

  for (const row of block.rows) {
    const cellLines = row.map((cellRuns) =>
      wrapTokens(tokenize(cellRuns), state.fonts, fontSize, colWidth - padding * 2)
    );
    const maxLines = Math.max(1, ...cellLines.map((l) => l.length));
    const rowHeight = maxLines * lineHeight + padding * 2;

    ensureSpace(state, rowHeight);
    const rowTop = state.y;
    for (let c = 0; c < columnCount; c++) {
      const x0 = MARGIN + c * colWidth;
      state.page.drawRectangle({
        x: x0,
        y: rowTop - rowHeight,
        width: colWidth,
        height: rowHeight,
        borderColor: BORDER_COLOR,
        borderWidth: 0.5,
      });
      let ty = rowTop - padding;
      for (const line of cellLines[c] ?? []) {
        let tx = x0 + padding;
        for (const seg of line.segments) {
          state.page.drawText(seg.text, {
            x: tx,
            y: ty - fontSize,
            size: fontSize,
            font: seg.font,
            color: rgb(0.08, 0.08, 0.08),
          });
          tx += seg.width;
        }
        ty -= lineHeight;
      }
    }
    state.y -= rowHeight;
  }
  state.y -= 8;
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function layoutImage(state: LayoutState, block: ImageBlock) {
  const match = block.src.match(/^data:([^;]+);base64,([\s\S]*)$/);
  if (!match) return; // remote/unsupported image source — skip gracefully
  const mime = match[1];
  const bytes = base64ToBytes(match[2]);

  let image;
  try {
    image = mime.includes("png") ? await state.doc.embedPng(bytes) : await state.doc.embedJpg(bytes);
  } catch {
    return; // unsupported image format (e.g. gif/svg) — skip rather than fail the whole document
  }

  const maxWidth = CONTENT_WIDTH;
  const maxHeight = 320;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const w = image.width * scale;
  const h = image.height * scale;

  ensureSpace(state, h);
  state.page.drawImage(image, { x: MARGIN, y: state.y - h, width: w, height: h });
  state.y -= h + 10;
}

export async function renderBlocksToPdf(
  blocks: Block[],
  onProgress?: (fraction: number) => void
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italic: await doc.embedFont(StandardFonts.HelveticaOblique),
    boldItalic: await doc.embedFont(StandardFonts.HelveticaBoldOblique),
  };
  const state: LayoutState = {
    doc,
    fonts,
    page: doc.addPage([PAGE.width, PAGE.height]),
    y: PAGE.height - MARGIN,
  };

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === "heading") {
      const size = HEADING_SIZES[block.level];
      ensureSpace(state, size * 1.6);
      state.y -= 6;
      const boldRuns = block.runs.map((r) => (r.type === "text" ? { ...r, bold: true } : r));
      layoutParagraph(state, boldRuns, size, 8);
    } else if (block.type === "paragraph") {
      layoutParagraph(state, block.runs, 10.5);
    } else if (block.type === "list") {
      layoutList(state, block, 10.5);
    } else if (block.type === "table") {
      layoutTable(state, block, 9);
    } else if (block.type === "image") {
      await layoutImage(state, block);
    }
    onProgress?.((i + 1) / blocks.length);
  }

  return doc.save();
}
