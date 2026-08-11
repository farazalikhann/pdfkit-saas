import type { Metadata } from "next";
import Link from "next/link";
import { Minimize2 } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/compress-pdf-to-500kb`;
const TITLE = "Compress PDF to 500KB Online Free - Keep Quality";
const DESCRIPTION =
  "Compress a PDF to 500KB free, right in your browser. Multi-page reports and portfolios usually keep readable images at this size. No upload, no signup.";

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
  "Upload the PDF you need under 500KB.",
  "Switch to the \"Target a size\" tab.",
  "Type \"500 KB\" into the field.",
  "Run the compression and check the result against your original size.",
  "Download it, or lower the target further if the preview still looks strong and you want extra headroom.",
];

const FAQS = [
  {
    q: "Will a scanned report still be readable after compressing to 500KB?",
    a: "For most reports under about ten pages, yes. Text stays legible and diagrams stay recognizable at the Recommended preset, which is usually enough to hit this target.",
  },
  {
    q: "How many pages can I realistically fit under 500KB?",
    a: "It depends on how image-heavy each page is, but eight to ten scanned pages is a reasonable expectation. Mostly-text pages fit far more comfortably than dense photo pages.",
  },
  {
    q: "Is 500KB enough for a portfolio with photos in it?",
    a: "Usually. Photos keep most of their color and detail at this size, with only mild softening if you zoom in well past normal viewing size.",
  },
  {
    q: "Do I need to compress each page separately for a multi-page document?",
    a: "No, the tool processes the whole PDF at once and searches for a setting that gets the entire document under your target.",
  },
  {
    q: "What preset should I pick if I just want 500KB without guessing?",
    a: "Use the Target Size tab and type \"500 KB\" directly. The tool tries several presets for you and picks the least aggressive one that still fits.",
  },
  {
    q: "Can I go smaller than 500KB later if a portal turns out to need less?",
    a: "Yes, just change the number in the Target Size box and run it again. Your original file is never modified, so you can retry as many times as you want.",
  },
  {
    q: "Does the tool tell me if 500KB is not realistic for my file?",
    a: "Yes, if even the most aggressive preset cannot get there, it says so honestly and hands you the smallest result it could produce instead.",
  },
  {
    q: "Is there a faster way to hit 500KB than trying every preset myself?",
    a: "That's exactly what Target Size mode does. Type the number once instead of clicking through Minimal, Light, Recommended, Strong, and Extreme by hand.",
  },
];

const RELATED = ["merge-pdf", "add-watermark", "ocr-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressPdfTo500KbPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress PDF to 500KB | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to compress a PDF to 500KB", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Minimize2}
        h1="Compress a PDF to 500KB Without the Images Turning Mushy"
        description="Enough room for scanned reports and portfolios to stay sharp. Nothing is uploaded."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            500KB gives you real breathing room compared to a 100KB or 200KB cap, and it shows
            the moment you look at the result. When you compress a PDF to 500KB, the tool
            usually doesn&apos;t need anything close to its most aggressive setting, so scanned
            text stays readable and photos keep most of their detail instead of turning into
            soft blocks of color. This is the size most portfolio submission forms, multi-page
            scanned reports, and general document uploads ask for, and it&apos;s comfortable
            enough that you rarely have to fight the target the way you would at 100KB.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress a PDF to 500KB</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this size</h2>
          <p className="leading-relaxed">
            Photography and design portfolios submitted as a single PDF often have a cap
            somewhere in the 500KB to 1MB range, set by whatever form or awards platform is
            collecting entries, and going over it usually means the upload just fails silently.
            A scanned inspection report, lab result, or audit document running eight to ten
            pages needs every page to stay legible, and 500KB spread across ten pages leaves
            real room per page in a way 100KB never could. Freelance proposal and RFP
            submission portals frequently attach a size limit to the PDF you upload alongside a
            bid, and 500KB is loose enough that a proposal with a few diagrams or screenshots
            still fits without stripping them out. It also comes up for something as simple as
            emailing a scanned set of lecture notes or meeting minutes to someone who wants it
            to open instantly rather than sit there loading.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What quality to expect at 500KB</h2>
          <p className="leading-relaxed">
            A single scanned page rarely needs to drop past the Light or Recommended preset to
            land under 500KB, so scanned text stays crisp enough to read at full zoom without
            squinting, and small print in a form still resolves clearly. A multi-page scanned
            report, say eight to ten pages, usually reaches this target at the Recommended
            preset, which keeps photos and diagrams recognizable with only a small loss of fine
            detail compared to the original. Photos embedded in a document, like a portfolio
            piece or a product shot, hold onto their color and most of their sharpness at this
            size. You&apos;ll notice some softening if you zoom in past 150%, but it&apos;s
            nothing like the visible blocking that shows up compressing the same photo down to
            100KB. Real text and vector graphics are never touched no matter the target, so
            headings and body copy stay exactly as sharp as the source file regardless of how
            the images compress.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Type an exact byte target like \"500 KB\"",
                thisTool: true,
                typical: "Rare, most stop at named quality presets",
              },
              {
                feature: "Handles a multi-page scanned document in one pass",
                thisTool: "Yes, no page limit",
                typical: "Often capped on free tiers, sometimes one file or a handful of pages",
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
            An eight to ten page scanned report starting anywhere from 15MB to 20MB usually
            compresses to 500KB without a fight, since there&apos;s plenty of room between the
            original size and the target. Something denser, twenty or more scanned pages, or a
            document with very high resolution source scans, may need the Strong preset to get
            there, which starts to soften fine detail more noticeably than Recommended does.
            Files above roughly 35MB risk running out of memory on a phone browser tab
            specifically, though a laptop or desktop handles larger originals without issue
            before compression even starts. The tool needs Web Workers and OffscreenCanvas,
            supported by every current version of Chrome, Firefox, Safari, and Edge, but not by
            Internet Explorer or very old mobile browser builds. If a document runs past thirty
            or so image-heavy pages, hitting 500KB for the whole thing may not be realistic
            without visible quality loss, and splitting it into smaller files first works better
            than forcing one setting across everything.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Need a stricter cap or a looser one? See{" "}
            <Link href="/compress-pdf-to-200kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 200KB
            </Link>{" "}
            for a tighter portal limit, or{" "}
            <Link href="/compress-pdf-to-1mb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 1MB
            </Link>{" "}
            for the size most job and university portals actually ask for. The{" "}
            <Link href="/compress-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              main compress PDF tool
            </Link>{" "}
            covers the full set of presets. Curious whether 500KB is actually the safest option
            for your file? See{" "}
            <Link href="/compress-pdf-without-losing-quality" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF without losing quality
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
