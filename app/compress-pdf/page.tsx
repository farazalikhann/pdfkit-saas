import type { Metadata } from "next";
import Link from "next/link";
import { Minimize2 } from "lucide-react";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { LandingHeader } from "@/components/seo/landing-header";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { FaqList } from "@/components/seo/faq-list";
import { SizeComparisonGraphic } from "@/components/seo/size-comparison-graphic";
import {
  softwareApplicationJsonLd,
  howToJsonLdNamed,
  faqJsonLd,
} from "@/lib/seo/json-ld";
import { getToolBySlug } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/compress-pdf`;
const TITLE = "Compress PDF Online Free - No Upload, No Limits";
const DESCRIPTION =
  "Compress a PDF for free, right in your browser. No upload, no file size cap, no watermark, and no signup required. Pick a preset or an exact size in KB.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: PAGE_URL,
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${TITLE} | ${SITE_NAME}`,
    description: DESCRIPTION,
  },
};

const HOW_TO_STEPS = [
  "Upload the PDF you want to shrink. Drag it onto the page or tap to browse for it.",
  "Pick a preset, from Minimal (barely touches quality) through Extreme (screen-only, visibly softer).",
  "Or switch to the \"Target a size\" tab and type a goal like \"300 KB\" or \"2 MB\" instead of guessing which preset to use.",
  "Check the before-and-after preview of page one and the percentage saved.",
  "Download the compressed file, or keep the original if compression didn't actually help.",
];

const FAQS = [
  {
    q: "Is this really free, with no limit on file size or how many PDFs I compress?",
    a: "Yes. There's no page cap, no daily quota, no account, and no paywall. The only real limit is your device's own memory on very large files.",
  },
  {
    q: "Does my PDF ever get uploaded to a server?",
    a: "No. Every step, decoding, resizing, re-encoding, rebuilding the file, happens in your browser using a Web Worker, so the file never leaves your device.",
  },
  {
    q: "Will compressing make my document's text blurry?",
    a: "No. Only embedded raster images are downsampled and re-encoded; real text and vector graphics are left completely untouched, so they stay sharp and selectable.",
  },
  {
    q: "Can I compress a PDF to an exact size instead of picking a preset?",
    a: "Yes. Switch to the Target Size tab, type something like \"500 KB\" or \"2 MB,\" and the tool searches across quality and resolution settings to land at or just under it.",
  },
  {
    q: "What's actually the difference between the five presets?",
    a: "They control image resolution and JPEG quality together. Minimal keeps 300 DPI at 90% quality for near-lossless results, while Extreme drops to 72 DPI at 35% quality for the smallest possible screen-only file.",
  },
  {
    q: "Why did my file come out barely smaller, or even slightly bigger?",
    a: "That usually means the PDF was already efficiently compressed or is mostly text with few images. The tool will flag it and let you keep the original rather than replace it with a larger file.",
  },
  {
    q: "Does this work on my phone, or do I need a laptop?",
    a: "It works on phones and tablets. Compression runs in a background Web Worker with a real progress bar, though very large scanned files will naturally take longer on a phone than on a laptop.",
  },
  {
    q: "Can I undo a compression if I don't like the result?",
    a: "Your original file is never modified or deleted. It stays right where it was on your device, so you can just start over with the original and try a different preset.",
  },
];

const RELATED = ["ocr-pdf", "merge-pdf", "pdf-to-jpg"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressPdfHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress PDF | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to compress a PDF", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Minimize2}
        h1="Shrink a PDF File Size for Free, Right in Your Browser"
        description="Presets or an exact target size. Compression runs on your device, nothing is uploaded."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            If you need to compress a PDF and don&apos;t want to sign up for anything or sit
            through an upload bar, this is a real compressor that runs entirely inside your
            browser tab. Drop in a file, pick one of five presets from Minimal to Extreme, or
            switch to Target Size and type a number like &quot;300 KB.&quot; It decodes every
            embedded image, shrinks it, and re-encodes it, the same category of technique
            desktop software uses, while leaving your actual text completely alone, so nothing
            turns blurry or stops being selectable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress your PDF</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <h2 className="text-base font-bold leading-tight">Need an exact number, not just a preset?</h2>
          <p className="leading-relaxed">
            Plenty of portals don&apos;t care about &quot;Recommended&quot; or &quot;Strong.&quot;
            They want a specific figure under a hard cap, or a file that fits an email provider&apos;s
            attachment limit. Each of these walks through the Target Size box for one common case:{" "}
            <Link href="/compress-pdf-to-100kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 100KB
            </Link>
            ,{" "}
            <Link href="/compress-pdf-to-200kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 200KB
            </Link>
            ,{" "}
            <Link href="/compress-pdf-to-500kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 500KB
            </Link>
            ,{" "}
            <Link href="/compress-pdf-to-1mb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 1MB
            </Link>
            , or{" "}
            <Link href="/compress-pdf-for-email" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF for an email attachment
            </Link>
            .
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-base font-bold leading-tight">Dealing with a specific problem instead?</h2>
          <p className="leading-relaxed">
            Not every compression question is about hitting a number. If a scan came out
            blurry, or you just want to know how much this can shrink a file before it looks
            worse, one of these covers it directly:{" "}
            <Link href="/compress-scanned-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a scanned PDF
            </Link>
            ,{" "}
            <Link href="/compress-pdf-without-losing-quality" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF without losing quality
            </Link>
            , or{" "}
            <Link href="/compress-large-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a large PDF file
            </Link>
            .
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Gmail and most webmail providers cap attachments around 25MB, but plenty of
            recipients&apos; inboxes and spam filters get fussy well before that. A 40MB scanned
            contract that won&apos;t even attach is a common trigger for reaching for a
            compressor. Government portals, scholarship applications, and job sites often set a
            hard cap like 100KB or 200KB per document and simply reject anything over it,
            usually with no explanation beyond &quot;file too large.&quot; A school or work Slack
            channel where half the group is on mobile data makes a 15MB PDF genuinely annoying to
            open, even if the platform technically allows it. Learning platforms like Google
            Classroom or a university&apos;s assignment portal frequently cap individual uploads
            at 10MB or less, which a phone-scanned, multi-page assignment can blow past without
            anyone intending it to. And sometimes it&apos;s simpler than any of that: you just
            want an email attachment to load fast on someone&apos;s phone instead of sitting
            there spinning.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <p className="leading-relaxed">
            Here&apos;s how it stacks up against the usual &quot;upload it to a website&quot;
            compressors you&apos;ll find with a search.
          </p>
          <ComparisonTable
            rows={[
              {
                feature: "File size limit",
                thisTool: "None. Limited only by your device's memory",
                typical: "Often capped around 10 to 25MB per file on the free tier",
              },
              { feature: "Watermark added", thisTool: false, typical: "Sometimes, on free tiers" },
              {
                feature: "File uploaded to a server",
                thisTool: false,
                typical: "Yes. That's how they compress it",
              },
              {
                feature: "Signup required",
                thisTool: false,
                typical: "Often, for larger files or batch processing",
              },
              { feature: "Works with no internet after the page loads", thisTool: true, typical: false },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What to expect</h2>
          <p className="leading-relaxed">
            Files up to roughly 35MB process fine even on a phone. Above that, a phone browser
            tab risks running out of memory mid-compression, though a laptop or desktop browser
            handles much bigger files without issue. The tool needs Web Workers and
            OffscreenCanvas, which every current version of Chrome, Firefox, Safari, and Edge
            supports; it won&apos;t run on Internet Explorer or on very old browser builds. A
            scanned PDF, which is really just a photo per page, compresses dramatically, often
            more than half its size at the Recommended preset alone, because nearly the whole
            file is exactly the kind of embedded image this pipeline targets. A born-digital PDF
            that&apos;s mostly real text, like a Word export or an invoice, won&apos;t shrink
            nearly as much, since text and vector graphics are deliberately left untouched. Some
            images get skipped on purpose rather than risk corrupting them: JPEG2000, CCITT
            fax-encoded scans, CMYK or indexed-color images, and anything carrying a transparency
            mask. You&apos;ll see that reflected as &quot;left untouched&quot; after a run. And if
            even the Extreme preset can&apos;t get a file under your target size, the tool says so
            honestly and hands you its closest result instead of quietly failing or pretending to
            hit the number.
          </p>
          <SizeComparisonGraphic
            beforeLabel="Original: 12 MB scanned PDF"
            afterLabel="Recommended preset: about 3 to 5 MB"
            afterWidthPct={35}
            caption="A 12MB scanned PDF often lands around 3 to 5MB at the Recommended preset, and noticeably smaller still at Strong or Extreme."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        {RELATED.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold leading-tight">Related tools</h2>
            <ul className="space-y-2 leading-relaxed">
              {RELATED.map((tool) => (
                <li key={tool.slug}>
                  <Link
                    href={`/tools/${tool.slug}`}
                    className="font-medium text-primary underline-offset-2 hover:underline"
                  >
                    {tool.name}
                  </Link>
                  <span className="text-muted-foreground">. {tool.description}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
