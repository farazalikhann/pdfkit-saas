import type { Metadata } from "next";
import Link from "next/link";
import { Minimize2 } from "lucide-react";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { LandingHeader } from "@/components/seo/landing-header";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { FaqList } from "@/components/seo/faq-list";
import { SizeComparisonGraphic } from "@/components/seo/size-comparison-graphic";
import {
  softwareApplicationJsonLd,
  howToJsonLdNamed,
  faqJsonLd,
} from "@/lib/seo/json-ld";
import { getToolBySlug } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/compress-pdf-to-100kb`;
const TITLE = "Compress PDF to 100KB Online Free - Exact Size";
const DESCRIPTION =
  "Get a PDF under 100KB free, right in your browser. Type \"100 KB\" as your target and this tool searches compression levels to hit it. No upload, no signup.";

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
  "Upload your PDF.",
  "Switch to the \"Target a size\" tab instead of the preset list.",
  "Type \"100 KB\" into the target size field.",
  "Tap Compress PDF and watch the progress ring. This step searches multiple compression levels, so it takes a little longer than a single preset.",
  "Compare the before-and-after preview, then download.",
];

const FAQS = [
  {
    q: "Can I really get a PDF down to exactly 100KB?",
    a: "Usually, if the original has room to give. The tool searches compression levels and lands at or just under 100KB for most single-page scans and typical documents.",
  },
  {
    q: "Why won't my scanned PDF go below 100KB?",
    a: "If it's several pages of high-detail scans, 100KB spread across all of them may simply not be physically reachable without the pages becoming unreadable. Try compressing fewer pages at once.",
  },
  {
    q: "Will my text become unreadable at 100KB?",
    a: "No. Real text and vector graphics are never touched by this pipeline, only embedded images are downsampled, so typed text stays sharp no matter how small the target.",
  },
  {
    q: "Does the tool guarantee under 100KB every time?",
    a: "No tool can guarantee an arbitrary target for every possible file. This one tells you plainly when 100KB isn't achievable and gives you its closest, smallest result instead.",
  },
  {
    q: "What if my file needs to be under 100KB and has multiple pages?",
    a: "Split out just the pages you need first, then compress that smaller file to 100KB. Trying to fit many image-heavy pages into 100KB total rarely ends well.",
  },
  {
    q: "Is 100KB the smallest this tool can go?",
    a: "No, you can type any target, including smaller ones like \"50 KB.\" 100KB is just a very common portal requirement, which is why this page exists.",
  },
  {
    q: "Do I need to install anything or create an account?",
    a: "No. It runs in your browser as-is, no extension, no app, no signup.",
  },
  {
    q: "Is my document uploaded to a server to hit the target?",
    a: "No, the whole search across compression levels happens locally in a Web Worker on your device.",
  },
];

const RELATED = ["split-pdf", "ocr-pdf", "merge-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressPdfTo100KbPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress PDF to 100KB | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to compress a PDF to 100KB", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Minimize2}
        h1="Get Your PDF Down to 100KB Without Losing the Text"
        description="Type an exact target and this tool searches compression levels for you. Nothing is uploaded."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            A lot of application portals don&apos;t care how good your PDF looks. They care that
            it&apos;s under 100KB, full stop. Government e-forms, scholarship portals, and job
            sites with an upload field this strict are common, and a file even a few kilobytes
            over the cap gets rejected outright, no partial credit for being close. This tool lets
            you compress a PDF to 100KB by typing &quot;100 KB&quot; into the Target Size box; it
            searches through compression levels and lands at or just under your number, then
            tells you honestly if a file is too image-heavy to get there without real quality
            loss.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            Scholarship and government portals are the most common trigger. Plenty of them cap
            supporting-document PDFs at exactly 100KB per file, whether it&apos;s a signed
            declaration, an income certificate, or a scanned ID page, and they reject the upload
            outright rather than compressing it for you. Some recruitment and job portals set the
            same 100KB ceiling on a resume or cover letter PDF, which is punishing if your resume
            has even one modest photo or a styled header graphic. Visa and embassy application
            systems frequently impose per-document limits in this range for scanned supporting
            paperwork, and unlike a typical desktop compressor, you often need this done fast,
            from a phone, right before a deadline. It also comes up for smaller, practical
            reasons: attaching a one-page form to a text message or a WhatsApp chat where the
            recipient is on a slow connection, and a 100KB file just opens faster.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress a PDF to 100KB</h2>
          <p className="leading-relaxed">
            There&apos;s no separate &quot;100KB mode&quot; button anywhere on this site.
            It&apos;s the same compressor everyone uses, just pointed at a specific number instead
            of a named preset, which is really all a hard portal limit actually needs.
          </p>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
          <SizeComparisonGraphic
            beforeLabel="Single scanned page, original"
            afterLabel="Extreme preset: about 60 to 150 KB"
            afterWidthPct={10}
            caption="A single scanned page at the Extreme preset usually lands between 60KB and 150KB, depending on how much detail and color the original scan has."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <p className="leading-relaxed">
            Most &quot;compress my PDF&quot; sites you find with a search hand you a quality
            slider or a few named presets and hope one of them lands near what you need.
            Here&apos;s how that stacks up against typing an exact number.
          </p>
          <ComparisonTable
            rows={[
              {
                feature: "Exact-size targeting (type \"100 KB\" as a goal)",
                thisTool: true,
                typical: "Rare. Most only offer quality presets, not a byte target",
              },
              { feature: "File uploaded to a server", thisTool: false, typical: true },
              { feature: "Watermark added", thisTool: false, typical: "Sometimes, on free tiers" },
              { feature: "Signup required", thisTool: false, typical: "Often, past a certain file size" },
              {
                feature: "Tells you honestly if 100KB isn't achievable",
                thisTool: true,
                typical: "Varies. Some just hand back their smallest result with no explanation",
              },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What to expect at 100KB</h2>
          <p className="leading-relaxed">
            100KB is close to the compression floor for anything with real image content, so be
            realistic about what fits. A single scanned page in color, run through the Extreme
            preset (72 DPI, 35% quality), usually lands somewhere in the 60KB to 150KB range
            depending on how busy the page is. Plain text on a white background compresses much
            smaller than a photo or a stamped, colorful form. A five-page scanned document
            essentially never fits in 100KB total, because that leaves an average of 20KB per
            page, which is well past visibly blocky. If you&apos;re in that situation, extract
            just the one or two pages you actually need first using a page-extraction tool, then
            compress those. A born-digital PDF that&apos;s mostly typed text with no images will
            usually sail under 100KB with room to spare, since text isn&apos;t touched at all by
            this pipeline. And a handful of image types, JPEG2000, CCITT fax-encoded scans, CMYK
            images, get left untouched rather than recompressed, so a PDF made entirely of one of
            those won&apos;t shrink much no matter which setting you pick.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            If your form actually allows a bit more room, it&apos;s worth checking the exact
            wording of the limit before you spend time on this. For the stricter cap, this page
            covers it end to end; for anything looser, see{" "}
            <Link href="/compress-pdf-to-200kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 200KB
            </Link>
            ,{" "}
            <Link href="/compress-pdf-to-500kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 500KB
            </Link>
            , or head back to the{" "}
            <Link href="/compress-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              main compress PDF tool
            </Link>{" "}
            for the full set of presets. Wondering how much of that reduction is actually
            visible? See{" "}
            <Link href="/compress-pdf-without-losing-quality" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF without losing quality
            </Link>{" "}
            for the honest breakdown.
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
