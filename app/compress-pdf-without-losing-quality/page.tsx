import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/compress-pdf-without-losing-quality`;
const TITLE = "Compress PDF Without Losing Quality - Free Online";
const DESCRIPTION =
  "Compress a PDF without losing quality, right in your browser. The honest version: what is truly lossless, what is not, and how to pick a safe setting.";

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
  "Upload your PDF and start with the Minimal preset, which sits closest to true lossless.",
  "Compare the file size before and after. A small reduction, often under 15 percent, is expected if your file did not have much redundant data to remove.",
  "If you need it smaller, move one step up to Light and check the before and after preview at full zoom, not the thumbnail.",
  "Stop at the first preset where you cannot spot a difference when zoomed into a photo or a dense paragraph.",
  "Download. If you truly cannot accept any visible change, Minimal is the right choice, even though it saves the least.",
];

const FAQS = [
  {
    q: "Is it actually possible to compress a PDF with zero quality loss?",
    a: "Yes, but only to a point. Removing unused objects, duplicate fonts, and metadata is genuinely lossless and typically saves 2 to 10 percent. Beyond that, shrinking a file further means touching image data, which is lossy.",
  },
  {
    q: "How much can lossless cleanup alone save on a typical file?",
    a: "Usually 2 to 10 percent, depending on how much waste the original export left behind. A file already produced cleanly may save less than that.",
  },
  {
    q: "What exactly does the tool remove without touching image quality?",
    a: "Unused objects left over from editing, duplicate embedded font copies, and metadata like edit history and cached thumbnails, none of which affects how the page renders.",
  },
  {
    q: "If I cannot see a difference, did the file actually lose quality?",
    a: "Technically, some pixel data was likely discarded if you used anything beyond Minimal. Practically, if you cannot see it at normal viewing size, it did not cost you anything that matters.",
  },
  {
    q: "Which preset should I use if any visible change is unacceptable?",
    a: "Minimal. It stays closest to the original image data and is the safest choice when you cannot tolerate even a small visible difference.",
  },
  {
    q: "Why does the same preset save more on one PDF than another?",
    a: "It depends on what is inside the file. A PDF full of high-resolution photos has far more to compress than one that is mostly text, so the same setting produces very different savings.",
  },
  {
    q: "Does removing metadata affect anything important in the document?",
    a: "No, metadata like author name, edit history, and thumbnail previews has no effect on the visible content or how the document functions.",
  },
  {
    q: "Is a text-only PDF worth compressing at all?",
    a: "Only marginally. Without embedded images there is little to shrink beyond the lossless cleanup step, so expect a small reduction rather than a dramatic one.",
  },
];

const RELATED = ["merge-pdf", "extract-pages", "ocr-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressPdfWithoutLosingQualityPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress PDF Without Losing Quality | ${SITE_NAME}`,
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
            howToJsonLdNamed("How to compress a PDF without losing visible quality", HOW_TO_STEPS)
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={BadgeCheck}
        h1="The Honest Limits of Compressing a PDF Without Losing Quality"
        description="What is genuinely lossless, what is not, and how to pick a setting you will not regret. Nothing is uploaded."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            Search for how to compress a PDF without losing quality and you will find plenty of
            tools promising it costs nothing. Some of that is true, and some of it is not, so
            here is the direct version. True lossless compression, the kind that changes zero
            pixels, exists, and this tool applies it automatically: stripping unused objects,
            duplicate fonts, and redundant metadata before touching a single image. On a typical
            PDF, that alone saves somewhere between 2 and 10 percent. Getting meaningfully
            smaller than that means resampling images, and resampling is lossy by definition,
            even when the loss is invisible to your eye.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress without losing visible quality</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The problem explained</h2>
          <p className="leading-relaxed">
            Two genuinely different things get called PDF compression, and mixing them up is
            where most overpromising starts. The first is lossless cleanup: removing data that
            was never visually necessary in the first place. PDFs frequently carry unused
            objects left over from editing in another program, duplicate copies of the same font
            embedded more than once, and metadata like edit history or thumbnail previews nobody
            will ever open. Stripping all of that changes nothing about how the page looks,
            because none of it was ever rendered. This tool does that automatically, and on a
            typical business document it recovers somewhere in the range of 2 to 10 percent of
            the file size, sometimes more if the PDF was exported by software that is especially
            wasteful about it.
          </p>
          <p className="leading-relaxed">
            The second thing is image recompression, and this is genuinely lossy, full stop. If
            a PDF&apos;s size is dominated by embedded photos or scanned pages, which is true for
            most PDFs that actually feel too big, the only way to meaningfully shrink it is to
            reduce those images: lower their resolution, re-encode them at a lower JPEG quality,
            or both. Every one of those steps discards real pixel data. The honest claim any
            compressor can make is not zero quality loss, but quality loss small enough that you
            will not notice it under normal viewing conditions, which is a real and useful thing,
            just a different promise than lossless.
          </p>
          <p className="leading-relaxed">
            Whether that loss is actually invisible depends on three things: how much you zoom
            in, what is on the page, and how it will be viewed. A photo viewed at normal screen
            size loses very little visible quality even at moderate compression, since JPEG
            artifacts hide well inside natural photo detail. The same compression on a scanned
            page of small text is far more noticeable, because text edges are sharp, high-contrast
            lines that show softening immediately. A document that will only ever be read on a
            screen tolerates more compression than one that might get printed at full size, since
            printing reveals detail a screen never shows.
          </p>
          <p className="leading-relaxed">
            So the real question is not whether this will lose quality, since anything beyond the
            lossless cleanup technically does. The real question is what level of reduction
            matches how the file will actually be used. If you are sending a document to be
            printed and framed, stay as close to lossless as the size requirement allows. If you
            are attaching it to an email someone will read once on a phone screen, a more
            aggressive setting is genuinely fine, and calling that lossy is technically accurate
            but practically beside the point.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What to expect</h2>
          <p className="leading-relaxed">
            On a born-digital PDF, one exported directly from Word or Google Docs with few or no
            embedded images, the lossless cleanup alone often gets you the entire realistic
            reduction: 2 to 10 percent, occasionally more if the source file carried extra font
            weights it did not need. There is nothing meaningful left to compress in the text
            itself, since text and vector graphics are never touched by this pipeline at any
            setting. On an image-heavy PDF, a scanned report or a document full of photos, moving
            from the original to the Minimal preset alone, 300 DPI at 90 percent quality,
            typically saves 20 to 40 percent with a difference you would need to zoom past 200
            percent to spot. Pushing to Recommended saves considerably more, often 50 percent or
            more on a scan, at which point a careful side-by-side comparison can reveal some
            softening, even if a casual look cannot.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Applies lossless cleanup automatically before any image changes",
                thisTool: true,
                typical: "Rarely disclosed, unclear what happens under the hood",
              },
              {
                feature: "Lets you stop at the lightest setting for near-zero visible change",
                thisTool: "Yes, five graduated presets",
                typical: "Often one fixed compression level for everyone",
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
            There is a hard floor to how much you can save without any visible change, and it is
            set by how much waste the original file actually contains, not by this tool&apos;s
            settings. A PDF already exported cleanly, with no duplicate fonts and no bloated
            metadata, might only shrink by 2 or 3 percent no matter what you try at the lossless
            level. Files above roughly 35MB risk running out of memory on a phone&apos;s browser
            tab; a laptop or desktop handles larger ones without trouble. This runs in every
            current version of Chrome, Firefox, Safari, and Edge, not in Internet Explorer or
            very old mobile browsers. If a portal or requirement demands a specific small size
            and your document is genuinely photo-heavy, no setting gets you there without some
            visible tradeoff. Pretending otherwise would be exactly the overpromising this page
            is trying to avoid.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Working from a scan rather than a born-digital file? See{" "}
            <Link href="/compress-scanned-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a scanned PDF
            </Link>{" "}
            for how DPI affects the tradeoff. Dealing with something huge? See{" "}
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
