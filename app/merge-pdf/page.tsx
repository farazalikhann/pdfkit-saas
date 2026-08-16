import type { Metadata } from "next";
import Link from "next/link";
import { Combine } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/merge-pdf`;
const TITLE = "Merge PDF Files Online Free - No Upload, No Limits";
const DESCRIPTION =
  "Merge PDF files free, right in your browser. Drag to reorder, combine up to 50 files at once, and see exactly what happens to bookmarks and form fields.";

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
  "Add two or more PDF files, drag them in or select from your device. Up to 50 at once.",
  "Drag the thumbnails into the order you want them to appear in the final file.",
  "Double-check the order before merging. Once combined, similar-looking pages are hard to tell apart without opening the result.",
  "Tap \"Merge PDFs.\"",
  "Download the combined file, or start over if you need to change the order.",
];

const FAQS = [
  {
    q: "What happens to bookmarks when I merge PDFs?",
    a: "They are not carried over. The document outline is a separate structure from the pages themselves, and this tool, like most straightforward mergers, rebuilds a new document without reconstructing it.",
  },
  {
    q: "Will a fillable form still work after I merge it with other PDFs?",
    a: "Not reliably. The visible fields often survive, but the underlying structure connecting them into one working form usually does not, so treat a merged form as unreliable for filling in.",
  },
  {
    q: "Can I merge PDFs that are different page sizes, like A4 and Letter?",
    a: "Yes, each page keeps its own original size in the merged file. Nothing gets stretched or cropped to match another page's dimensions.",
  },
  {
    q: "What order do the pages end up in after merging?",
    a: "Exactly the order you arrange the files in before merging, and each file's own internal page order is preserved within that.",
  },
  {
    q: "Can I remove a file from the batch before merging if I added the wrong one?",
    a: "Yes, remove it from the list before you tap merge. Nothing is processed until you actually run the merge.",
  },
  {
    q: "Does merging add page numbers, or do I need to add those separately?",
    a: "Merging does not add page numbers on its own. Use the page numbers tool afterward if you want continuous numbering across the combined file.",
  },
  {
    q: "What happens if two of my files have the same file name?",
    a: "Nothing, the file name has no effect on merging. Only the order you arrange them in matters, since the output is a single new file regardless of what the sources were called.",
  },
  {
    q: "Can I merge password-protected PDFs?",
    a: "Not directly. Remove the password first using the unlock tool, then merge the unlocked file.",
  },
];

const RELATED = ["split-pdf", "reorder-pages", "compress-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function MergePdfHubPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Merge PDF | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to merge PDF files", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Combine}
        h1="Combine Multiple PDFs Into One File, Right in Your Browser"
        description="Drag to reorder, merge up to 50 files at once. Nothing is uploaded."
      />
      <ToolPageClient slug="merge-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            If you need to merge PDF files without installing anything or creating an account,
            this tool combines as many as you like directly in your browser tab. Drag your files
            into the order you want, and it stitches them into a single document using the same
            page-copying approach desktop PDF software relies on, not an upload-wait-download
            loop. Combine a contract with its signed signature page, put every receipt from a
            trip into one file for an expense report, or merge scanned chapters back into a
            single book. Nothing you add here actually gets uploaded anywhere, since the whole
            process runs on your device.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to merge PDF files</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            Merging sounds like it should be simple, glue file A to file B, but three things
            commonly go wrong with other tools, and it is worth knowing what actually happens
            here.
          </p>
          <p className="leading-relaxed">
            Bookmarks, technically the document outline, live at the top level of a PDF, not
            attached to individual pages. When two PDFs combine, the result is built as a
            genuinely new document with pages copied in from each source. Since an outline is a
            separate structure that has to be deliberately rebuilt, most straightforward merge
            tools, including this one, do not carry bookmarks over. If your source PDFs have a
            table of contents built from real bookmarks, expect the merged file to lose that
            navigation, even though every page is still there in full.
          </p>
          <p className="leading-relaxed">
            Fillable form fields run into a related problem. A PDF form is not just checkboxes
            and text boxes sitting on a page. It is a document-level structure, called an
            AcroForm, that ties every field together with names, default values, and validation
            rules, plus the visible boxes on the page itself, called widget annotations. When
            pages get copied into a new document, the visible widget boxes usually come along,
            but the AcroForm structure that makes them behave as one connected, fillable form
            does not automatically get rebuilt. A form field might still be visible in a merged
            file, but do not count on it filling in correctly the way it did in the original.
          </p>
          <p className="leading-relaxed">
            Page sizes are the one area where merging is more forgiving than people expect. Each
            page keeps its own original size, whatever that was. Merge an A4 report with a US
            Letter cover page and neither one gets stretched, cropped, or forced to match the
            other. They sit next to each other in the file, each at its own dimensions, exactly
            as they looked before.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Combining scanned chapters of a book or thesis that were scanned separately, one file
            per chapter, back into a single continuous document is a common case. Application
            submissions often require exactly one PDF: a job application asking for a resume,
            cover letter, and certificates as a single file, or a visa or loan application
            requiring several supporting documents combined into one upload. Expense reports are
            another regular trigger, several photographed or scanned receipts, each saved as its
            own file, merged into one document to attach to a single claim instead of uploading
            five separate files. It also comes up when a signed signature page, scanned
            separately after printing and signing, needs to rejoin the longer contract it came
            from.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online merge tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "File count limit",
                thisTool: "Up to 50 files per merge",
                typical: "Often 5 to 20 on free tiers",
              },
              {
                feature: "Explains what happens to bookmarks and form fields",
                thisTool: true,
                typical: "Rarely disclosed at all",
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
            Merging does not decode or re-encode images the way compression does, so it is
            genuinely fast. Combining 40 files of around 2MB each usually takes a few seconds on
            a laptop, since the tool is copying already-built page data rather than processing
            image content. Unlike some of the compression tools on this site, merging does not
            need Web Workers or OffscreenCanvas, so it runs in effectively any modern browser
            without special feature support. The practical ceiling is the combined size of
            everything you add sitting in your device&apos;s memory at once. A phone can start
            struggling somewhere past a combined 100MB to 150MB across all files, while a laptop
            or desktop comfortably handles several times that. There is a hard cap of 50 files
            per merge; beyond that, merge in two batches and combine the results afterward.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Worried a merge might soften your images? See{" "}
            <Link href="/merge-pdf-without-losing-quality" className="font-medium text-primary underline-offset-2 hover:underline">
              merge a PDF without losing quality
            </Link>{" "}
            for the honest technical answer. Need to combine photos with your PDFs? See{" "}
            <Link href="/combine-pdf-and-images" className="font-medium text-primary underline-offset-2 hover:underline">
              combine PDF and JPG into one file
            </Link>
            . Need the files in an exact sequence, not alphabetical order? See{" "}
            <Link href="/merge-pdf-in-order" className="font-medium text-primary underline-offset-2 hover:underline">
              merge PDF files in a specific order
            </Link>
            . Working from a scanner? See{" "}
            <Link href="/merge-scanned-documents" className="font-medium text-primary underline-offset-2 hover:underline">
              merge scanned documents into one PDF
            </Link>
            . Cleaning up a large folder of loose single-page files? See{" "}
            <Link href="/combine-pdf-pages-into-one" className="font-medium text-primary underline-offset-2 hover:underline">
              combine PDF pages into one file
            </Link>
            . If the merged file comes out too large afterward,{" "}
            <Link href="/compress-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF
            </Link>{" "}
            shrinks it back down. Need to go the other way and divide a file instead of combining
            several? See the{" "}
            <Link href="/split-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              split PDF hub
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
