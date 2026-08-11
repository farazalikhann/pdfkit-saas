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

const PAGE_URL = `${SITE_URL}/compress-pdf-to-200kb`;
const TITLE = "Compress PDF to 200KB Online Free - Instant";
const DESCRIPTION =
  "Compress a PDF to 200KB free, right in your browser. Type \"200 KB\" as your target for university, exam, and upload-portal limits. No upload, no signup.";

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
  "Upload the PDF you need under 200KB.",
  "Open the \"Target a size\" tab.",
  "Type \"200 KB\" into the target size field.",
  "Run the compression and wait for the progress ring to finish. It tries several quality levels before settling.",
  "Check the size shown against your original, then download.",
];

const FAQS = [
  {
    q: "Is 200KB easier to hit than 100KB?",
    a: "Yes, noticeably. Twice the byte budget usually means the tool can stop at a less aggressive preset, so image quality holds up better than it does at 100KB.",
  },
  {
    q: "Will my scanned signature or photo still look clear at 200KB?",
    a: "For a single page, usually yes. 200KB is often reachable at the Strong preset rather than Extreme, which keeps more visible detail than the most aggressive setting would.",
  },
  {
    q: "Can I combine multiple documents into one PDF and still hit 200KB?",
    a: "You can merge them first, but combining several image-heavy pages into one file makes 200KB much harder to reach. Compressing each document separately to its own 200KB target usually works better.",
  },
  {
    q: "What happens if my PDF still isn't achievable even at 200KB?",
    a: "The tool tells you plainly and gives you its smallest achievable result instead of silently handing back something over your limit.",
  },
  {
    q: "Do I need to sign up to compress to 200KB?",
    a: "No. No account, no email, no payment, just upload and go.",
  },
  {
    q: "Does this work for multi-page exam admit cards or certificates?",
    a: "Yes, though if the document runs several image-heavy pages, getting the whole thing under 200KB combined is harder than compressing one page. Check whether the portal actually needs every page in one file.",
  },
  {
    q: "Is there a faster way than trying presets one by one?",
    a: "Yes, that's exactly what Target Size mode is for. Type \"200 KB\" once and it searches the presets for you instead of you clicking through each one manually.",
  },
  {
    q: "Will the file still open fine after I upload it to the portal?",
    a: "Yes. Compression only touches embedded images, so the PDF stays a standard, valid file that opens normally anywhere a PDF is expected.",
  },
];

const RELATED = ["merge-pdf", "split-pdf", "pdf-to-jpg"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressPdfTo200KbPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress PDF to 200KB | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to compress a PDF to 200KB", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Minimize2}
        h1="Compress a PDF to Under 200KB in Your Browser"
        description="Type an exact target for exam, university, and upload-portal limits. Nothing is uploaded."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            200KB is the upload cap on a lot of university application portals, competitive exam
            registration forms, and general document-upload systems, twice the ceiling of the
            stricter 100KB portals, which in practice means real headroom for image quality on the
            same page. To compress a PDF to 200KB here, type &quot;200 KB&quot; into the Target
            Size box and the tool searches compression levels until it lands at or under that
            number, right in your browser, with nothing uploaded to a server first. Because the
            target is looser than 100KB, it&apos;s also the more forgiving of the two exact-size
            targets to actually hit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress a PDF to 200KB</h2>
          <p className="leading-relaxed">
            It&apos;s the same compressor as the rest of this site, just pointed at &quot;200
            KB&quot; instead of a named preset, which matters more than which preset you&apos;d
            have picked by hand.
          </p>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <p className="leading-relaxed">
            Most search-result compressors offer a slider or a handful of named quality levels
            rather than a specific number to aim for. Here&apos;s the practical difference.
          </p>
          <ComparisonTable
            rows={[
              {
                feature: "Type an exact byte target like \"200 KB\"",
                thisTool: true,
                typical: "Rare. Most stop at named quality presets",
              },
              { feature: "File uploaded to a server", thisTool: false, typical: true },
              { feature: "Watermark added", thisTool: false, typical: "Sometimes, on free tiers" },
              {
                feature: "Signup required",
                thisTool: false,
                typical: "Often, past a certain file size or usage count",
              },
              {
                feature: "Processing speed for a single document",
                thisTool: "A few seconds to a minute, depending on device and file size",
                typical: "Similar, plus upload and download time over your connection",
              },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            University and college application portals commonly cap uploaded transcripts, ID
            scans, or supporting-document PDFs at 200KB per file, especially for programs handling
            thousands of applicants where storage adds up fast. Competitive exam registration
            systems often set a similar limit on scanned certificates, marksheets, or category
            proof documents, and like most hard caps, reject the file instead of compressing it
            for you. General &quot;upload your document&quot; fields on HR, government, or
            membership portals frequently sit in this 200 to 300KB tier, a step up from the
            stricter 100KB forms but still far below what a phone camera produces by default,
            often 3 to 8MB per scanned page. It also shows up in smaller everyday situations:
            attaching a signed PDF to a web form that silently truncates or fails on anything
            larger, or keeping an email attachment light enough to load instantly on someone&apos;s
            phone.
          </p>
          <SizeComparisonGraphic
            beforeLabel="Phone scan, original: 3 to 8 MB"
            afterLabel="Compressed target: 200 KB"
            afterWidthPct={5}
            caption="A phone-scanned page is typically 3 to 8MB straight out of the camera. Compressed to a 200KB target, it usually still reads clearly on screen."
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What to expect at 200KB, versus 100KB</h2>
          <p className="leading-relaxed">
            Because you have twice the budget of a 100KB target, this tool usually doesn&apos;t
            need to drop all the way to the Extreme preset. Strong (100 DPI, 50% quality) is often
            enough for a single scanned page, which keeps small printed text more legible than the
            Extreme tier does. That&apos;s the real practical difference between a 100KB and 200KB
            target: at 100KB you&apos;re almost always sitting at the compression floor, while at
            200KB there&apos;s usually a little headroom left, so photos posterize less and
            scanned signatures stay recognizable instead of turning into a smudge. A multi-page
            document is still the main risk. Three or four image-heavy scanned pages can easily
            exceed 200KB combined, even though a single page fits comfortably, so extracting just
            the required pages first genuinely helps. Files above roughly 35MB risk running out of
            memory on a phone browser tab specifically, though a desktop handles larger originals
            fine before compression even starts. And the same honest floor applies here as
            anywhere else on this tool: if 200KB genuinely isn&apos;t reachable for a given file,
            you&apos;ll be told that directly instead of getting a silently oversized result.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            If your portal&apos;s limit turns out to be stricter or looser than 200KB, this same
            tool handles that too: see{" "}
            <Link href="/compress-pdf-to-100kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 100KB
            </Link>{" "}
            for a tighter cap,{" "}
            <Link href="/compress-pdf-to-500kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 500KB
            </Link>{" "}
            for more room, or the{" "}
            <Link href="/compress-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              main compress PDF tool
            </Link>{" "}
            for the full set of presets and a broader look at how the compressor works. For the
            honest version of what gets lost at any of these targets, see{" "}
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
