import type { Metadata } from "next";
import Link from "next/link";
import { GripVertical } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/merge-pdf-in-order`;
const TITLE = "Merge PDF Files in Order - Drag to Rearrange Free";
const DESCRIPTION =
  "Merge PDF files in a specific order, free in your browser. See why alphabetical sorting breaks sequences like Chapter 10 before Chapter 2, and drag to fix it.";

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
  "Add every file that belongs in the final document, drag them in or select from your device, up to 50 at once.",
  "Ignore the order they loaded in. That is almost always your file manager's own sort, not the sequence you actually need.",
  "Drag each thumbnail into position until the list reads top to bottom in the order the pages should appear.",
  "Scroll through the arranged list once more before merging. A single swapped chapter or file is easy to miss and hard to catch afterward.",
  "Merge and download the combined file.",
];

const FAQS = [
  {
    q: "Why do my files merge in the wrong order even though I picked them correctly?",
    a: "Most tools merge in whatever order your device's file picker lists them, which is alphabetical by file name, not the order you clicked or the order the document should read in.",
  },
  {
    q: "What is the 01, 02, 03 naming trick, and why does it fix sorting?",
    a: "File names sort character by character, so \"10\" sorts before \"2\" because \"1\" is compared before \"2\" ever gets looked at. Padding every number to the same width, 01 through 10 instead of 1 through 10, makes the character comparison match the numeric order.",
  },
  {
    q: "Does renaming my files change anything inside the PDF itself?",
    a: "No, a file name is metadata your operating system tracks, not something stored inside the PDF. Renaming a file before merging has zero effect on the document's actual content.",
  },
  {
    q: "Can I fix the order after merging, or do I have to start over?",
    a: "You would need to split the merged file back apart and reorder it, so it is faster to fix the order before merging in the first place, or redo the merge with the files rearranged.",
  },
  {
    q: "Does drag-to-reorder work the same way on a phone as on a desktop?",
    a: "Yes, press and hold a thumbnail to pick it up, then drag it to its new position, the same gesture as reordering apps on a home screen.",
  },
  {
    q: "If I add ten files, are the first and last locked in place, or can I move every file freely?",
    a: "Every file can move freely to any position. Nothing is anchored at the start or end of the list.",
  },
  {
    q: "Can I reorder the pages inside one file, not just the position of whole files in the batch?",
    a: "Not from this screen, since it arranges whole files. Use the reorder pages tool first on that one file, save it, then bring it back here to arrange it among the others.",
  },
  {
    q: "Is there a way to preview the final order before merging so I don't have to redo it?",
    a: "Yes, the arranged list itself is the preview. Read down it top to bottom exactly as you would read the finished document before tapping merge.",
  },
];

const RELATED = ["reorder-pages", "split-pdf", "extract-pages"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function MergePdfInOrderPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Merge PDF Files in Order | ${SITE_NAME}`,
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
            howToJsonLdNamed("How to merge PDF files in a specific order", HOW_TO_STEPS)
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={GripVertical}
        h1="Keep Every File in the Right Sequence When You Combine PDFs"
        description="Drag to rearrange instead of trusting alphabetical sort. Nothing is uploaded."
      />
      <ToolPageClient slug="merge-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            Most PDF tools merge files in whatever order your operating system lists them, which
            is alphabetical by file name. That works fine until you need to merge PDF files in a
            specific order and your file names do not sort the way the document actually reads,
            chapter 10 landing ahead of chapter 2, or a July statement sitting before June. This
            tool skips alphabetical sorting entirely. You add every file, then drag each one into
            position yourself, so the sequence in the final document is exactly the one you
            choose, not the one your file names happen to spell out.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to merge PDFs in the right order</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            File names do not sort numerically, they sort as text, one character at a time. A
            file picker comparing &quot;chapter-10.pdf&quot; and &quot;chapter-2.pdf&quot; looks at
            the first character where they differ, and &quot;1&quot; comes before &quot;2&quot; in
            plain character order, so chapter 10 gets placed ahead of chapter 2 even though nine
            chapters belong between them. The same problem hits dated files: &quot;statement-9.pdf&quot;
            sorts after &quot;statement-10.pdf&quot; for the identical reason. Nothing is broken,
            the sort is doing exactly what character comparison always does, it just does not
            match how humans count.
          </p>
          <SequenceComparisonGraphic
            wrongLabel="Alphabetical file-name sort"
            wrongSequence="chapter-1, chapter-10, chapter-2, chapter-3"
            rightLabel="Zero-padded numeric names"
            rightSequence="chapter-01, chapter-02, chapter-03, chapter-10"
            caption="Plain numbers sort as text and put chapter 10 before chapter 2. Padding every number to the same width, 01 instead of 1, fixes the sort without touching a single page."
          />
          <p className="leading-relaxed">
            The fix that works everywhere, not just in this tool, is padding every number to the
            same width before you save or export the files: 01, 02, 03, all the way through 10,
            instead of 1, 2, 3. Once every number occupies the same number of digits, character
            sorting and numeric sorting produce the same result, and any file picker anywhere
            lists them correctly without you having to think about it again.
          </p>
          <p className="leading-relaxed">
            Renaming files works, but it is one more step you can skip. Dragging thumbnails into
            position here does the same job without touching a single file name, and it also
            covers cases naming can&apos;t, like a checklist that puts item 4 before item 1
            because that is the order the recipient wants to see them in, not because of anything
            numeric at all. Add the files, then arrange them by eye against whatever sequence
            actually matters for that document.
          </p>
          <p className="leading-relaxed">
            It helps to be clear on what this screen actually reorders. It arranges whole files
            relative to each other, deciding which entire document comes first, second, and so on
            in the merged output. It does not reach inside a file to reorder the pages within it.
            If one of your source PDFs itself has its internal pages in the wrong order, straighten
            that out with the reorder pages tool first, save it, and only then bring it into this
            batch to position it among the others.
          </p>
          <p className="leading-relaxed">
            The two approaches work best together rather than as alternatives. Padding file
            names, invoice-01 through invoice-12, gets a large batch close to correct before you
            even open the merge tool, so the drag step becomes a quick visual check instead of a
            full manual sort. For a one-off merge of three or four files, renaming is not worth
            the extra step at all, since dragging them into place directly is faster than opening
            each file&apos;s properties to rename it first. Save the naming discipline for batches you
            expect to merge repeatedly, a monthly report built from the same set of source files
            each time, where getting the names right once keeps every future merge in order
            automatically.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Legal filings often have to follow a court or opposing counsel&apos;s exact exhibit
            order, not the order the documents were scanned in. Book and thesis chapters,
            scanned or exported one file per chapter, need to read in publication order, where a
            single misplaced chapter is the kind of mistake a reader notices immediately. Dated
            statements, bank, utility, or payroll records saved one PDF per month, are expected to
            read chronologically, and a July statement ahead of June looks like an error even
            though nothing about the content is wrong. Application packets are the strictest case:
            a checklist from a university, visa office, or lender often specifies the exact
            sequence documents must appear in, and getting that order wrong can mean the
            submission gets sent back regardless of whether every required document is actually
            there. A grant or scholarship submission is a close cousin of this, where the
            instructions frequently number the required attachments, transcript, essay,
            recommendation letters, in a specific position, and reviewers working through dozens
            of applications notice a packet that does not match the requested order.
          </p>
          <p className="leading-relaxed">
            In each of these cases, the order requirement usually comes with its own reference
            point, an exhibit list labeled A through F, a table of contents, a checklist with
            numbered line items, that you can check the arranged list against directly before
            merging. Reading down the drag-to-reorder list top to bottom against that reference,
            one line at a time, catches a misplacement far more reliably than trying to remember
            the correct order from memory.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online merge tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Lets you fix the order by dragging, not just by renaming files first",
                thisTool: true,
                typical: "Rarely, most just merge in upload or file-name order",
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
            Dragging to reorder works through standard pointer and touch events, so it needs no
            special browser feature and runs on effectively any current phone or desktop browser.
            There is a 50-file cap per merge, and the practical ceiling beyond that is your
            device&apos;s memory, since every file&apos;s content sits in memory while you arrange
            and merge them. A phone can start struggling somewhere past a combined 100MB to 150MB
            across all files, while a laptop or desktop handles considerably more. Beyond 50
            files, merge in two ordered batches and combine the results afterward, keeping a note
            of where the split fell so the second batch picks up in the correct position rather
            than guessing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Just need the general merge walkthrough? Head to the{" "}
            <Link href="/merge-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              merge PDF hub
            </Link>
            . Combining a large folder of loose single-page files and want to confirm nothing got
            left out? See{" "}
            <Link href="/combine-pdf-pages-into-one" className="font-medium text-primary underline-offset-2 hover:underline">
              combine PDF pages into one file
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
