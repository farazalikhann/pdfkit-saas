import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/merge-pdf-without-losing-quality`;
const TITLE = "Merge PDF Without Losing Quality - Free Online Tool";
const DESCRIPTION =
  "Merge PDF files without losing quality, free in your browser. Merging is not compression, and this page explains exactly why, with a way to check the file.";

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
  "Upload the PDFs you want to combine, exactly as they are.",
  "Reorder them by dragging the thumbnails into the sequence you want.",
  "Merge, and download the result.",
  "Compare file sizes. The merged file should land close to the sum of the originals, not noticeably smaller.",
  "Open the merged file and zoom into a photo or dense text at 200 percent. If it looked sharp in the original, it should look identical here.",
];

const FAQS = [
  {
    q: "Does merging PDFs actually compress them in any way?",
    a: "No, this tool's merge step does not recompress or resample anything. Pages are copied as they exist in the source files.",
  },
  {
    q: "If two of my PDFs total 10MB combined, will the merged file also be about 10MB?",
    a: "Yes, roughly, plus a small amount of overhead from the new document structure. A dramatically smaller result would be unusual and worth double-checking the images for.",
  },
  {
    q: "If I merge a high-resolution PDF with a lower-quality scanned one, does the high-resolution one get downgraded to match?",
    a: "No, each page keeps its own original quality independently. Merging does not normalize or average quality across the files.",
  },
  {
    q: "Can I check whether a merge tool is secretly recompressing my images?",
    a: "Compare the merged file's size against the sum of the originals, and zoom into an image at high magnification in both the original and merged file to compare directly.",
  },
  {
    q: "Does merging affect vector graphics or diagrams the same way it affects photos?",
    a: "No, vector content is copied as actual vector data, not flattened into an image, so lines and shapes stay exactly as crisp as the source.",
  },
  {
    q: "Why did my file get slightly bigger after merging instead of staying the same size?",
    a: "A new PDF document carries its own small amount of structural overhead, so a slight increase over the exact sum of the originals is normal and not a sign of anything wrong.",
  },
  {
    q: "Is there any reason to compress before merging instead of after?",
    a: "Either order works technically, but compressing first lets you judge each document's quality individually before it becomes part of a combined file.",
  },
  {
    q: "Does the merged file keep the exact same colors as the originals?",
    a: "Yes, color data is part of the copied content and is not reprocessed, so colors stay exactly as they were in each source file.",
  },
];

const RELATED = ["compress-pdf", "split-pdf", "reorder-pages"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function MergePdfWithoutLosingQualityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Merge PDF Without Losing Quality | ${SITE_NAME}`,
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
            howToJsonLdNamed("How to merge PDFs without losing quality", HOW_TO_STEPS)
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={ShieldCheck}
        h1="Why Merging PDFs Should Never Reduce Quality"
        description="Merging is not compression. Here is exactly why, and how to check it yourself. Nothing is uploaded."
      />
      <ToolPageClient slug="merge-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            Search for how to merge PDF without losing quality and you will find a strange
            amount of worry for something that, done correctly, involves zero quality loss.
            Merging is not compression. This tool copies each page&apos;s actual content, text,
            vector graphics, embedded images, directly into a new file, the same way a
            photocopier assembles pages rather than redrawing them. If your images look softer or
            your text looks fuzzier after merging with some other tool, that tool did something
            extra you did not ask for, and this page explains what to check to catch it.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to merge without any quality loss</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            There are exactly two things that make a merge look worse than the originals, and
            neither one is inherent to merging itself.
          </p>
          <p className="leading-relaxed">
            The first is a tool that quietly recompresses images while it merges, usually to
            shrink the combined file size without telling you. This tool never does that.
            Merging and compressing are two separate operations here on purpose, so combining
            files never touches image data at all. You can verify this yourself with a simple
            size check. Merge two 5MB PDFs and get back something noticeably smaller than 10MB,
            and either the source files had genuinely redundant data removed by lossless cleanup,
            or something recompressed the images, in which case check the images specifically for
            softening. A properly built merge produces a file close to the sum of its parts, give
            or take a small amount of combined document overhead.
          </p>
          <p className="leading-relaxed">
            The second, more common cause is not the merge tool at all. It is a print-to-PDF
            workaround: someone opens each file, prints it to a virtual PDF printer, and combines
            the printed output. Printing rasterizes every page, converting real text and vector
            graphics into a flat image at whatever resolution the print driver defaults to, often
            well under the sharpness of the original. That process throws away real quality
            before merging even starts, so the merge itself gets blamed for damage that already
            happened somewhere else. This tool never does that either. It copies each page&apos;s
            actual PDF content objects directly, so text stays text and vector graphics stay
            vector graphics all the way through.
          </p>
          <p className="leading-relaxed">
            The honest caveat: if your source PDFs are themselves scanned images, a scan is
            already a raster image before it ever reaches a merge tool. Merging a scan does not
            make it any softer than it already was, but it also cannot make a blurry scan
            sharper. Quality after merging is bounded entirely by the quality of what went in.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Combining a professionally designed brochure or portfolio PDF with other documents is
            a case where any visible softening would be immediately obvious. Merging a legal
            contract with an addendum needs the exact wording and formatting to stay
            pixel-identical to what was reviewed and signed off on. Putting together a print-ready
            document, a magazine layout or a book proof, matters because print output reveals
            compression artifacts a screen would hide entirely. Combining architectural or
            engineering drawings exported as PDF matters for a different reason: a line shifting
            even slightly from recompression could misrepresent an actual measurement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online merge tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Touches image data during merge",
                thisTool: false,
                typical: "Sometimes, and rarely disclosed",
              },
              {
                feature: "Builds the file from real PDF content, not a rasterized print job",
                thisTool: true,
                typical: "Some free web tools work this way internally",
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
            This tool cannot fix quality that was already lost before merging. A blurry scan
            stays exactly as blurry, and a low-resolution image does not get sharper just because
            it joined a higher-quality document. There is a 50-file cap per merge, and unlike
            some of the compression tools on this site, merging needs no Web Worker or special
            browser feature, so it runs on effectively any modern browser without a compatibility
            gap. Memory is the practical ceiling, since every file&apos;s content sits in your
            device&apos;s memory while merging runs. A combined total past roughly 100MB to 150MB
            across all files can slow down or stall on an older phone, while a laptop or desktop
            handles considerably more without issue.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Want to see the merge in action first? Head to the{" "}
            <Link href="/merge-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              merge PDF hub
            </Link>{" "}
            for the full walkthrough. Combining photos alongside your documents? See{" "}
            <Link href="/combine-pdf-and-images" className="font-medium text-primary underline-offset-2 hover:underline">
              combine PDF and JPG into one file
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
