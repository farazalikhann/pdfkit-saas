import type { Metadata } from "next";
import Link from "next/link";
import { Images } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/combine-pdf-and-images`;
const TITLE = "Combine PDF and JPG Into One File - Free Online";
const DESCRIPTION =
  "Combine PDF and JPG files into one document, free in your browser. Convert photos to pages first, then merge them, with full control over order and page size.";

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
  "Convert your photos to PDF first using the JPG to PDF tool, choosing a page size and how each photo should fit its page.",
  "Reorder the photos before converting if you need a specific sequence, since that becomes the page order in the resulting file.",
  "Download the converted PDF, then bring it back to this tool alongside your other PDFs.",
  "Drag the files, the new photo PDF and your existing documents, into the final order you want.",
  "Merge and download the combined file.",
];

const FAQS = [
  {
    q: "Can I combine a PDF and a JPG in a single upload step?",
    a: "Not in one step, since a photo has to become a PDF page first. The two-step process here takes about as long as one step would.",
  },
  {
    q: "What page size do my photos become when I convert them?",
    a: "A4 by default, with Letter and match-image, the photo's own exact dimensions, also available.",
  },
  {
    q: "Will a landscape photo get squeezed onto a portrait page?",
    a: "No, orientation is detected automatically by default, so a landscape photo gets a landscape page unless you force one orientation for the whole batch.",
  },
  {
    q: "Why did one of my phone photos come out sideways in the PDF?",
    a: "The photo likely used a rotation flag rather than being physically rotated. Rotate it in your phone's gallery app first, then convert it again.",
  },
  {
    q: "Can I mix documents and photos in any order in the final file?",
    a: "Yes, once the photos are converted to a PDF, that file behaves exactly like any other PDF you can drag into any position during the merge step.",
  },
  {
    q: "Does converting a photo to a PDF page reduce its quality?",
    a: "No, the photo is embedded at its original resolution unless you choose a fit mode that scales it down to fit a smaller page.",
  },
  {
    q: "Is there a limit on how many photos I can combine into one file?",
    a: "Up to 50 per conversion batch, and up to 50 files again at the merge step, so a very large set may need two rounds.",
  },
  {
    q: "Can I combine screenshots the same way as camera photos?",
    a: "Yes, screenshots work the same way as any other image file in both the conversion and merge steps.",
  },
];

const RELATED = ["jpg-to-pdf", "rotate-pages", "compress-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CombinePdfAndImagesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Combine PDF and JPG | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to combine photos and PDFs", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Images}
        h1="Combine Photos and PDFs Into a Single File, Without an App"
        description="Convert images to PDF pages first, then merge with your other documents. Nothing is uploaded."
      />
      <ToolPageClient slug="merge-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            A PDF and a JPG are fundamentally different kinds of file, so there is no single
            button that will combine pdf and jpg into one file in one click anywhere. What
            actually works, and what this page walks through, is a two-step process: turn the
            photos into PDF pages first, then merge that result with any other PDFs you have. It
            takes about the same amount of time as a single step would, and you end up with real
            control over page size, orientation, and where each photo lands in the file, control
            a true one-click tool would not give you anyway.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to combine photos and PDFs</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The detail that matters</h2>
          <p className="leading-relaxed">
            Turning a photo into a PDF page raises questions a document-to-document merge never
            has to answer, because a photo does not already come with a page size.
          </p>
          <p className="leading-relaxed">
            By default, each image becomes a standard A4 page, with the photo centered and scaled
            to fit inside a margin, the safest default for anything you plan to print or attach
            to a form. You can switch to Letter-sized pages, or choose match-image, which makes
            the page exactly the photo&apos;s own pixel dimensions, useful if you want the output
            to behave like a plain image viewer rather than a printed document.
          </p>
          <p className="leading-relaxed">
            Orientation is handled automatically by default. A landscape photo, wider than it is
            tall, gets a landscape page, and a portrait photo gets a portrait page, so nothing
            gets forced into the wrong shape or squeezed with wide white bars on either side. You
            can override this and force every page to one orientation if you are combining a
            mixed batch and want a consistent look throughout the file.
          </p>
          <p className="leading-relaxed">
            Phone camera orientation is the one place this genuinely needs a manual check. Some
            phones save a photo&apos;s pixel data in one orientation with a separate rotation flag
            telling viewers to display it upright, rather than physically rotating the pixels
            themselves. This tool reads the image&apos;s actual pixel dimensions, not that
            rotation flag, so an occasional photo can come out sideways in the output even though
            it looked upright in your gallery. Check the preview before converting, and if one
            photo is sideways, rotate it in your phone&apos;s own gallery app first, then upload
            it again.
          </p>
          <p className="leading-relaxed">
            Order stays fully under your control at both stages. Drag photos into sequence before
            converting them to PDF, then drag files, including that new photo PDF alongside any
            existing documents, into the final order during the merge step. Nothing gets ordered
            automatically by file name or upload time unless you leave it as is.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Attaching a photographed ID, a driver&apos;s license or a passport photo page, to an
            online form that only accepts a PDF upload is one of the most common triggers.
            Combining several receipt photos taken on a phone into one file for an expense report
            saves attaching five separate images to a claim form one at a time. Adding a
            photographed signature page, signed on paper and photographed rather than scanned,
            back into a digital contract it belongs with is another regular case. It also comes
            up when combining a scanned application form with a photographed supporting document,
            a certificate or a utility bill, into a single submission file a portal expects as
            one upload.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online merge tools</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Converts images into real, adjustable PDF pages",
                thisTool: "Yes, with page size and fit control",
                typical: "Often locked to one fixed page size",
              },
              {
                feature: "Lets you set page order across both the conversion and merge steps",
                thisTool: true,
                typical: "Rarely, order is often just upload sequence",
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
            Both steps accept up to 50 files at once, so a large batch of receipt photos or ID
            scans is not a problem. Neither the image-to-PDF conversion nor the merge step needs
            Web Workers or a specific browser feature, so both run on effectively any current
            browser without a compatibility gap. There is no automatic correction for phone
            camera rotation flags, as covered above, so always check the preview before
            converting a batch of phone photos. Memory is the practical ceiling for very large
            batches, since every photo is held in your device&apos;s memory during conversion. A
            phone can start slowing down somewhere past a combined 100MB to 150MB of source
            images, while a laptop or desktop handles considerably more.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Only combining PDFs, no photos involved? Head to the{" "}
            <Link href="/merge-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              merge PDF hub
            </Link>{" "}
            instead. Worried the conversion step might soften your photos? See{" "}
            <Link href="/merge-pdf-without-losing-quality" className="font-medium text-primary underline-offset-2 hover:underline">
              merge a PDF without losing quality
            </Link>{" "}
            for how quality is preserved through both steps.
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
