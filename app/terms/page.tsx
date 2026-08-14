import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/legal-header";
import { SITE_NAME, SITE_URL, OWNER_NAME, OWNER_EMAIL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/terms`;
const TITLE = "Terms of Service";
const DESCRIPTION =
  "The terms for using PDFKit's free browser-based PDF tools: acceptable use, ownership of your documents, no warranty, and where liability sits.";
const LAST_UPDATED = "Last updated: August 11, 2026.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: PAGE_URL },
  twitter: { card: "summary", title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <LegalHeader
        title="Terms of Service"
        subtitle="Plain-English terms for using PDFKit. By using this site, you agree to the points below."
        lastUpdated={LAST_UPDATED}
      />

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Acceptance of these terms</h2>
        <p className="text-sm text-muted-foreground">
          Using PDFKit at {SITE_URL} means you accept these terms. If you do not agree with
          them, the only real option is not to use the site, since there is no account to create
          or agreement to sign separately.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">What this service is</h2>
        <p className="text-sm text-muted-foreground">
          PDFKit is a collection of free, browser-based PDF tools: merging, splitting,
          compressing, converting, editing, and securing PDF files, plus a couple of AI-powered
          tools for summarizing and translating documents. Most tools run entirely on your own
          device using JavaScript. The two AI tools send extracted text, not your file, through
          OpenRouter to a third-party AI model provider to do their job, and that is disclosed on
          those specific tool pages before you use them.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Free, with no account required</h2>
        <p className="text-sm text-muted-foreground">
          Every tool on this site is free to use. There is no signup, no login, no subscription,
          and no hidden tier that unlocks more features for payment. You can use the tools as
          many times as you want.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Acceptable use</h2>
        <p className="text-sm text-muted-foreground">
          You agree not to upload or process any document you do not have the legal right to
          use, and not to use these tools for anything unlawful, including creating fraudulent
          documents, forging signatures, or evading a legitimate legal or regulatory requirement.
          You are responsible for the content of anything you process here.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Your documents, your rights</h2>
        <p className="text-sm text-muted-foreground">
          You keep full ownership and all rights to any document you process on this site. We
          claim no ownership over anything you upload, create, or export here. Since most
          processing happens entirely in your browser and the file never reaches our server,
          there is nothing on our end to claim rights over even if we wanted to.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">No warranty</h2>
        <p className="text-sm text-muted-foreground">
          These tools are provided as is, without any warranty that they will be error-free,
          always available, or perfectly suited to your specific document. PDF files vary
          enormously in how they were created, and an unusual file can occasionally produce an
          unexpected result. Always keep a backup of any original file that matters to you before
          processing it, the same way you would before editing anything important.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Limitation of liability</h2>
        <p className="text-sm text-muted-foreground">
          To the fullest extent permitted by law, {SITE_NAME} and {OWNER_NAME} are not liable
          for any loss or damage arising from your use of this site, including lost data, a
          corrupted export, or a document that did not process the way you expected. Using these
          tools for anything important is done at your own judgment and risk, which is exactly
          why keeping your own backups matters.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Third party links and advertising</h2>
        <p className="text-sm text-muted-foreground">
          This site may display third party advertisements through Google AdSense and may link
          to third party resources. We do not control and are not responsible for the content,
          accuracy, or practices of any third party site or advertiser. See the{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          for how advertising cookies work on this site.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Governing law</h2>
        <p className="text-sm text-muted-foreground">
          These terms are governed by the laws of India, without regard to conflict of law
          principles.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Contact</h2>
        <p className="text-sm text-muted-foreground">
          Questions about these terms can be sent to{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="underline underline-offset-2">
            {OWNER_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
