import type { Metadata } from "next";
import Link from "next/link";
import { HardDrive } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/compress-large-pdf`;
const TITLE = "Compress Large PDF Files Online Free - No Size Limit";
const DESCRIPTION =
  "Compress a large PDF file free, right in your browser, with no upload cap. Built for 50MB-plus scans and reports that other free tools reject outright.";

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
  "Upload the file. There is no size limit on this tool's end, though very large files take longer to load and process than small ones.",
  "Give it a moment after uploading. A 50MB or larger file can take several seconds just to render the preview, which is normal.",
  "Pick Recommended as a starting point for a large file rather than guessing at Target Size, since a big reduction usually needs a real preset change, not fine-tuning.",
  "Watch the progress bar. Large files process in a background Web Worker, so the tab stays responsive, but the work itself still takes real time.",
  "Download the result, and check the new size against whatever limit you were actually trying to hit.",
];

const FAQS = [
  {
    q: "Is there really no upload limit, even for a file over 100MB?",
    a: "Correct, there is no upload limit set by this tool, since nothing is uploaded. The practical limit is your device's own memory, which is generous on a laptop or desktop.",
  },
  {
    q: "Why does a large PDF take so much longer to process than a small one?",
    a: "Every embedded image has to be decoded, resized, and re-encoded, and a large file simply has more of them, or larger ones, so the total work scales with size and page count.",
  },
  {
    q: "What should I do if the tab freezes while compressing a huge file?",
    a: "Close the tab, split the document into smaller pieces first using a page-range tool, and compress each piece separately rather than the whole file at once.",
  },
  {
    q: "Does compressing a large file work differently on a phone than a laptop?",
    a: "Yes. Phones have far less available memory, so files above roughly 35MB are more likely to run into trouble on a phone than on a laptop or desktop.",
  },
  {
    q: "Why is my PDF so much bigger than I expected for the number of pages it has?",
    a: "It usually comes down to embedded images at full resolution, scanned pages saved without any compression, or occasionally embedded fonts and hidden attachments adding weight.",
  },
  {
    q: "Should I split a huge file before compressing it, or just try compressing it whole first?",
    a: "Try the whole file first if it is under roughly 100MB on a laptop or desktop. Beyond that, or on a phone, splitting first is the safer starting point.",
  },
  {
    q: "Do embedded fonts really make a noticeable difference to file size?",
    a: "Some difference, though usually a few megabytes rather than the tens of megabytes that images or scanned pages contribute. Fonts are rarely the main cause of a truly large file.",
  },
  {
    q: "Is there a point where a PDF is just too large to compress in the browser at all?",
    a: "For most devices, a file in the many hundreds of megabytes or beyond can become impractical without splitting first, though the exact point depends entirely on your device's available memory.",
  },
];

const RELATED = ["split-pdf", "extract-pages", "ocr-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressLargePdfPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress Large PDF | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to compress a large PDF", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={HardDrive}
        h1="Compress a Large PDF File With No Upload Size Cap"
        description="No 10MB or 20MB free-tier wall. The limit is your device's memory, not ours, and nothing is uploaded."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            A lot of free compressors cap uploads at 10MB or 20MB, which is exactly useless when
            the file you need to compress large PDF file is 80MB to begin with. This tool has no
            upload cap of its own, because there is no upload: the file is read and processed on
            your own device, so the only real ceiling is how much memory your device has, not an
            arbitrary number someone picked for a free tier. That said, a genuinely large file
            behaves differently than a normal one, and it helps to know what to expect before you
            start.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress a large PDF</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">The problem explained</h2>
          <p className="leading-relaxed">
            A handful of things make a PDF balloon past 50MB, and they rarely act alone.
            High-resolution embedded images are the most common cause. A single lightly
            compressed photo at full camera resolution can be 5 to 15MB by itself, and a document
            with even a dozen of them adds up fast. Scanned pages are a specific case of this,
            since each page is really just one large image, and a 100-page scanned report at 300
            DPI can easily reach 150MB or more before any compression at all. Embedded fonts add
            up too, though far less dramatically. A PDF that embeds several complete font
            families, including every weight and style, can carry a few megabytes of font data
            that most documents never actually need in full. Less commonly, a PDF has file
            attachments embedded inside it, another PDF, a spreadsheet, an image, tucked away as
            an object a normal viewer does not surface, which can inflate the total size without
            an obvious visual cause.
          </p>
          <p className="leading-relaxed">
            What actually happens when you try to process a huge file matters as much as why it
            got large. Your browser reads the whole file into memory to work on it, since that is
            how client-side processing works at all. On a laptop or desktop, with several
            gigabytes of available RAM, a 100MB or even 300MB PDF is usually fine, if slow. On a
            phone, memory is far more constrained and shared with the operating system and every
            other open app, so a file above roughly 35MB starts to risk the browser tab running
            out of memory and either freezing or being killed by the OS entirely, which looks like
            the page just stopped responding rather than a clear error message.
          </p>
          <SizeComparisonGraphic
            beforeLabel="Whole file: 120 MB at once"
            afterLabel="Split into 3 parts: ~40 MB each"
            afterWidthPct={33}
            caption="Memory cost scales with how much of the document is processed at once, so splitting a huge file into smaller pieces first keeps each step well within normal limits."
          />
          <p className="leading-relaxed">
            If a file is too big to process in one go, the practical fix is not to keep retrying
            the same operation and hoping. Split the document first, using a page-range tool to
            break it into two or three smaller files, and compress each piece separately. This
            works because the memory cost scales with how much of the document is being held and
            processed at once, not with the final output size, so three 40MB chunks are each
            individually manageable even when the original 120MB file, all at once, was not.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What to expect</h2>
          <p className="leading-relaxed">
            A 100-page scanned document at 300 DPI, commonly 150MB to 250MB before touching it,
            typically compresses to somewhere between 15MB and 40MB at the Recommended preset,
            depending on how much color and detail is on each page. A presentation-heavy PDF with
            dozens of full-resolution screenshots, often 60MB to 100MB as exported, usually drops
            to under 15MB at the same preset, since screenshots compress more predictably than
            photographic scans. Processing time scales with file size and page count more than
            anything else. Expect a large file to take noticeably longer than a small one,
            sometimes a minute or more for something in the hundreds of megabytes, with the
            progress bar moving the whole time rather than the tab appearing frozen.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Maximum upload size",
                thisTool: "None, limited only by your device's memory",
                typical: "Often 10 to 20MB on free tiers, higher limits behind a paywall",
              },
              {
                feature: "Processes entirely without a server upload step",
                thisTool: true,
                typical: "No, the whole point of their limit is protecting server capacity",
              },
              { feature: "File uploaded to a server", thisTool: false, typical: true },
              { feature: "Watermark added", thisTool: false, typical: "Sometimes, on free tiers" },
              {
                feature: "Signup required",
                thisTool: false,
                typical: "Often, specifically for access to larger files",
              },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Limits</h2>
          <p className="leading-relaxed">
            Files above roughly 35MB genuinely risk running out of memory on a phone&apos;s
            browser tab, which is a real hardware constraint, not a setting this tool can raise.
            A laptop or desktop with typical modern specs handles files into the hundreds of
            megabytes without issue, though processing time grows with size. The tool needs Web
            Workers and OffscreenCanvas, supported in every current version of Chrome, Firefox,
            Safari, and Edge, not in Internet Explorer. For a truly enormous file, several hundred
            megabytes or more, splitting into smaller pieces first is not just a workaround. It is
            the more reliable approach on any device, phone or desktop, since it keeps each
            processing step well within normal memory bounds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Working from a scan specifically? See{" "}
            <Link href="/compress-scanned-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a scanned PDF
            </Link>{" "}
            for how DPI affects a large scan. Want to know how much you can save without any
            visible tradeoff? See{" "}
            <Link href="/compress-pdf-without-losing-quality" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF without losing quality
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
