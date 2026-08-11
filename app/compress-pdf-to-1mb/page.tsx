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

const PAGE_URL = `${SITE_URL}/compress-pdf-to-1mb`;
const TITLE = "Compress PDF to 1MB Online Free - No Quality Loss";
const DESCRIPTION =
  "Compress a PDF to 1MB free, right in your browser. The most common job, university, and client upload cap, usually reached with no visible quality loss.";

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
  "Upload the document you need under 1MB.",
  "Open the \"Target a size\" tab and type \"1 MB\".",
  "Run it. Most files land there on the first attempt without needing the more aggressive presets.",
  "Compare the before and after preview side by side to confirm nothing looks off.",
  "Download it, or manually pick Minimal or Light yourself if you'd rather choose the setting than let the search pick one.",
];

const FAQS = [
  {
    q: "Will a 1MB compressed PDF actually look the same as the original?",
    a: "For most everyday documents, yes. At this size the tool rarely needs to go past Light, so the visible difference is minimal to nonexistent.",
  },
  {
    q: "Why does the tool barely change anything when I target 1MB?",
    a: "Because most documents don't need much compression to reach 1MB in the first place. The search stops at the lightest setting that already clears the target.",
  },
  {
    q: "Is 1MB enough for a resume with a photo or a styled header graphic?",
    a: "Yes, a resume with a headshot or a designed header typically compresses to well under 1MB with no visible change to either.",
  },
  {
    q: "Can I compress a whole presentation deck to 1MB in one go?",
    a: "Yes, upload the exported PDF and the tool processes every slide at once rather than requiring you to handle pages separately.",
  },
  {
    q: "What if my file is already under 1MB?",
    a: "The tool will tell you compression didn't help and let you keep the original rather than replacing it with a larger file.",
  },
  {
    q: "Does compressing to 1MB take longer than compressing to a smaller target?",
    a: "Usually it's faster, since the search often succeeds on one of the first, lighter presets it tries instead of working through every level.",
  },
  {
    q: "Will a 1MB PDF pass through corporate email filters or upload portals without issue?",
    a: "In almost every case, yes. 1MB sits comfortably under nearly every upload cap and standard email attachment limit you're likely to run into.",
  },
  {
    q: "Can I set a target smaller than 1MB later if a portal turns out to need less?",
    a: "Yes, your original file stays untouched, so you can type a smaller number and run the search again at any time.",
  },
];

const RELATED = ["word-to-pdf", "merge-pdf", "add-watermark"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressPdfTo1MbPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress PDF to 1MB | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to compress a PDF to 1MB", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Minimize2}
        h1="Get a PDF Under 1MB Without Noticing the Difference"
        description="The most common upload cap on job and university portals. Nothing is uploaded to compress it."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            1MB is the single most common upload limit you&apos;ll run into. Job application
            portals, university admissions systems, and client-facing submission forms all tend
            to land somewhere around this number. The good news is that when you compress a PDF
            to 1MB, you&apos;re rarely anywhere near the compressor&apos;s aggressive settings,
            so the result usually looks identical to the original at a glance. A fifteen-page
            presentation or a multi-page report that started at 8MB typically reaches 1MB using
            the Light preset or even Minimal, which barely touches image quality at all.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this size</h2>
          <p className="leading-relaxed">
            A large share of company career sites, whether built on Workday, Greenhouse, or a
            custom applicant tracking system, cap resume and cover letter uploads somewhere
            around 1MB per file, and while some allow more, 1MB clears nearly all of them
            safely. University and college admissions portals commonly set a similar ceiling on
            an application PDF that bundles a personal statement with scanned transcripts, and
            going over it can mean the portal silently drops the attachment instead of flagging
            an error. Client-facing onboarding and proposal forms, the kind an agency or
            freelancer sends a new client, often specify a 1MB limit for supporting documents
            precisely because most business PDFs fit there without any real quality tradeoff. A
            twenty-slide presentation exported to PDF with a handful of product screenshots
            easily reaches four to six megabytes straight out of PowerPoint or Keynote, and
            compressing it to 1MB keeps every slide&apos;s text and layout untouched while
            shrinking only the embedded images.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress a PDF to 1MB</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What quality to expect at 1MB</h2>
          <p className="leading-relaxed">
            At 1MB, this tool rarely needs anything more aggressive than the Light preset, and
            for many documents Minimal is already enough to clear the target. That means
            scanned text stays essentially indistinguishable from the original, photos keep
            nearly all of their color depth and fine detail, and you&apos;d need to zoom in well
            past 200% before spotting any softening at all. This is a meaningfully different
            experience from compressing to 100KB or 200KB, where the tool is forced down to
            Strong or Extreme and the compression becomes visible if you look closely. At 1MB
            it&apos;s closer to invisible: the file gets smaller, but how it looks barely
            changes, if at all.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Type an exact byte target like \"1 MB\"",
                thisTool: true,
                typical: "Rare, most only offer a handful of named quality levels",
              },
              {
                feature: "Preserves near-original quality at this size",
                thisTool: "Yes, usually stays at Minimal or Light",
                typical: "Varies, some apply one fixed compression level regardless of need",
              },
              { feature: "File uploaded to a server", thisTool: false, typical: true },
              { feature: "Watermark added", thisTool: false, typical: "Sometimes, on free tiers" },
              { feature: "Signup required", thisTool: false, typical: "Often, for files over a certain size" },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Limits</h2>
          <p className="leading-relaxed">
            Most documents under about 20MB compress to 1MB without any trouble at all, since
            there&apos;s a wide gap between a typical original size and this target. A dense
            forty-plus page scanned book, or a presentation packed with dozens of
            full-resolution photos, might need the Strong preset instead of Light to actually
            get under 1MB, and that&apos;s where you start to see a bit more softening in the
            images. Files above roughly 35MB risk running out of memory specifically on a
            phone&apos;s browser tab, though a laptop or desktop handles much larger originals
            without any issue. The tool relies on Web Workers and OffscreenCanvas, which every
            current version of Chrome, Firefox, Safari, and Edge supports, but Internet Explorer
            and older mobile browser builds do not. For the rare document that genuinely cannot
            reach 1MB even at the most aggressive setting, usually something enormous and
            image-dense, the tool reports its closest result honestly rather than pretending to
            hit the number.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Need something tighter or just want it under an email limit instead? See{" "}
            <Link href="/compress-pdf-to-500kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 500KB
            </Link>{" "}
            for a stricter cap, or{" "}
            <Link href="/compress-pdf-for-email" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF for an email attachment
            </Link>{" "}
            if Gmail or Outlook&apos;s limit is the actual constraint. The{" "}
            <Link href="/compress-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              main compress PDF tool
            </Link>{" "}
            covers the full set of presets. Want the honest version of how much this actually
            costs in quality? See{" "}
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
