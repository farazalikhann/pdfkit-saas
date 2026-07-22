# PDFKit

A mobile-first PDF tools SaaS. Most tools run entirely in the browser — files never touch a server — with a shared `<ToolShell>` layout, a single config file that drives the whole site, and a paywall that unlocks after a file has already been processed (the highest-conversion moment).

## Tech stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + **shadcn/ui** (Radix primitives)
- **pdf-lib** (via the `@cantoo/pdf-lib` fork, which adds password/encryption support), **pdfjs-dist** (page rendering/thumbnails), **jszip**
- **Zustand** for client state (usage limits, recent files, cross-tool file hand-off), persisted to `localStorage`
- **react-dropzone** for uploads
- **next-themes** for dark mode, **vaul** (via shadcn `Drawer`) for the mobile bottom sheet
- **@anthropic-ai/sdk** for the AI tools (server-only)
- **Stripe** + **Razorpay** SDKs, **@supabase/ssr** for auth — wired as stubs (see below)
- PWA: a hand-written `public/sw.js` + `app/manifest.ts` (no external PWA plugin)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Everything works out of the box with no environment variables — the 8 client-side tools and homepage need nothing at all.

### Optional environment variables

Create `.env.local` for the pieces that need real credentials:

```bash
# AI tools (Chat, Summarize, Translate, Extract to CSV) — app/api/ai/*
ANTHROPIC_API_KEY=

# Stripe checkout (app/api/checkout/stripe)
STRIPE_SECRET_KEY=
STRIPE_PRO_PRICE_ID=

# Razorpay checkout (app/api/checkout/razorpay)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_PRO_PLAN_ID=

# Supabase auth (app/account, lib/supabase/*)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Without these, the relevant buttons show a friendly "not configured yet" message instead of failing silently.

## Folder structure

```
app/
  layout.tsx              Root layout: fonts, ThemeProvider, AppShell, Toaster, SW registration
  page.tsx                Homepage: search, category chips, per-category tool grids
  manifest.ts             PWA manifest (MetadataRoute.Manifest)
  sitemap.ts / robots.ts   Auto-generated from lib/tools.ts + lib/categories.ts
  icon.tsx / apple-icon.tsx/ icons/[size]/route.tsx   Generated PNG icons (next/og)
  offline/page.tsx         Offline fallback shown by the service worker
  category/[slug]/page.tsx Category listing page
  tools/[slug]/page.tsx    Every tool's route — looks up config, renders <ToolPageClient>
  tools/page.tsx           "All tools" browsable/searchable list (Tools tab)
  recent/page.tsx          Recently-used tools (Recent tab, localStorage-backed)
  account/page.tsx         Plan, usage, sign-in (Account tab)
  pricing/page.tsx         Free vs Pro comparison + checkout buttons
  api/
    ai/{chat,summarize,translate,extract}/route.ts   Anthropic-backed, server-only key
    checkout/{stripe,razorpay}/route.ts               Checkout session stubs

components/
  layout/          AppShell, TopBar, BottomTabBar, ThemeProvider/Toggle
  home/            SearchBar, CategoryChips, CategorySection, ToolCard
  tool-shell/      The shared <ToolShell> and its pieces (UploadZone, FileList,
                   OptionsPanel, ActionBar, ResultPanel, PaywallModal, ProgressRing…)
  pdf/             PdfThumbnailGrid (used by the rotate tool)
  tools/           One file per tool's specific options/logic (merge-pdf.tsx, etc.),
                   tool-page-client.tsx (slug → component map), generic-tool.tsx (TODO scaffold)
  pwa/             Service worker registration

lib/
  tools.ts         *** THE config file — every tool is one object in this array ***
  categories.ts    The 6 category definitions (slug, name, emoji, color)
  pdf/             Pure, client-safe transformation functions (merge, split, compress,
                   rotate, pdf-to-jpg, jpg-to-pdf, watermark, password-protect, thumbnails)
  ai/client.ts     Server-only Anthropic client + helpers (never import from a Client Component)
  store/           Zustand stores: usage-store (daily quota), recent-store, chain-store
  seo/json-ld.ts   JSON-LD builders for tool/category pages
  supabase/        Browser + server Supabase clients (no-op until env vars are set)
  constants.ts     Free/Pro tier limits, site name/description/URL
```

## Architecture rules this app follows

1. **Client-side first.** Anything that can run in the browser does (`lib/pdf/*`). Those tools show a "🔒 Your file never leaves your device" badge. Only the AI tools and future document-conversion tools touch a server.
2. **One shared layout.** Every tool route renders `<ToolShell>`: upload → preview → options (bottom sheet on mobile, inline card on desktop) → sticky action button with live state → result (download/share/chain to another tool), with a paywall gate that triggers only *after* processing succeeds.
3. **One config file.** `lib/tools.ts` is the single source of truth. The homepage, `/tools`, `/category/[slug]`, the sitemap, and `/tools/[slug]`'s `generateStaticParams`/metadata all derive from it — nothing about a tool is hardcoded into more than one place.
4. **Process now, paywall later.** `useUsageStore` tracks a rolling daily task count. A run is allowed to complete even past the free quota; only the *download* is blurred and gated behind `<PaywallModal>`, since showing the finished result first is the highest-conversion moment.

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
- **Fully working, server-side via Anthropic:** Chat with PDF, Summarize PDF, Translate PDF, Extract Data to CSV (`app/api/ai/*`) — needs `ANTHROPIC_API_KEY`.
- **Scaffolded (real upload/preview/UI, processing pending):** every other tool in `lib/tools.ts` (`isImplemented: false`). Opening one renders `components/tools/generic-tool.tsx`, whose `onProcess` has a `// TODO: implement processing for this tool.` comment marking exactly where to plug in real logic — follow the same 4-step recipe above.
- **Stubbed pending real credentials:** Stripe/Razorpay checkout, Supabase auth/usage sync — both fail gracefully with an explanatory toast instead of a real charge/session when env vars are absent.
