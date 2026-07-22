# PDFKit

A mobile-first PDF tools app. Every tool is free and unlimited, no account, no paywall. Most tools run entirely in the browser — files never touch a server — with a shared `<ToolShell>` layout and a single config file that drives the whole site.

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **pdf-lib** (via the `@cantoo/pdf-lib` fork, which adds password/encryption support), **pdfjs-dist** (page rendering/thumbnails/text extraction), **jszip**
- **Zustand** for client state — just a local `localStorage`-backed "Recent" history and an in-memory cross-tool file hand-off; no accounts, no server sync
- **react-dropzone** for uploads
- **next-themes** for dark mode, **vaul** (via shadcn `Drawer`) for the mobile bottom sheet
- **@google/genai** (Gemini API, `gemini-2.5-flash`) for the one AI tool (Summarize), behind a provider-agnostic interface so another backend can be swapped in later
- PWA: a hand-written `public/sw.js` + `app/manifest.ts` (no external PWA plugin)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Everything works out of the box with no environment variables — every client-side tool and the homepage need nothing at all.

### Optional environment variable

Create `.env.local` only if you want the Summarize tool:

```bash
# Get a free key at https://aistudio.google.com/apikey — no credit card required.
GOOGLE_AI_API_KEY=

# Optional: selects the AI backend (lib/ai/get-provider.ts). Only "gemini" is
# implemented today; the switch exists so Groq/Anthropic/etc. can be added later.
AI_PROVIDER=gemini

# Optional: only needed for a custom domain. Without it, the site auto-detects
# its own URL on Vercel, or falls back to localhost in dev — see lib/constants.ts.
NEXT_PUBLIC_SITE_URL=
```

Without `GOOGLE_AI_API_KEY`, Summarize is hidden from the entire site (nav, search, homepage, sitemap, and the route itself 404s) rather than showing a broken page.

## Folder structure

```
app/
  layout.tsx              Root layout: fonts, ThemeProvider, AppShell, Toaster, SW registration
  page.tsx                Homepage: search, category chips, per-category tool grids
  manifest.ts             PWA manifest (MetadataRoute.Manifest)
  sitemap.ts / robots.ts   Auto-generated from lib/tools.ts + lib/categories.ts
  icon.png / apple-icon.png / icons/*.png   Generated PNG icons (scripts/generate-icons.mjs)
  offline/page.tsx         Offline fallback shown by the service worker
  privacy/page.tsx         Honest, short privacy policy
  category/[slug]/page.tsx Category listing page
  tools/[slug]/page.tsx    Every tool's route — looks up config, renders <ToolPageClient>
  tools/page.tsx           "All tools" browsable/searchable list (Tools tab)
  recent/page.tsx          Recently-used tools (Recent tab, localStorage-backed)
  api/ai/summarize/route.ts   The only server route — Gemini-backed, rate-limited

components/
  layout/          AppShell, TopBar, BottomTabBar (Home/Tools/Recent), ThemeProvider/Toggle
  home/            SearchBar, CategoryChips, CategorySection, ToolCard
  tool-shell/      The shared <ToolShell> and its pieces (UploadZone, FileList,
                   OptionsPanel, ActionBar, ResultPanel, ProgressRing, client-badge)
  pdf/             PdfThumbnailGrid (used by the rotate tool)
  tools/           One file per tool's specific options/logic (merge-pdf.tsx, etc.),
                   tool-page-client.tsx (slug → component map), generic-tool.tsx (TODO scaffold)
  pwa/             Service worker registration

lib/
  tools.ts         *** THE config file — every tool is one object in this array ***
  categories.ts    The 6 category definitions (slug, name, emoji, color)
  pdf/             Pure, client-safe transformation functions (merge, split, compress,
                   rotate, pdf-to-jpg, jpg-to-pdf, watermark, password-protect,
                   thumbnails, extract-text)
  ai/              Provider-agnostic AI layer, Summarize-only:
                     provider.ts          the AiProvider interface (summarizeText)
                     get-provider.ts      factory — reads AI_PROVIDER, defaults to Gemini
                     providers/gemini-provider.ts   the only implementation today
                     rate-limiter.ts      in-memory daily cap (1,400/day) + 5/hour per IP
                     is-enabled.ts        hide-if-no-key check (works server & client side)
  store/           Zustand: recent-store (localStorage) + chain-store (in-memory hand-off)
  seo/json-ld.ts   JSON-LD builders for tool/category pages
  constants.ts     Site name/description + SITE_URL auto-detection (see below)
```

## Architecture rules this app follows

1. **Client-side first.** Anything that can run in the browser does (`lib/pdf/*`). Those tools show a "🔒 Your file never leaves your device" badge. Summarize is the one exception — it says so, honestly, instead.
2. **One shared layout.** Every tool route renders `<ToolShell>`: upload → preview → options (bottom sheet on mobile, inline card on desktop) → sticky action button with live state → result (download/share/chain to another tool).
3. **One config file.** `lib/tools.ts` is the single source of truth. The homepage, `/tools`, `/category/[slug]`, the sitemap, and `/tools/[slug]`'s `generateStaticParams`/metadata all derive from it — nothing about a tool is hardcoded into more than one place. `getVisibleTools()` is what everything reads from (not the raw `tools` array), so a tool can be hidden (currently just Summarize without a key) without touching more than one file.
4. **No monetization, no accounts.** There's no paywall, no usage cap, no Pro tier, and no sign-in anywhere in this app. "Recent" is local-storage only.

## Adding a new tool in under 10 minutes

Say you want to add **"Add Header & Footer"** as a real, working client-side tool (it currently exists as a config entry with a generic "coming soon" scaffold).

1. **Write the transform** in `lib/pdf/header-footer.ts`:

   ```ts
   import { PDFDocument, StandardFonts, rgb } from "@cantoo/pdf-lib";

   export async function addHeaderFooter(file: File, opts: { footerText: string }) {
     const doc = await PDFDocument.load(await file.arrayBuffer());
     const font = await doc.embedFont(StandardFonts.Helvetica);
     for (const page of doc.getPages()) {
       const { width } = page.getSize();
       page.drawText(opts.footerText, { x: 24, y: 24, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
     }
     return doc.save();
   }
   ```

2. **Build the tool component** in `components/tools/add-header-footer.tsx`, following the pattern every other tool uses — local `useState` for options, `<ToolShell>` for the chrome:

   ```tsx
   "use client";
   import * as React from "react";
   import { ToolShell } from "@/components/tool-shell/tool-shell";
   import { addHeaderFooter } from "@/lib/pdf/header-footer";
   import type { ToolDefinition } from "@/lib/tools";

   export function AddHeaderFooterTool({ tool }: { tool: ToolDefinition }) {
     const [footerText, setFooterText] = React.useState("");
     return (
       <ToolShell
         tool={tool}
         actionLabel={() => "Add header & footer"}
         options={() => (
           <input value={footerText} onChange={(e) => setFooterText(e.target.value)} />
         )}
         onProcess={async (files) => {
           const bytes = await addHeaderFooter(files[0], { footerText });
           return [{ name: "with-header.pdf", blob: new Blob([bytes], { type: "application/pdf" }) }];
         }}
       />
     );
   }
   ```

3. **Register it** in `components/tools/tool-page-client.tsx`'s `IMPLEMENTED_TOOLS` map:

   ```ts
   "add-header-footer": dynamic(() => import("./add-header-footer").then((m) => m.AddHeaderFooterTool), { loading: loadingFallback, ssr: false }),
   ```

4. **Flip the flag** in `lib/tools.ts`: set `isImplemented: true` on the `add-header-footer` entry (it's already there — every tool in the app is pre-registered, whether built or not).

That's it — no route file to create, no nav link to add, no sitemap entry to write. The homepage grid, category page, search, sitemap, and static params all pick it up automatically because they all read from `lib/tools.ts`.

**Adding a brand-new tool that doesn't exist yet** is the same, plus one extra step: add its `ToolDefinition` object to the `tools` array in `lib/tools.ts` first (slug, name, category, icon, `accept` map, etc.) — copy the shape of a neighboring entry in the same category.

## What's genuinely working vs. scaffolded

- **Fully working, 100% client-side:** Merge, Split, Compress (3 quality presets with real before/after size), Rotate (interactive per-page thumbnail grid), PDF→JPG, JPG→PDF, Add Watermark, Password Protect.
- **Fully working, server-side via Gemini:** Summarize PDF (`app/api/ai/summarize`) — needs `GOOGLE_AI_API_KEY`. Text is extracted from the PDF in the browser with pdf.js (capped at 50 pages / 100,000 characters — a clear error shows if a document is too long) and only that text is sent to the server; the file itself never leaves the device. Rate-limited to 5 requests/hour per IP and a shared 1,400/day hard cap across all visitors (comfortably inside Gemini's free tier) — see the in-memory-counter caveat in `lib/ai/rate-limiter.ts`.
- **Scaffolded (real upload/preview/UI, processing pending):** every other tool in `lib/tools.ts` (`isImplemented: false`). Opening one renders `components/tools/generic-tool.tsx`, whose `onProcess` has a `// TODO: implement processing for this tool.` comment marking exactly where to plug in real logic — follow the same 4-step recipe above.
