import type { Metadata } from "next";
import Link from "next/link";
import { Rows3 } from "lucide-react";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { LandingHeader } from "@/components/seo/landing-header";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { FaqList } from "@/components/seo/faq-list";
import { SequenceComparisonGraphic } from "@/components/seo/sequence-comparison-graphic";
import {
  softwareApplicationJsonLd,
  howToJsonLdNamed,
  faqJsonLd,
} from "@/lib/seo/json-ld";
import { getToolBySlug } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/split-pdf-by-page-range`;
const TITLE = "Split PDF by Page Range Online Free - Custom Ranges";
const DESCRIPTION =
  "Split a PDF by page range free in your browser. Mark 1-5, 6-10, 11-20 and get three files instantly, with worked examples for single pages and fixed intervals.";

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
  "Upload the PDF you want to divide into ranges.",
  "Tap the scissors icon between any two thumbnails to mark a split point. Each tap adds one more range to the result.",
  "Read the live summary above the grid, it lists each resulting range as \"Part 1: pages 1-5\" and so on, before you commit to anything.",
  "Tap a split point again to remove it if you marked the wrong page.",
  "Tap \"Split PDF\" and download every range as a separate file, bundled in one ZIP.",
];

const FAQS = [
  {
    q: "Can two ranges overlap so the same page ends up in two output files?",
    a: "No. Because you mark split points between existing pages rather than typing numbers, every range starts exactly where the previous one ended, so a page can only ever land in one output file.",
  },
  {
    q: "What happens if I try to mark a split point past the last page?",
    a: "There is nothing to tap there, the last thumbnail has no gap after it, so a split point past the final page simply cannot be created.",
  },
  {
    q: "Is there a minimum range size, can a range be just one page?",
    a: "Yes, mark a split point on both sides of one page and it becomes its own single-page file, no different from any other range except that it happens to contain one page.",
  },
  {
    q: "How many split points can I mark in one document?",
    a: "As many as there are gaps between pages, one less than the total page count. A 40-page document allows up to 39 split points, producing up to 40 files.",
  },
  {
    q: "Can I mix a fixed interval like every 10 pages with a few manual chapter breaks in the same split?",
    a: "Not in a single pass. Run the fixed-interval split first, or mark manual points first, since the tool applies one method per split rather than combining them.",
  },
  {
    q: "What are the output files named when I split by range?",
    a: "Your original file name plus the page span, for example manual-pages-11-20.pdf, so you can tell which range is which without opening every file.",
  },
  {
    q: "Can I preview which pages fall in which range before downloading?",
    a: "Yes, the summary line above the grid updates the moment you mark or remove a split point, listing every resulting range before you tap split.",
  },
  {
    q: "Does marking a split point in the wrong place ruin the whole batch?",
    a: "No, tap the same point again to remove it and mark the correct one instead. Nothing is processed until you actually run the split.",
  },
];

const RELATED = ["extract-pages", "reorder-pages", "merge-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function SplitPdfByPageRangePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Split PDF by Page Range | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to split a PDF by page range", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Rows3}
        h1="Cut a PDF Into the Exact Page Ranges You Need"
        description="Mark split points, see the resulting ranges before you commit. Nothing is uploaded."
      />
      <ToolPageClient slug="split-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            Splitting a PDF by page range means deciding exactly where each cut falls, not just
            how many files you end up with. Mark a split point after page 5 and another after
            page 10 in a 20-page document, and you get three files: pages 1-5, pages 6-10, and
            pages 11-20. This page covers that mechanism in detail: how ranges get built, what a
            single-page range looks like, and why a fixed interval like every 10 pages is not the
            same thing as splitting at a chapter break. Everything runs in your browser, and
            nothing is uploaded.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to split by page range</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            Take a 20-page document and mark two split points: one after page 5, one after page
            10. That produces exactly three ranges, pages 1-5, pages 6-10, and pages 11-20, each
            becoming its own file. The ranges do not have to be equal sizes; the third one here is
            twice as long as the first two, simply because that is where the next split point
            happened to land. A single-page range works the same way: mark a split point on both
            sides of one page, after page 4 and after page 5, and page 5 becomes a standalone
            one-page file, labeled with just its own page number rather than a range. A run of
            several single-page ranges in a row, useful for pulling apart a stack of one-page
            certificates bundled into one file, works the same way: mark a split point after
            every single page and each one comes out as its own file.
          </p>
          <p className="leading-relaxed">
            Some tools let you type ranges directly, &quot;1-8&quot; and then &quot;5-12&quot; as
            a separate entry, and typing two ranges that overlap is a real, common mistake: pages
            5 through 8 would end up duplicated across two output files, or a typo like
            &quot;1-500&quot; on a 40-page document would silently get clamped to whatever exists
            without telling you it happened. This tool avoids that category of mistake entirely by
            construction. Because you mark split points between pages that already exist rather
            than typing numbers, a range can never overlap another one and can never extend past
            the document&apos;s actual last page, there is simply no gap to tap beyond it.
          </p>
          <SequenceComparisonGraphic
            wrongLabel="Typed ranges elsewhere"
            wrongSequence="1-8, 5-12 (pages 5-8 duplicated)"
            rightLabel="Split points here"
            rightSequence="1-8, 9-20 (no overlap possible)"
            caption="Typing two ranges that overlap is a real mistake on tools that use text input. Marking split points between existing pages makes an overlapping or out-of-bounds range structurally impossible."
          />
          <p className="leading-relaxed">
            Splitting at a fixed interval, every 10 pages for example, is a different tool inside
            this same page and it solves a different problem. A 300-page manual split every 10
            pages produces 30 evenly sized files in about 4 seconds, which is fast and requires no
            decisions from you. The tradeoff is that it has no idea where your chapters actually
            start. Chapter 3 might begin on page 47, right in the middle of the fifth 10-page
            file, splitting it across two files in a way that makes neither one useful on its own.
            Meaningful boundaries, chapters, sections, individual statements, need the manual split
            points instead, marked exactly where the content actually breaks.
          </p>
          <p className="leading-relaxed">
            The two approaches are not mutually exclusive across separate jobs, just within one.
            A monthly report you receive on a fixed schedule with a fixed page count each time is
            a good candidate for the fixed interval, since the structure barely changes. A
            document assembled from parts of different lengths, a book with chapters of wildly
            different sizes, or a set of exhibits numbered by someone else entirely, needs the
            manual points, since no fixed number of pages lines up with boundaries that were never
            evenly spaced to begin with.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Breaking a 300-page manual into chapter files is a natural fit: look up where each
            chapter starts, mark a split point there, and the manual becomes one file per chapter
            instead of one unwieldy download. Separating a year of statements into months works
            the same way, mark 11 split points at each month boundary inside a combined 12-month
            PDF and you get 12 files, each one a single statement. It also comes up when dividing
            a semester&apos;s combined lecture slides into one file per lecture, or splitting a
            court exhibit bundle into ranges that match an existing numbered index, where the
            ranges have to land on exact, specific pages rather than an even interval. Researchers
            use it to break a combined dataset appendix into one range per experiment when a
            journal wants each supplementary file submitted separately, and HR teams use it to
            divide a combined new-hire packet into the individual forms a payroll system expects
            to receive one at a time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online split tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Ranges can overlap or exceed the page count",
                thisTool: false,
                typical: "Possible with typed ranges on some tools",
              },
              {
                feature: "Shows the resulting ranges before you commit",
                thisTool: true,
                typical: "Rarely",
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
            Splitting by range copies existing page data rather than decoding and re-encoding it,
            so it stays fast regardless of how many ranges you mark. It needs no Web Worker or
            special browser feature, so it runs on effectively any current browser. Only one
            source file can be open at a time, and the practical ceiling is your device&apos;s
            memory while it is loaded: files above roughly 35MB can slow down or struggle on an
            older phone&apos;s browser tab, while a laptop or desktop handles considerably larger
            files without trouble. The number of ranges you can create tops out at your
            document&apos;s own page count, one range per page at the extreme, and every range
            downloads bundled together in a single ZIP file so a 30-range split is still one
            download, not thirty.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Just need the general split walkthrough? Head to the{" "}
            <Link href="/split-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              split PDF hub
            </Link>
            . Want to keep the original file untouched and only pull a few pages out instead of
            dividing the whole document? See{" "}
            <Link href="/extract-pages-from-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              extract pages from a PDF
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
