import type { Metadata } from "next";
import Link from "next/link";
import { Layers } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/combine-pdf-pages-into-one`;
const TITLE = "Combine PDF Pages Into One File - Free, No Signup";
const DESCRIPTION =
  "Combine PDF pages into one file, free in your browser. Batch-select a folder of loose single-page files, verify the page count, and download one tidy document.";

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
  "Select every loose file in the folder at once. Most file pickers support shift-click for a range or ctrl/cmd-click for individual files, so you never add fifty files one by one.",
  "Check the count in the list against how many files you started with. It is easy to miss one in a folder that large.",
  "Arrange them into the order you need. A sensible naming convention beforehand often means the default order is already correct.",
  "Merge into a single file.",
  "Open the result and check its page count against what you expected, before deleting or archiving the loose originals.",
];

const FAQS = [
  {
    q: "How do I select twenty or more loose PDF files at once instead of adding them one by one?",
    a: "Use your device's file picker range-select, shift-click the first and last file in a folder to grab everything between them, or ctrl-click (cmd-click on a Mac) to pick specific files out of a longer list.",
  },
  {
    q: "Is there a quick way to confirm the combined file has every page from every source file?",
    a: "Check the merged file's total page count against the number of source files, since a folder of single-page PDFs should produce a merged file with exactly that many pages, one per file.",
  },
  {
    q: "What should I name the combined file so I can find it again later?",
    a: "A name that describes the group and the date, like \"invoices-2026-q1.pdf\" rather than a generic \"merged.pdf,\" makes it findable months later without opening it.",
  },
  {
    q: "If one of my loose files is corrupted, will it stop the whole batch from combining?",
    a: "It depends on how badly damaged the file is. A file that will not open at all typically gets skipped or triggers an error for that one item, rather than silently breaking the rest of the batch.",
  },
  {
    q: "Can I combine PDFs that live in different folders on my device in a single pass?",
    a: "Yes, add files from one folder, then use the file picker again to add more from a different location before merging. Everything added ends up in the same batch.",
  },
  {
    q: "After combining, can I tell which pages originally came from which file?",
    a: "Not automatically, since the merged file is one continuous document with no built-in markers. Note the order you arranged the files in, or keep the file names as a reference, if that mapping matters later.",
  },
  {
    q: "Is combining fifty one-page invoices meaningfully slower than combining five larger files?",
    a: "Not really. Merging copies existing page data rather than processing it, so the total number of pages matters more than how that page count is split across files.",
  },
  {
    q: "Do I need to close and reopen the tool between batches, or can I combine another set right away?",
    a: "You can start straight over with a new set of files right after downloading. Nothing about the tool needs a reset in between.",
  },
];

const RELATED = ["split-pdf", "reorder-pages", "compress-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CombinePdfPagesIntoOnePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Combine PDF Pages Into One File | ${SITE_NAME}`,
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
            howToJsonLdNamed("How to combine PDF pages into one file", HOW_TO_STEPS)
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Layers}
        h1="Turn a Folder of Loose PDF Files Into One Organized Document"
        description="Batch-select, verify the count, and clean up the mess. Nothing is uploaded."
      />
      <ToolPageClient slug="merge-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            A folder of forty single-page PDFs, one invoice or one form page per file, is not
            really usable as a folder. You want to combine PDF pages into one file so you can
            email it, archive it, or upload it as a single attachment instead of forty. That is a
            cleanup job as much as it is a merge, so the workflow that matters most here is not
            what merging technically does to bookmarks or forms. It is getting every loose file
            into the batch, in the right order, and being able to confirm afterward that nothing
            got left out.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to combine loose PDF pages into one file</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            The slow part of this job is almost never the merge itself, it is getting a large
            folder of files into the tool without adding them one at a time. Every modern file
            picker supports range selection: click the first file, hold shift, click the last one,
            and everything between them gets selected in one action. Ctrl-click, or cmd-click on a
            Mac, adds or removes individual files from that selection if the folder has some files
            you do not want included. This tool accepts up to 50 files in a single batch, so a
            typical folder of loose pages rarely needs more than one pass.
          </p>
          <p className="leading-relaxed">
            A consistent naming convention before you ever open the merge tool saves the most
            time. Numbering files with the same digit width, invoice-01.pdf through invoice-12.pdf
            rather than invoice-1.pdf through invoice-12.pdf, means the batch is often already in
            the right order the moment you add it, and dragging to reorder becomes a final check
            rather than a full rebuild. For a batch where the naming itself is the hard part, see
            merging PDFs in a specific order for the full explanation of why plain numbers sort
            incorrectly.
          </p>
          <p className="leading-relaxed">
            Verifying the result matters more here than in a typical two or three file merge,
            because it is easy to lose track of one file inside a batch of forty. The most
            reliable check is arithmetic: a folder of genuinely single-page files should produce a
            merged file with exactly as many pages as there were source files. Open the result,
            check the page count, and if the numbers do not match, one file either failed to add
            or was not actually a single page to begin with. Do this check before deleting or
            filing away the loose originals, not after.
          </p>
          <p className="leading-relaxed">
            Dragging a whole folder window&apos;s worth of files straight onto the upload area works as
            an alternative to the picker dialog on most desktop browsers, and it is often faster
            than opening a dialog box at all if the files are already visible in a file manager
            window. It selects everything visible the same way a range-select would, so the file
            count check afterward matters just as much either way. Not every file in a &quot;loose
            pages&quot; folder is actually one page, occasionally a scan gets saved as two or three
            pages by mistake, so a page count that comes out higher than the file count usually
            points to exactly that, not an error in the merge itself.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online merge tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Batch-select dozens of loose files in one file-picker action",
                thisTool: true,
                typical: "Often limited to a handful added per step",
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
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Monthly invoices are a routine trigger, an accounting tool or vendor portal exports
            one PDF per invoice, and combining twelve months into one file makes a much easier
            handoff to an accountant than twelve separate attachments. This kind of batch rarely
            carries anything more complex than plain pages, no bookmarks, no fillable form fields,
            so the parts of a general merge that need the most explaining, what happens to a
            document&apos;s outline or its form structure, mostly do not apply here at all.
            Downloaded payslips follow the same pattern, a payroll portal generates one PDF per
            pay period, and a year of
            them combined into one document is what most loan or visa applications actually ask
            for. Scattered form pages come up when a multi-part form was filled out and saved as
            separate single-page files from a scanner or a print-to-PDF step, and each part needs
            to become one section of a single submission file a portal will only accept as one
            upload. Tax filing season produces its own version of this mess, a government portal
            or employer issuing one receipt or certificate per document, all of which an
            accountant would rather receive as a single file than open one at a time from an
            inbox full of separate attachments.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Limits</h2>
          <p className="leading-relaxed">
            There is a 50-file cap per merge; a folder larger than that needs two passes, combined
            together afterward in a second merge. Merging needs no Web Worker or special browser
            feature, since it copies existing page data rather than processing it, so it runs on
            effectively any current phone or desktop browser. Memory is the practical ceiling for
            a very large batch, since every file sits in your device&apos;s memory while the merge
            runs; a phone can start slowing down somewhere past a combined 100MB to 150MB across
            all files, while a laptop or desktop comfortably handles more. A folder of sixty or
            seventy single-page invoices, each a lightweight text PDF well under 100KB, usually
            stays nowhere near that ceiling even in one batch; it is a folder of sixty scanned
            image-heavy pages, not the file count itself, that is more likely to need splitting
            into two merges.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Files not already numbered in a usable order? See{" "}
            <Link href="/merge-pdf-in-order" className="font-medium text-primary underline-offset-2 hover:underline">
              merge PDF files in a specific order
            </Link>{" "}
            for the naming trick and the drag-to-reorder workflow. For the general merge
            walkthrough, head to the{" "}
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
