import { NextResponse } from "next/server";
import dns from "node:dns/promises";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024; // 5MB, per resource
const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;
const MAX_STYLESHEETS = 5;
const MAX_TOTAL_CSS_BYTES = 3 * 1024 * 1024;

/** Blocks loopback/private/link-local/CGNAT ranges to prevent SSRF against internal infrastructure. */
function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const lower = ip.toLowerCase();
    if (lower === "::1" || lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) {
      return true;
    }
    return false;
  }
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true;
  const [a, b] = parts;
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true; // link-local, incl. cloud metadata endpoints
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  return false;
}

interface FetchedResource {
  body: string;
  finalUrl: URL;
  contentType: string;
}

/** Fetches a URL with per-redirect-hop SSRF validation and a streamed size cap. */
async function safeFetch(
  initialUrl: URL,
  opts: { acceptTypeContains: string[]; maxBytes: number }
): Promise<FetchedResource> {
  let current = initialUrl;

  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    if (current.protocol !== "http:" && current.protocol !== "https:") {
      throw new Error("Only http/https URLs are supported.");
    }

    let address: string;
    try {
      address = (await dns.lookup(current.hostname)).address;
    } catch {
      throw new Error("Couldn't resolve that domain.");
    }
    if (isPrivateIp(address)) {
      throw new Error("This URL points to a restricted address.");
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current.toString(), {
        signal: controller.signal,
        redirect: "manual",
        headers: { "User-Agent": "PDFKit/1.0 (+html-to-pdf tool)" },
      });
    } catch (err) {
      throw new Error(
        err instanceof Error && err.name === "AbortError"
          ? "That page took too long to load."
          : "Couldn't fetch that URL."
      );
    } finally {
      clearTimeout(timeout);
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) throw new Error("Redirected with no destination.");
      current = new URL(location, current);
      continue;
    }

    if (!res.ok) throw new Error(`The page responded with ${res.status}.`);

    const contentType = res.headers.get("content-type") ?? "";
    if (!opts.acceptTypeContains.some((t) => contentType.includes(t))) {
      throw new Error("Unexpected content type.");
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("Empty response.");
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > opts.maxBytes) throw new Error("That resource is too large.");
      chunks.push(value);
    }
    return {
      body: Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf-8"),
      finalUrl: current,
      contentType,
    };
  }

  throw new Error("Too many redirects.");
}

/** Decodes the handful of entities that show up in HTML attribute values (e.g. MediaWiki
 *  and most CMSes emit `href="...&amp;foo=bar"`) — regex-extracted attributes are raw text,
 *  not parsed markup, so this doesn't happen for free the way it would via a DOM parser. */
function decodeHtmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

/** Best-effort: inlines up to MAX_STYLESHEETS linked <link rel="stylesheet"> files as <style> blocks
 *  so pages that use external CSS (the overwhelming majority of real sites) don't render unstyled —
 *  the client only carries over inline <style> tags, having no safe way to fetch cross-origin CSS itself. */
async function inlineStylesheets(html: string, baseUrl: URL): Promise<string> {
  const linkRegex = /<link\b[^>]*>/gi;
  const links = html.match(linkRegex) ?? [];
  const hrefs: string[] = [];

  for (const tag of links) {
    if (!/rel=["']?[^"'>]*stylesheet/i.test(tag)) continue;
    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
    if (!hrefMatch) continue;
    hrefs.push(decodeHtmlEntities(hrefMatch[1]));
    if (hrefs.length >= MAX_STYLESHEETS) break;
  }

  if (hrefs.length === 0) return html;

  let budget = MAX_TOTAL_CSS_BYTES;
  const cssBlocks: string[] = [];
  for (const href of hrefs) {
    if (budget <= 0) break;
    try {
      const resolved = new URL(href, baseUrl);
      const { body, contentType } = await safeFetch(resolved, {
        acceptTypeContains: ["text/css", "text/plain", "application/octet-stream"],
        maxBytes: Math.min(budget, 1024 * 1024),
      });
      if (contentType && !contentType.includes("css") && !contentType.includes("text/plain")) continue;
      cssBlocks.push(body);
      budget -= body.length;
    } catch {
      // A single failed/blocked stylesheet shouldn't sink the whole conversion.
    }
  }

  if (cssBlocks.length === 0) return html;
  const styleTag = `<style>${cssBlocks.join("\n")}</style>`;
  if (/<head[^>]*>/i.test(html)) {
    return html.replace(/<head[^>]*>/i, (m) => `${m}${styleTag}`);
  }
  return styleTag + html;
}

export async function POST(req: Request) {
  let targetUrl: URL;
  try {
    const body = await req.json();
    targetUrl = new URL(body.url);
  } catch {
    return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
  }

  try {
    const { body: html, finalUrl } = await safeFetch(targetUrl, {
      acceptTypeContains: ["text/html", "text/plain"],
      maxBytes: MAX_BYTES,
    });
    const withStyles = await inlineStylesheets(html, finalUrl);
    return NextResponse.json({ html: withStyles });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't fetch that URL." },
      { status: 502 }
    );
  }
}
