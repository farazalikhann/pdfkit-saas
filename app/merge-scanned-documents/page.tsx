import type { Metadata } from "next";
import Link from "next/link";
import { ScanLine } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/merge-scanned-documents`;
const TITLE = "Merge Scanned Documents Into One PDF - Free Online";
const DESCRIPTION =
  "Merge scanned documents into one PDF free in your browser. Handle mixed A4 and Letter sizes, sideways pages, and oversized files, then compress the result.";

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
  "Gather every scanned page or scanned file for this document into one batch, however your scanner exported them.",
  "Check each thumbnail for orientation. If a page loaded sideways or upside down from an automatic feeder, rotate it now.",
  "Drag the files into the order the physical document was in.",
  "Merge them into a single PDF.",
  "Compress the result afterward if the file size matters. See compressing a scanned PDF for how far you can safely push it.",
];

const FAQS = [
  {
    q: "Why does my scanner save each page as a separate PDF instead of one file?",
    a: "Most scanner apps and flatbed scanners default to one file per scan action, especially when you feed pages one at a time rather than through an automatic document feeder set to produce a single multi-page file.",
  },
  {
    q: "Can I standardize all my scans to one page size before merging them?",
    a: "Not within this tool, since it merges pages exactly as they arrive. If a consistent size matters, check your scanner app's paper-size setting before rescanning the odd pages out.",
  },
  {
    q: "Some pages came out sideways from my scanner's automatic feeder. Do I need to fix that before or after merging?",
    a: "Either works, but fixing it before is easier to track. Rotate the sideways thumbnail in the arrange view before you merge, so you are not hunting for a sideways page in a long combined file afterward.",
  },
  {
    q: "Should I compress before or after merging a batch of scanned pages?",
    a: "After. Merging does not touch image data, so compressing the combined file once is equivalent to compressing every page individually first, with one less step.",
  },
  {
    q: "Can I merge scanned pages saved in different formats, like some as PDF and some as JPG?",
    a: "Convert the JPG pages to PDF first using the JPG to PDF tool, then merge that result together with your existing scanned PDFs.",
  },
  {
    q: "Does merging straighten a page that was scanned crooked or at a slight angle?",
    a: "No, merging only combines pages as they already are. A crooked scan stays crooked in the merged file, since straightening is a separate correction this step does not perform.",
  },
  {
    q: "Will the merged file let me search or select text if the individual scans never had OCR applied?",
    a: "No, merging does not add text recognition. Run the OCR tool on the file, before or after merging, if you need the scanned pages to become searchable and selectable.",
  },
  {
    q: "How many scanned pages can I realistically combine in one merge before it gets slow?",
    a: "Up to 50 files at once is the hard limit here. In practice, scanned pages are heavier than typed PDFs, so a phone can slow down well before that cap on a very large batch.",
  },
];

const RELATED = ["rotate-pages", "ocr-pdf", "compress-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function MergeScannedDocumentsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Merge Scanned Documents | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            howToJsonLdNamed("How to merge scanned documents into one PDF", HOW_TO_STEPS)
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={ScanLine}
        h1="Combine Separately Scanned Pages Into One Clean Document"
        description="Mixed sizes, sideways pages, and oversized files, handled honestly. Nothing is uploaded."
      />
      <ToolPageClient slug="merge-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            A flatbed scanner rarely hands you one tidy file. It hands you a folder of
            single-page PDFs, sometimes with a page fed in sideways, sometimes mixing A4 and
            Letter if you scanned across two separate visits to the machine. Merging scanned
            documents into one PDF looks identical to merging any other batch of files, but
            scanned pages bring problems a typed document never has: inconsistent page sizes,
            occasional wrong-way orientation, and a combined file that balloons in size because
            every page is really a photograph. This tool merges them exactly as they are, then
            this page covers what to check before you call the document finished.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to merge scanned documents</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Scanning a signed contract page by page is a common trigger, especially when a page
            gets signed, rescanned, and needs to rejoin the rest of the document that was already
            scanned earlier. Digitising old paper records, a box of certificates, letters, or
            receipts scanned across several sessions with whatever scanner was on hand each time,
            regularly produces a batch with inconsistent orientation and page sizes that only
            becomes obvious once you try to combine it. Combining scanned ID documents for an
            application, the front and back of a card, a passport photo page, each saved as its
            own file, is another regular case, since most portals accept exactly one PDF upload
            rather than several separate images. Rebuilding a paper trail for insurance or a
            warranty claim is a fourth case, where receipts, a filled-in claim form, and a
            photographed damage report each start as separate scans and need to become one
            submission before an adjuster will look at it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            A mismatched page size in a scanned batch is different from a mismatched size in a
            general document merge. When you combine a report with a cover letter, different
            sizes are often intentional. When you combine pages meant to represent one continuous
            physical document, a stray Letter-sized page sitting among A4 pages almost always
            means the scanner tray had the wrong paper size loaded for that one page, not a
            deliberate choice. Each page still keeps its own original size in the merged file,
            nothing gets stretched or cropped to match its neighbors, so the mismatch stays
            visible rather than getting silently hidden. Check the thumbnails before merging; a
            page that looks a noticeably different shape from the rest of the stack is worth a
            second look.
          </p>
          <p className="leading-relaxed">
            Orientation causes more problems in scanned batches than anywhere else, because an
            automatic document feeder can pull a page in sideways or upside down without you
            noticing until you review the file afterward. Fix this before merging if you can. It
            is far easier to spot and rotate one sideways thumbnail in a batch of ten than to find
            it again once it is buried on page 34 of a combined 50-page file.
          </p>
          <p className="leading-relaxed">
            Phone scanning apps introduce a version of the same problem in a different shape.
            Rather than a physical feeder pulling a page in wrong, the app&apos;s auto-crop can read a
            document&apos;s edges slightly differently from one photo to the next, so page dimensions
            in the resulting PDF can vary by a few millimeters between pages even though every
            sheet you photographed was the same physical size. That variation is usually too
            small to matter for reading or printing, but it is why a batch scanned entirely on a
            phone can still show slightly mismatched thumbnails in the arrange view, not just a
            batch mixing A4 and Letter paper.
          </p>
          <p className="leading-relaxed">
            File size is the other place scanned batches behave differently. A typed PDF stores
            letters as text, which takes almost no space. A scanned page stores the entire page as
            an image, so twenty scanned A4 pages at 300 DPI usually merge into a file of around
            45MB, even though a twenty-page typed document might be under 2MB. Merging itself does
            not add or remove any of that weight, it just adds the pages together, so plan on
            compressing the result afterward if the combined file needs to go through an email
            attachment limit or a portal&apos;s upload cap.
          </p>
          <SizeComparisonGraphic
            beforeLabel="20 scanned A4 pages, merged: ~45MB"
            afterLabel="Same file, compressed afterward: ~9MB"
            afterWidthPct={20}
            caption="Merging does not change file size on its own. A 45MB batch of scanned pages commonly compresses down to around 9MB afterward without losing readability."
          />
          <p className="leading-relaxed">
            Color mode adds another variable most people do not think about until the file turns
            out larger than expected. A page scanned in full color carries three channels of data
            per pixel; the same page scanned in grayscale or black-and-white carries one, often
            cutting the raw size by more than half before compression even runs. If a batch mixes
            a few color pages, a photo ID or a stamped seal, with mostly black-and-white text
            pages, that is normal and not worth changing, but scanning an entire text-only batch
            in color when grayscale would look identical is one of the easiest ways to end up with
            an oversized merged file for no visible benefit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online merge tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Keeps each scanned page's original size and resolution untouched during merge",
                thisTool: true,
                typical: "Usually, though rarely stated outright",
              },
              {
                feature: "File count limit",
                thisTool: "Up to 50 files per merge",
                typical: "Often 5 to 20 on free tiers",
              },
              { feature: "File uploaded to a server", thisTool: false, typical: true },
              { feature: "Watermark added", thisTool: false, typical: "Sometimes, on free tiers" },
              { feature: "Signup required", thisTool: false, typical: "Often, past a certain file count" },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Limits</h2>
          <p className="leading-relaxed">
            There is a 50-file cap per merge, and scanned batches hit the practical memory ceiling
            faster than typed documents do, since every page is a full image sitting in your
            device&apos;s memory while the merge runs. A phone can start slowing down somewhere
            past a combined 100MB of scanned pages, roughly 40 to 50 pages at 300 DPI, while a
            laptop or desktop handles considerably more. Merging itself needs no Web Worker or
            special browser feature and runs on effectively any current browser; it is the
            compression step afterward that relies on Web Workers and OffscreenCanvas, supported
            in every current version of Chrome, Firefox, Safari, and Edge.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Merged file too large to email or upload?{" "}
            <Link href="/compress-scanned-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              Compress a scanned PDF
            </Link>{" "}
            explains exactly what DPI keeps text readable. Just need the general merge
            walkthrough? Head to the{" "}
            <Link href="/merge-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              merge PDF hub
            </Link>
            .
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
