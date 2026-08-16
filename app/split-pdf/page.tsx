import type { Metadata } from "next";
import Link from "next/link";
import { Scissors } from "lucide-react";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { LandingHeader } from "@/components/seo/landing-header";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { FaqList } from "@/components/seo/faq-list";
import {
  softwareApplicationJsonLd,
  howToJsonLdNamed,
  faqJsonLd,
} from "@/lib/seo/json-ld";
import { getToolBySlug } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/split-pdf`;
const TITLE = "Split PDF Online Free - No Upload, No Page Limits";
const DESCRIPTION =
  "Split a PDF online free, right in your browser. Cut a document into files, pull out a few pages, or break it into single pages, whichever one you actually need.";

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
  "Upload the PDF you want to split.",
  "Choose how to split it: mark split points visually to cut it into a few files, pick a fixed number of pages per file, or pull out every page as its own file.",
  "Check the live summary above the grid, it lists exactly which pages will end up in which output file before you commit to anything.",
  "Tap \"Split PDF.\"",
  "Download the result, a single ZIP file when the split produces more than one file.",
];

const FAQS = [
  {
    q: "What is the difference between splitting a PDF and extracting pages from it?",
    a: "Splitting turns one document into several new files and nothing is left over. Extracting pulls a copy of the pages you want into a new file while the original stays exactly as it was, untouched on your device.",
  },
  {
    q: "Which option do I pick if I just want one page pulled out and the rest thrown away?",
    a: "Extraction, not splitting. Splitting is for when you want every resulting piece; if you only care about keeping a handful of pages, use the extract pages tool instead.",
  },
  {
    q: "Does splitting delete or change my original file?",
    a: "No, the file on your device is never modified. The tool reads it, builds new files from the pages you specify, and your original copy sits exactly where it was.",
  },
  {
    q: "Can I split a PDF into exactly two files?",
    a: "Yes, mark a single split point anywhere in the document and you get two files, everything before the point and everything after it.",
  },
  {
    q: "What happens to the file name when a PDF splits into several parts?",
    a: "Each output file takes your original name plus a page label, like report-pages-1-5.pdf and report-pages-6-10.pdf, so you can tell them apart without opening each one.",
  },
  {
    q: "Do I get one download or several when a PDF splits into multiple files?",
    a: "You get a single ZIP file containing every part, so there is one download regardless of how many files the split produced.",
  },
  {
    q: "Can I undo a split after downloading the result?",
    a: "Not within the tool, but nothing is destructive: your original file was never changed, so you can just use it again if the split did not come out the way you wanted.",
  },
  {
    q: "Is there a limit on how many parts one PDF can split into?",
    a: "The practical ceiling is your document's own page count, since a split point only makes sense between two pages. A 40-page document could split into as many as 40 single-page files.",
  },
];

const RELATED = ["extract-pages", "remove-pages", "reorder-pages"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function SplitPdfHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Split PDF | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to split a PDF", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Scissors}
        h1="Cut One PDF Into Several Files, Right in Your Browser"
        description="Three ways to split, so you pick the one that actually matches what you need. Nothing is uploaded."
      />
      <ToolPageClient slug="split-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            Search split pdf online and most tools assume you already know what you want, but
            &quot;split&quot; means three different things depending on who is asking. You might
            want to cut one long document into several standalone files, pull a handful of pages
            out while leaving the original untouched, or break every single page into its own
            file. Picking the wrong one gets you a result you did not ask for: a butchered
            original, or fifty tiny files when you only wanted three. This tool covers all three,
            done entirely in your browser, with nothing uploaded anywhere.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to split a PDF</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            &quot;Split&quot; gets used as a catch-all for three genuinely different operations,
            and confusing them is the single most common reason someone downloads the wrong
            result from a PDF tool.
          </p>
          <p className="leading-relaxed">
            Splitting into several files means the source document stops existing as one thing
            and becomes multiple standalone files that, together, contain every page. Nothing is
            discarded, the document is just divided. This is what you want when a report needs to
            become three separate sections, or a bundle of scanned documents needs to become
            separate files again.
          </p>
          <p className="leading-relaxed">
            Extracting pages is the opposite intent even though it looks similar on the surface.
            You keep the original file completely intact and get back a second, new file
            containing only the pages you picked. Nothing about the source changes or disappears.
            If what you actually want is &quot;copy these three pages out, leave everything else
            alone,&quot; that is extraction, not splitting, and it has its own dedicated page.
          </p>
          <p className="leading-relaxed">
            Breaking a document into single pages is the most extreme version of splitting: every
            page becomes its own file, with no groupings at all. It is the right call when you
            need to feed pages one at a time into another system, or when a batch scan produced
            one file with several unrelated documents stacked inside it and you need each page
            treated as its own unit.
          </p>
          <p className="leading-relaxed">
            These are not mutually exclusive on the same document, only within the same run.
            Someone splitting a scanned batch of five letters into five files, then realizing they
            only actually need one of those five for a specific purpose, is fine running the split
            first and then extracting the one file they care about afterward, or extracting first
            and skipping the rest of the split entirely. There is no wrong order, only a faster and
            a slower one depending on how many of the resulting pieces you actually need.
          </p>
          <p className="leading-relaxed">
            A quick way to tell which one you need: if you want every piece of the original and
            do not care about keeping a single combined copy around, split into several files. If
            you want to keep the original exactly as it is and only need a copy of some of it,
            extract instead. If you need every page as its own file with no groupings, use the
            single-pages option. Picking based on that question, rather than the word
            &quot;split&quot; alone, is what actually determines the tool you want.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Separating a scanned batch into individual documents is a common trigger: a scanner
            fed five different letters through in one pass and saved them as a single 12-page
            file, and each letter needs to become its own document again. Cutting a long report
            into sections to share separately comes up when different recipients only need
            different parts, a finance team gets the numbers section, legal gets the terms
            section, and nobody needs to receive the whole thing to find their piece. It is also
            useful for splitting a merged multi-invoice PDF back into individual invoices, or
            dividing a long ebook or manual into chapter-sized files that are easier to read on a
            small screen. Photographers and designers use it to break a combined portfolio PDF
            back into individual pieces when a client only asked to see three of the ten projects
            inside it, and administrators use it to turn one long combined meeting-minutes file
            into a separate record for each individual meeting.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online split tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Explains the difference between splitting and extracting up front",
                thisTool: true,
                typical: "Rarely, most just offer one option",
              },
              {
                feature: "Page or file size limit",
                thisTool: "None beyond your device's own memory",
                typical: "Often capped on free tiers",
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
            Splitting copies existing page data rather than decoding and re-encoding it, so it is
            fast even on a large file; a 300-page manual splits into chapter files in about 4
            seconds on a laptop. It needs no Web Worker or special browser feature, so it runs on
            effectively any current browser. The practical ceiling is your device&apos;s memory
            while the source file is open: files above roughly 35MB can slow down or struggle on
            an older phone&apos;s browser tab, while a laptop or desktop handles considerably
            larger files without trouble. Only one file can be split at a time; a batch of several
            source PDFs needs to be split one at a time. There is no artificial cap on how many
            output files a single split can produce beyond the source document&apos;s own page
            count, and the ZIP download that bundles multiple results adds only a small amount of
            overhead on top of the combined size of the parts themselves.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Want to keep the original file untouched and just pull a few pages out? See{" "}
            <Link href="/extract-pages-from-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              extract pages from a PDF
            </Link>
            . Need to cut precisely at pages like 1-5, 6-10, and 11-20? See{" "}
            <Link href="/split-pdf-by-page-range" className="font-medium text-primary underline-offset-2 hover:underline">
              split a PDF by page range
            </Link>
            . Doing the opposite, combining files instead of dividing one? See the{" "}
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
