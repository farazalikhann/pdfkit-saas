import type { Metadata } from "next";
import { LegalHeader } from "@/components/legal/legal-header";
import { SITE_NAME, SITE_URL, OWNER_EMAIL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/about`;
const TITLE = "About";
const DESCRIPTION =
  "PDFKit is built by Faraz Ali Khan, a developer in Lucknow, India. Why it exists, how the on-device approach works, and how the site is funded.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: PAGE_URL },
  twitter: { card: "summary", title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <LegalHeader
        title="About PDFKit"
        subtitle="Built by one person, for a problem I kept running into myself."
      />

      <div className="space-y-4 text-sm text-muted-foreground">
        <p>
          PDFKit is built and maintained by one person: me, Faraz Ali Khan. I am a computer
          science student and developer based in Lucknow, India, and I built this site because I
          kept running into the same problem myself. I needed to compress a scanned ID or shrink
          a signed contract before uploading it somewhere, and every free PDF tool I found online
          worked the same way: you upload your file to their server, wait, and download the
          result. That bothered me more each time I did it, especially with documents like ID
          scans, bank statements, and medical forms, since you have no real way of knowing what
          happens to a file once it leaves your device.
        </p>

        <p>
          So PDFKit takes a different approach. Almost every tool on this site runs entirely
          inside your browser using JavaScript. When you compress, merge, split, or edit a PDF
          here, your file never gets uploaded anywhere. It is read into your browser&apos;s
          memory, processed right there on your own device, and handed back to you as a
          download. Nothing about it passes through a server, because there is no server in that
          part of the process at all. The only exceptions are the Summarize and Translate tools,
          which send extracted text, never the file itself, to Google&apos;s Gemini API to do
          their job, and that is stated clearly on those specific pages.
        </p>

        <p>
          Right now the site has 26 tools spread across six categories: Convert, Organize,
          Optimize, Edit, Security, and a small set of AI tools. That covers the everyday stuff:
          merging and splitting files, compressing them down to a specific size, converting
          between PDF and other formats, adding watermarks or page numbers, password-protecting
          a document, and a few more specialized jobs like redacting sensitive text or OCR-ing a
          scanned page so it becomes searchable.
        </p>

        <p>
          Every tool is free, and that is not going to change. There is no account to create, no
          watermark stamped across your output, and no artificial file size cap designed to push
          you toward a paid plan, because there is no paid plan. I built this because I wanted it
          to exist, not to sell a subscription.
        </p>

        <p>
          To be straightforward about how the site stays online: PDFKit runs on display
          advertising. You will see ads on this site, and that is what pays for hosting and
          keeps the tools free instead of behind a paywall. I would rather be upfront about that
          than pretend the site runs on goodwill alone.
        </p>

        <p>
          If you run into a bug, have a tool you wish existed, or just want to say something did
          not work the way you expected, email me directly at{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="underline underline-offset-2">
            {OWNER_EMAIL}
          </a>
          . I read everything that comes in, and a lot of what gets fixed or added here started
          as someone&apos;s email.
        </p>
      </div>
    </div>
  );
}
