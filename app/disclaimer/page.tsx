import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/legal-header";
import { SITE_NAME, SITE_URL, OWNER_EMAIL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/disclaimer`;
const TITLE = "Disclaimer";
const DESCRIPTION =
  "PDFKit's tools are provided for general use with no guarantee of accuracy. Read this before relying on an output file for something important.";
const LAST_UPDATED = "Last updated: August 11, 2026.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: PAGE_URL },
  twitter: { card: "summary", title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <LegalHeader
        title="Disclaimer"
        subtitle="A few honest points about what these tools are, and are not, good for."
        lastUpdated={LAST_UPDATED}
      />

      <section className="space-y-2">
        <h2 className="text-base font-semibold">General use, no guarantee of accuracy</h2>
        <p className="text-sm text-muted-foreground">
          The tools on this site are provided for general document handling: compressing,
          merging, converting, and editing PDFs. They are built carefully and tested against a
          wide range of real files, but PDFs vary enormously in how they were created, and no
          tool can guarantee a perfect result on every possible file. We do not warrant that any
          output will be free of errors or exactly match what you expected in every case.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Check your output</h2>
        <p className="text-sm text-muted-foreground">
          Before you send, submit, or rely on a file produced by one of these tools, open it and
          check that it looks right. This matters more for anything with real consequences: a
          signed contract, a form for an official application, or a document going to a client.
          A quick check takes a few seconds and catches the rare case where something did not
          come out as intended.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Keep your originals</h2>
        <p className="text-sm text-muted-foreground">
          Always keep a copy of the original file before processing it. Since these tools run in
          your browser and do not store anything on a server, there is no backup copy sitting
          anywhere on our end if something about the result is not what you wanted. Your own
          backup is the only backup.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Not professional advice</h2>
        <p className="text-sm text-muted-foreground">
          Nothing on this site is legal, financial, or professional advice. If a document has
          real legal or financial weight, such as a contract, a will, or a tax filing, have it
          reviewed by a qualified professional. These tools handle the formatting and file
          mechanics, not the substance of what is written inside the document.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">External links</h2>
        <p className="text-sm text-muted-foreground">
          Any link to a site we do not control is provided for convenience. We are not
          responsible for the content, accuracy, or availability of external sites, and linking
          to one is not an endorsement of everything on it.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Advertising</h2>
        <p className="text-sm text-muted-foreground">
          This site displays advertising through Google AdSense to stay free. Ads are served by
          Google and its advertising partners, and we do not control which specific ad appears
          or vouch for every advertiser&apos;s product or claims. See the{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2">
            Privacy Policy
          </Link>{" "}
          for how advertising cookies work here.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Questions</h2>
        <p className="text-sm text-muted-foreground">
          Email{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="underline underline-offset-2">
            {OWNER_EMAIL}
          </a>{" "}
          if anything on this page needs clarifying.
        </p>
      </section>
    </div>
  );
}
