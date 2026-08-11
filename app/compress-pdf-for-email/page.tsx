import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
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

const PAGE_URL = `${SITE_URL}/compress-pdf-for-email`;
const TITLE = "Compress PDF for Email - Fit Gmail and Outlook Limits";
const DESCRIPTION =
  "Compress a PDF for email free, right in your browser. Fit Gmail's 25MB and Outlook's 20MB limits, with room for encoding overhead. No upload, no signup.";

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
  "Check your actual limit first. Gmail is 25MB, Outlook is commonly 20MB, but your company's mail server might cap lower than either.",
  "Upload your PDF.",
  "Pick a preset if you just want it generally smaller, or switch to Target Size and type a number with real room to spare under your limit.",
  "Build in a margin for encoding overhead. Aim for a file size at least 25 to 30 percent under the stated cap, not right up against it.",
  "Download the result and attach it to a real email to confirm it sends before you assume the job is done.",
];

const FAQS = [
  {
    q: "Why did my email bounce even though the file looked like it was under Gmail's limit?",
    a: "Your email client encodes the attachment before sending, which adds roughly a third to its size. A file sitting right at 25MB can become larger than Gmail actually allows once encoded.",
  },
  {
    q: "What is Gmail's actual attachment size limit?",
    a: "25MB per message, combining all attachments, and that number applies to the raw file size before encoding overhead is added on top.",
  },
  {
    q: "Is Outlook's limit different from Gmail's?",
    a: "Yes, Outlook.com and many corporate Microsoft 365 accounts cap attachments at 20MB, though individual organizations can set their own limit lower than that.",
  },
  {
    q: "Why is the encoded attachment size bigger than the file size on my computer?",
    a: "Email systems convert binary files into base64 text so they can travel safely through mail servers, and that conversion adds about a third to the size.",
  },
  {
    q: "My company's email keeps rejecting files smaller than the stated limit. Why?",
    a: "Many organizations set an IT-managed limit lower than Outlook's or Gmail's own default, sometimes 10MB or 15MB, specifically to control mailbox storage and server load.",
  },
  {
    q: "Should I compress the file or just send a file-sharing link instead?",
    a: "For a one-off document under a reasonable size, compressing and attaching it directly is simpler for the recipient. A link makes more sense for something you can't shrink enough or plan to update later.",
  },
  {
    q: "Will compressing for email make my attachment look worse to the recipient?",
    a: "Rarely, since email size limits are large enough that most documents compress with little to no visible change, unlike squeezing a file down to a strict 100KB or 200KB target.",
  },
  {
    q: "Can I compress several PDFs at once before emailing them separately?",
    a: "You compress one file at a time, but nothing stops you from running each attachment through the tool in sequence before you send them.",
  },
];

const RELATED = ["split-pdf", "merge-pdf", "html-to-pdf"]
  .map((slug) => getToolBySlug(slug))
  .filter((t): t is NonNullable<typeof t> => Boolean(t));

export default function CompressPdfForEmailPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            softwareApplicationJsonLd({
              name: `Compress PDF for Email | ${SITE_NAME}`,
              url: PAGE_URL,
              description: DESCRIPTION,
            })
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToJsonLdNamed("How to compress a PDF for email", HOW_TO_STEPS)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQS)) }}
      />

      <LandingHeader
        icon={Mail}
        h1="Shrink a PDF So It Actually Sends as an Email Attachment"
        description="Fit Gmail's 25MB and Outlook's 20MB limits, with room for encoding overhead. Nothing is uploaded."
      />
      <ToolPageClient slug="compress-pdf" />

      <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
        <section className="space-y-3">
          <p className="leading-relaxed">
            Email attachment limits catch people off guard because the number your email client
            shows isn&apos;t really the limit that matters. If you want to compress a PDF for
            email attachment, aim smaller than the cap you&apos;ve read about, because
            attachments get encoded before they travel, which inflates the file by roughly a
            third. Gmail caps attachments at 25MB. Outlook.com and many corporate Microsoft 365
            setups cap at 20MB. Plenty of company mail servers set their own lower ceiling on
            top of that, often 10MB or 15MB, without telling you until the send fails.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How to compress a PDF for email</h2>
          <ol className="list-inside list-decimal space-y-2 leading-relaxed">
            {HOW_TO_STEPS.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">How this compares to typical online compressors</h2>
          <ComparisonTable
            rows={[
              {
                feature: "Shows the real post-encoding size, not just the file size",
                thisTool: true,
                typical: "No, typically shows only the raw file size",
              },
              {
                feature: "Type an exact byte target under your specific limit",
                thisTool: true,
                typical: "Rare, most only offer named quality presets",
              },
              { feature: "File uploaded to a server", thisTool: false, typical: true },
              { feature: "Watermark added", thisTool: false, typical: "Sometimes, on free tiers" },
              { feature: "Signup required", thisTool: false, typical: "Often, past a certain file size" },
            ]}
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">When you need this</h2>
          <p className="leading-relaxed">
            The most common trigger is a bounced message: &quot;your message could not be sent
            because it exceeds the size limit,&quot; sitting in your outbox after you were sure
            the file fit. Scanned contracts, signed agreements, and invoices sent as email
            attachments are frequent offenders, since a flatbed or phone scan of several pages
            can easily run past 20MB before anyone thinks to check. Forwarding a large PDF
            someone else sent you is another common case: their file went through fine on their
            system, but your own mail server or account may enforce a stricter limit than theirs
            did. It also comes up when the recipient&apos;s side is the problem rather than
            yours, since some mailboxes reject large attachments outright regardless of what
            your provider allows you to send, and a smaller file sidesteps that entirely.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">What quality to expect</h2>
          <p className="leading-relaxed">
            Because email limits are so much larger than the exact-size targets elsewhere on
            this site, most documents that need this don&apos;t require aggressive compression
            at all. A typical scanned contract or invoice, even a dozen pages long, usually
            compresses to a fraction of a 20MB or 25MB cap using the Light or Recommended
            preset, with essentially no visible change to text or images. Only a document
            already close to or over 25MB before you even start, usually a long scanned book, a
            thick contract bundle, or a presentation loaded with dozens of full-resolution
            photos, needs anything past Recommended, and that&apos;s where you&apos;d start to
            notice softer images. For the ordinary case of getting a normal document safely
            under an email limit, this is one of the easiest targets on the whole site to hit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Limits</h2>
          <p className="leading-relaxed">
            A 20MB PDF becomes roughly 27MB once your email client base64-encodes it for
            transport, which is exactly why a file that looks like it fits under Outlook&apos;s
            20MB cap can still bounce. To stay safely under a 20MB limit, aim for a file closer
            to 15MB. To stay under Gmail&apos;s 25MB, aim for something closer to 18 or 19MB
            unless your document has plenty of room to spare anyway. Files above roughly 35MB
            risk running out of memory on a phone&apos;s browser tab specifically, though
            compressing on a laptop or desktop handles much larger originals without trouble.
            For an extremely long document, dozens of scanned pages that would need to shrink
            far below what any preset can achieve without becoming unreadable, splitting the
            file into two or three separate emails works better than forcing one setting across
            the whole thing.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
          <FaqList faqs={FAQS} />
        </section>

        <section className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <p className="leading-relaxed">
            Working toward a specific number instead of an email limit? See{" "}
            <Link href="/compress-pdf-to-1mb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 1MB
            </Link>{" "}
            for the most common portal cap, or{" "}
            <Link href="/compress-pdf-to-500kb" className="font-medium text-primary underline-offset-2 hover:underline">
              compress a PDF to 500KB
            </Link>{" "}
            for a tighter target that still keeps images readable. The{" "}
            <Link href="/compress-pdf" className="font-medium text-primary underline-offset-2 hover:underline">
              main compress PDF tool
            </Link>{" "}
            covers the full set of presets. Wondering if compressing for email actually costs
            you anything visible? See{" "}
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
