import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/extract-pages-from-pdf`;
const TITLE = "Extract Pages From PDF Free - Keep the Original Intact";
const DESCRIPTION =
  "Extract pages from a PDF free in your browser. Pick non-consecutive pages like 1, 4, and 9-12, and see what carries over: annotations, forms, and bookmarks.";

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
  "Upload the PDF you want to pull pages from.",
  "Tap the pages you want on the thumbnail grid, or type a range like \"1, 4, 9-12\" into the page field above it.",
  "Check the count above the grid, it confirms exactly how many pages are selected before you extract anything.",
  "Choose whether you want one combined file or a separate file per selected page.",
  "Tap \"Extract\" and download. Your original file stays untouched on your device the whole time.",
];

const FAQS = [
  {
    q: "Can I select pages that are not next to each other, like 2 and 15?",
    a: "Yes, tap each one individually, or type them into the range field separated by commas: \"2, 15\" selects exactly those two pages and skips everything in between.",
  },
  {
    q: "What exactly does typing 9-12 select?",
    a: "All four pages from 9 through 12 inclusive: 9, 10, 11, and 12. Combine it with other entries using commas, like \"1, 4, 9-12\", to build up any combination.",
  },
  {
    q: "Do highlights or comments I added to a page survive extraction?",
    a: "Yes, page-level annotations are stored as part of that page's own data, so they travel with it into the extracted file automatically.",
  },
  {
    q: "Will a fillable form field still work in the extracted page?",
    a: "Not reliably. The visible box usually survives, but the underlying structure that ties every field into one working form is document-level and does not get rebuilt, so treat an extracted form page as unreliable to fill in.",
  },
  {
    q: "Does the extracted file keep the table of contents from the original?",
    a: "No, bookmarks live in a separate top-level structure that is not tied to individual pages, so a new file built from a handful of extracted pages does not carry that navigation over.",
  },
  {
    q: "Can I extract the same page into two different output files?",
    a: "Yes, run the extraction twice with different selections. There is nothing stopping the same source page from appearing in more than one result.",
  },
  {
    q: "What happens if I select zero pages by mistake?",
    a: "The extract button stays disabled until at least one page is selected, so there is no way to accidentally generate an empty file.",
  },
  {
    q: "Does extraction change the rotation of a page I already rotated?",
    a: "No, rotation is stored on the page itself and is copied along with everything else, so a page you rotated beforehand keeps that rotation in the extracted file.",
  },
];

const RELATED = ["split-pdf", "remove-pages", "reorder-pages"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function ExtractPagesFromPdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Extract Pages From PDF | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to extract pages from a PDF", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={FileCheck2}
        h1="Pull Specific Pages Out of a PDF, Leave the Original Untouched"
        description="Non-destructive by design: your source file never changes. Nothing is uploaded."
      />
      <ToolPageClient slug="extract-pages" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            Extracting pages from a PDF is not the same thing as splitting one. When you extract
            pages from a PDF here, the source file never changes. You choose the pages you want,
            type &quot;1, 4, 9-12&quot; or tap them on screen, and the tool builds a brand new file
            containing only those pages, in that order. The original stays exactly as it was,
            still on your device, still whole. Nothing about this tool touches it. That
            distinction matters more than it sounds: some tools quietly modify or discard the
            source, and this one never does.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to extract pages from a PDF</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Pulling one invoice out of a monthly statement is a routine case: you need just page
            14 of a 30-page bank statement for an expense report, and the other 29 pages are
            irrelevant to that claim. Extracting just the signature page of a contract, the final
            page after everyone has signed, is another regular one, useful when you need to send
            or file proof of signature without circulating the entire agreement again. It also
            comes up when pulling the results or summary page out of a long lab or audit report to
            share on its own, or lifting a single chapter or article out of a scanned book or
            journal PDF without extracting the whole volume. Job applicants use it to pull one
            reference letter out of a folder of several without sending the others, and property
            managers use it to extract just the lease clauses relevant to a specific dispute
            instead of forwarding the entire signed agreement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            The page field accepts a comma-separated list, and each entry is either a single page
            number or a range written with a hyphen. Typing &quot;1, 4, 9-12&quot; selects six
            pages total: page 1, page 4, and pages 9 through 12. Order in the field does not
            matter and the output always keeps pages in their original document order regardless
            of how you typed them. A reversed range like &quot;12-9&quot; is corrected
            automatically rather than rejected, a page number beyond your document&apos;s actual
            page count is silently ignored instead of throwing an error, and overlapping entries
            like &quot;1-5, 3-7&quot; simply collapse into pages 1 through 7 once each, never
            duplicated in the result.
          </p>
          <p className="leading-relaxed">
            A worked example: a 45-page annual report has its cover page on page 1, the financial
            summary on pages 9 through 12, and the auditor&apos;s signature on page 45. Typing
            &quot;1, 9-12, 45&quot; extracts exactly those six pages into one new six-page file in
            the original order, cover first, then the four summary pages, then the signature
            last, regardless of the order the numbers were typed in.
          </p>
          <p className="leading-relaxed">
            What survives extraction and what does not comes down to where each thing actually
            lives inside a PDF. Annotations, highlights, comments, drawn shapes, and links are
            stored as part of the page itself, so they copy over automatically with the page they
            belong to. Rotation works the same way: a page you already rotated keeps that rotation
            in the extracted file. Bookmarks are different. The document outline that powers a
            table of contents is a separate, top-level structure that is not attached to any one
            page, so a new file built from a handful of extracted pages never carries that
            navigation over, even though the pages themselves are complete.
          </p>
          <p className="leading-relaxed">
            Fillable forms sit in between. A PDF form is not just the visible boxes you see and
            click into, it is also a document-level registry, the AcroForm, that connects every
            field by name so the whole thing behaves as one form. Extracting a page keeps the
            visible box, since that part lives on the page, but does not rebuild the AcroForm
            registry behind it. A form field can look completely normal in an extracted page and
            still not fill in reliably, so treat any form page you extract as something to verify
            before you rely on it.
          </p>
          <p className="leading-relaxed">
            None of this is unique to extraction, the same rules apply to splitting and merging on
            this site, since all three build a new document from copied pages rather than editing
            the original in place. What makes it worth spelling out here specifically is that
            extraction is usually the tool people reach for when only one or two pages matter, a
            signature page, a single form, a specific clause, exactly the cases where a form field
            silently not working is most likely to actually cause a problem later.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online extract tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Explains what carries over: annotations, rotation, bookmarks, forms",
                thisTool: true,
                typical: "Rarely disclosed at all",
              },
              {
                feature: "Guarantees the original file is never modified",
                thisTool: true,
                typical: "Usually, but rarely stated outright",
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
            Extraction copies existing page data instead of decoding and re-encoding it, so it is
            fast regardless of how many pages you select. It needs no Web Worker or special
            browser feature, so it runs on effectively any current browser. Only one source file
            can be open at a time, and the practical ceiling is your device&apos;s memory while
            that file is loaded: sources above roughly 35MB can slow down or struggle on an older
            phone&apos;s browser tab, while a laptop or desktop handles considerably larger files
            without trouble. There is no cap on how many individual pages you can select beyond
            the document&apos;s own page count, so selecting 200 out of a 400-page file works the
            same way as selecting two out of ten.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Want the general split walkthrough, or need to actually divide the file rather than
            copy pages out of it? See the{" "}
            <Link href="/split-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              split PDF hub
            </Link>
            . Need to cut at precise ranges like 1-5, 6-10, and 11-20 instead of picking
            individual pages? See{" "}
            <Link href="/split-pdf-by-page-range" className="font-medium text-primary underline-offset-2 hover:underline">
              split a PDF by page range
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
