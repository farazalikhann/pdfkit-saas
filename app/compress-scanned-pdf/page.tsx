import type { Metadata } from "next";
import Link from "next/link";
import { ScanText } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/compress-scanned-pdf`;
const TITLE = "Compress Scanned PDF Online Free - Keep Text Readable";
const DESCRIPTION =
  "Compress a scanned PDF free, right in your browser. Learn what happens at 300, 200, and 150 DPI so text stays readable instead of turning blurry or unreadable.";

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
  "Upload the scanned PDF. If it came straight from a scanner app or an office scanner, it is likely already 5 to 40MB for a handful of pages.",
  "Pick a preset based on how the scan will be used. Minimal or Light if you might print it later, Recommended for general sharing, Strong or Extreme only if you need it very small and can accept softer text.",
  "Check the before and after preview at full size, not just the thumbnail, since blur is easy to miss when zoomed out.",
  "Zoom into a dense paragraph or small print specifically. If you can still read the smallest text comfortably, the setting is safe.",
  "Download, or step back one preset level if anything looked borderline.",
];

const FAQS = [
  {
    q: "Why is my scanned PDF so much bigger than a regular PDF with the same number of pages?",
    a: "A regular PDF stores text as text, which takes almost no space. A scanned PDF stores every page as a full image, and images at scanning resolution are inherently much larger than the text they represent.",
  },
  {
    q: "What DPI should I use if I need to keep the text sharp?",
    a: "Stay at 200 DPI or higher for anything with small print or fine detail. 300 DPI is the safest choice if you are not sure and file size is not a hard constraint.",
  },
  {
    q: "Why did the text on my scanned document turn blurry after compressing?",
    a: "The preset you chose dropped the resolution below what the smallest text on the page needed to stay sharp. Try a lighter preset and check a zoomed-in view before committing.",
  },
  {
    q: "Is 150 DPI good enough to read a scanned contract on screen?",
    a: "For a contract in a normal font size, yes, on-screen reading holds up fine at 150 DPI. Printing the same page at full size would reveal more softness than reading it on a monitor or phone.",
  },
  {
    q: "Does compressing a scanned PDF affect a signature or stamp on the page?",
    a: "Yes, since it is part of the same image as the rest of the page. If a signature needs to stay clearly verifiable, use a lighter preset like Minimal or Light rather than Strong or Extreme.",
  },
  {
    q: "Will a phone-scanned document compress differently than one from an office scanner?",
    a: "Somewhat. Phone scans often carry more visual noise that compresses away easily, while a clean flatbed scan has less redundant detail to remove, so the size reduction can look different even at the same preset.",
  },
  {
    q: "Can I compress just some pages of a scanned document and leave others untouched?",
    a: "Not within this tool directly. Extract the pages you want treated differently into a separate file first, then compress each part with the setting that fits it.",
  },
  {
    q: "Is there a way to tell if I have compressed too far before downloading?",
    a: "Yes, the before and after preview shows page one at full resolution. Zoom into the smallest text on that preview before downloading rather than judging from the thumbnail.",
  },
];

const RELATED = ["ocr-pdf", "pdf-to-jpg", "rotate-pages"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressScannedPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress Scanned PDF | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to compress a scanned PDF", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={ScanText}
        h1="Why Scanned PDFs Compress Differently, and How to Get It Right"
        description="Every page is an image, not text, so the safe compression limit depends on DPI. Nothing is uploaded."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            A scanned PDF is not really a document. It is a stack of photographs with a PDF
            wrapper around them, which is exactly why it is so much bigger than a Word export
            with the same page count. When you compress a scanned PDF, you are not touching any
            text at all, because there usually is not any: every letter you see is part of a
            picture. That distinction changes how compression behaves, how far you can push it,
            and where text starts to blur if you go too far. This page covers what actually
            happens at each resolution setting, so you can pick one that keeps a scan legible
            instead of guessing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress a scanned PDF</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The problem explained</h2>
          <p className="leading-relaxed">
            Every page in a scanned PDF is a raster image, made of pixels rather than the
            letters and shapes a Word-exported PDF is built from. The resolution of that image,
            measured in DPI, or dots per inch, determines how much detail survives. A page
            scanned at 300 DPI captures roughly 2,550 by 3,300 pixels for a standard letter-size
            page, which is why office scanners default to it: it is sharp enough that even small
            print stays crisp, and it is also why the file is huge, since that is millions of
            pixels per page before any compression happens.
          </p>
          <p className="leading-relaxed">
            Compressing a scanned PDF works by downsampling those pixels, essentially discarding
            some and recalculating the rest, then re-encoding the result as a smaller JPEG. At
            300 DPI, text edges are smooth and legible even under moderate compression, because
            there is enough pixel detail to represent a clean letterform. Drop to 200 DPI and you
            lose real resolution. Still readable for anything printed in a normal size, but small
            footnotes or a dense table can start to look slightly soft around the edges. At 150
            DPI you are down to about 1,275 by 1,650 pixels for the same page, which is where
            text below roughly 8 or 9 point size starts to genuinely blur. Letters lose their
            sharp edges, and a number like 8 can start to look like a 3 if the antialiasing does
            not cooperate.
          </p>
          <SizeComparisonGraphic
            beforeLabel="300 DPI: about 2,550 x 3,300 px"
            afterLabel="150 DPI: about 1,275 x 1,650 px"
            afterWidthPct={25}
            caption="Dropping from 300 DPI to 150 DPI quarters the pixel count per page, which is exactly why small text starts to blur below that point."
          />
          <p className="leading-relaxed">
            The safe limit depends on what is on the page. A typed contract in a normal 11 or 12
            point font holds up fine down to 150 DPI for on-screen reading. Small print, a dense
            table of numbers, or a signature you need to verify later should stay at 200 DPI or
            higher, since that is exactly the detail that degrades first. Photos or stamps
            embedded in the scan are more forgiving than text and usually tolerate a more
            aggressive setting without looking obviously worse.
          </p>
          <p className="leading-relaxed">
            Where the scan comes from changes the starting point too. A phone scan, taken with a
            camera app rather than a true flatbed scan, often starts out uneven: sharper in one
            corner than another, occasional motion blur, and a resolution that varies with how
            the app processes the shot. An office scanner produces a consistent 300, 200, or 600
            DPI across every page, set once in the device settings, which makes it more
            predictable to compress. A scanned government document, a passport page, an ID card,
            a certificate, is often scanned at high resolution because it may be printed or
            verified later, so it usually has more room to compress before anything critical is
            lost, but also arrives larger to begin with.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What to expect</h2>
          <p className="leading-relaxed">
            A typical office-scanned page at 300 DPI runs somewhere between 800KB and 2MB per
            page depending on how much ink is on it, so a 10-page scanned contract commonly
            lands between 8MB and 20MB before any compression. Running that through the
            Recommended preset, 150 DPI at 70 percent quality, usually brings it down to
            somewhere around 1.5MB to 4MB total, with body text still comfortably readable on
            screen. Push to Strong, 100 DPI, and the same document often drops under 1MB, but
            that is where edges soften on anything smaller than standard body text. A
            phone-scanned page tends to compress a bit more dramatically than a true flatbed
            scan at the same starting size, since phone camera output often carries more
            redundant detail that compresses away without touching legibility.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Built for image-only, page-per-scan PDFs specifically",
                thisTool: true,
                typical: "Rare, most treat every PDF the same regardless of content",
              },
              {
                feature: "Multiple DPI-based presets to choose from",
                thisTool: "Yes, five presets plus a custom target",
                typical: "Often just one quality slider",
              },
              { feature: "File uploaded to a server", thisTool: false, typical: true },
              { feature: "Watermark added", thisTool: false, typical: "Sometimes, on free tiers" },
              { feature: "Signup required", thisTool: false, typical: "Often, past a certain file size" },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Limits</h2>
          <p className="leading-relaxed">
            Files above roughly 35MB, common for a 20-plus page scan at 300 DPI or higher, risk
            running out of memory on a phone&apos;s browser tab. A laptop or desktop handles them
            without issue. The tool needs Web Workers and OffscreenCanvas, supported in every
            current version of Chrome, Firefox, Safari, and Edge, not Internet Explorer or very
            old mobile browsers. Two cases where compression will not help much: a scan already
            low resolution to begin with, under 150 DPI, has nothing left to safely remove, and a
            document where every page needs to stay at full 300 DPI for legal or archival reasons
            has no truly safe setting, since any
            downsampling changes the underlying pixels, even if the change is small.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Want the honest breakdown of what compression can do without any visible tradeoff?
            See{" "}
            <Link href="/compress-pdf-without-losing-quality" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF without losing quality
            </Link>
            . Working with a huge scanned file specifically? See{" "}
            <Link href="/compress-large-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a large PDF file
            </Link>
            . The{" "}
            <Link href="/compress-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              main compress PDF tool
            </Link>{" "}
            covers the full set of presets.
          </p>
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
