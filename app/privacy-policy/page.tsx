import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/legal-header";
import { SITE_NAME, SITE_URL, OWNER_NAME, OWNER_EMAIL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/privacy-policy`;
const TITLE = "Privacy Policy";
const DESCRIPTION =
  "How PDFKit handles your files and data: what is never collected, what Google Analytics and Google AdSense do collect, and your GDPR and CCPA rights.";
const LAST_UPDATED = "Effective date: August 11, 2026. Last updated: August 11, 2026.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: PAGE_URL },
  twitter: { card: "summary", title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <LegalHeader
        title="Privacy Policy"
        subtitle="Short version: your files never leave your device. Your browsing activity is tracked like it is on almost every other website, through Google Analytics and, once ads are live, Google AdSense. This page explains both in plain terms."
        lastUpdated={LAST_UPDATED}
      />

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Who runs this site</h2>
        <p className="text-sm text-muted-foreground">
          PDFKit ({SITE_URL}) is owned and operated by {OWNER_NAME}. If you have a question
          about this policy or want to make a privacy request, email{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="underline underline-offset-2">
            {OWNER_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">What is not collected: your files</h2>
        <p className="text-sm text-muted-foreground">
          Every PDF tool on this site except Summarize and Translate runs entirely inside your
          browser using JavaScript. When you upload a file to merge, split, compress, watermark,
          password-protect, or otherwise edit a PDF, that file is read into your browser&apos;s
          own memory, processed there, and handed back to you as a download. It is never sent to
          our server or to any server we control. We keep no copy of it, we have no way to see
          it, and once you close the browser tab, nothing about that file remains anywhere on our
          end, because it was never there to begin with.
        </p>
        <p className="text-sm text-muted-foreground">
          Summarize and Translate are the one exception, and we are upfront about it on those
          tool pages before you use them. Your file&apos;s text is still extracted locally in
          your browser, but that extracted text, not the file itself, is sent through OpenRouter
          to a third-party AI model provider to generate a summary or translation. We do not
          store that text or the result on our own servers beyond the length of that single
          request.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">What is collected: analytics data</h2>
        <p className="text-sm text-muted-foreground">
          Separately from anything you upload, we use Google Analytics and Vercel Analytics to
          understand how people use the site. This collects information like which pages you
          viewed, which tool you used (for example, that someone used Compress PDF, never what
          was inside the file), your approximate location at the country or city level, your
          device type, your browser, and which site or search engine referred you here. This
          data is aggregated and is not tied to your name or any account, since the site has no
          accounts to tie it to.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Cookies</h2>
        <p className="text-sm text-muted-foreground">
          Cookies are small text files a site asks your browser to store, used here to make
          analytics and advertising work correctly. Google Analytics sets cookies to tell
          returning visits apart from new ones and to measure how people move through the site.
          Once advertising is active, Google AdSense sets its own cookies to serve and measure
          ads. We do not use cookies to identify you personally, log you into anything, or track
          what you do inside a PDF you process here, since that processing never touches a
          server in the first place. See the{" "}
          <Link href="/cookie-policy" className="underline underline-offset-2">
            Cookie Policy
          </Link>{" "}
          for the full breakdown of which cookies are set and by whom.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Third party advertising</h2>
        <p className="text-sm text-muted-foreground">
          This site is built to run display advertising through Google AdSense. Google, as a
          third party vendor, uses cookies, including the Google advertising cookie, to serve
          ads on this site based on your prior visits to this site and other sites across the
          web. This is how ad networks generally work: it lets an ad you see here be more
          relevant than a completely random one, based on general browsing patterns rather than
          anything about a document you processed.
        </p>
        <p className="text-sm text-muted-foreground">
          You can opt out of personalized advertising from Google by visiting{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            google.com/settings/ads
          </a>
          . Other third party vendors and ad networks may also use cookies to serve ads on this
          site, and you can opt out of many of them at once through the Digital Advertising
          Alliance at{" "}
          <a
            href="http://www.aboutads.info/choices/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            aboutads.info/choices
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Your rights under GDPR</h2>
        <p className="text-sm text-muted-foreground">
          If you are in the European Economic Area or the United Kingdom, you have the right to
          ask what data we hold about you, correct it if it is wrong, ask us to delete it, ask
          for a copy in a portable format, object to how it is processed, and withdraw any
          consent you previously gave. Because this site collects only aggregate analytics data
          and never asks for your name, email, or account details to use a tool, most of these
          requests will come back showing we simply do not hold anything identifiable tied to
          you. To exercise any of these rights anyway, email{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="underline underline-offset-2">
            {OWNER_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Your rights under CCPA</h2>
        <p className="text-sm text-muted-foreground">
          If you are a California resident, you have the right to know what personal information
          is collected about you, request deletion of it, and opt out of the sale of personal
          information. This site does not sell personal information. The advertising described
          above works through Google&apos;s standard cookie-based ad delivery, not through us
          selling any list of visitors or data to anyone. To make a CCPA request, email{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="underline underline-offset-2">
            {OWNER_EMAIL}
          </a>
          .
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Children&apos;s privacy</h2>
        <p className="text-sm text-muted-foreground">
          This site is not directed at children under 13, and we do not knowingly collect
          personal information from anyone under 13. If you believe a child has provided us with
          personal information, contact us at the email above and we will act on it.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Data retention</h2>
        <p className="text-sm text-muted-foreground">
          There is nothing to retain on the file-processing side, since your files never reach
          us. Aggregate analytics data is retained according to Google Analytics and Vercel
          Analytics&apos; own standard retention settings, which is typically a period of months
          rather than an indefinite archive, and is not something we separately export or store
          ourselves.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Contact for privacy requests</h2>
        <p className="text-sm text-muted-foreground">
          For any privacy question or request, including the GDPR and CCPA rights above, email{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="underline underline-offset-2">
            {OWNER_EMAIL}
          </a>
          . We aim to respond within 2 to 3 business days.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Changes to this policy</h2>
        <p className="text-sm text-muted-foreground">
          If this policy changes in a meaningful way, we will update the &quot;last updated&quot;
          date at the top of this page. We recommend checking back occasionally if you want to
          stay current, since a static site like this one has no way to email every past visitor
          when something changes.
        </p>
      </section>
    </div>
  );
}
