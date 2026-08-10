import type { Metadata } from "next";
import Link from "next/link";
import { LegalHeader } from "@/components/legal/legal-header";
import { SITE_NAME, SITE_URL, OWNER_EMAIL } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/cookie-policy`;
const TITLE = "Cookie Policy";
const DESCRIPTION =
  "Which cookies PDFKit uses: none for the tools themselves, some for Google Analytics, and advertising cookies through Google AdSense. How to control them.";
const LAST_UPDATED = "Last updated: August 11, 2026.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: PAGE_URL },
  twitter: { card: "summary", title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION },
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <LegalHeader
        title="Cookie Policy"
        subtitle="A short, specific list of what actually gets stored in your browser when you visit this site."
        lastUpdated={LAST_UPDATED}
      />

      <section className="space-y-2">
        <h2 className="text-base font-semibold">What a cookie is</h2>
        <p className="text-sm text-muted-foreground">
          A cookie is a small text file a site asks your browser to save, then reads back on
          later visits. Sites use them to remember things like whether you have visited before,
          what language you prefer, or, for advertising cookies specifically, what kind of ads
          might be relevant to you based on general browsing activity.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Essential cookies</h2>
        <p className="text-sm text-muted-foreground">
          PDFKit does not set any essential cookies of its own, because there is no login,
          account, or server-side session for the tools to work. A couple of small preferences,
          like whether you have dark mode turned on and your recent tool history, are saved
          using your browser&apos;s local storage instead of a cookie, stay entirely on your
          device, and are never sent to us.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Analytics cookies</h2>
        <p className="text-sm text-muted-foreground">
          Google Analytics sets cookies to distinguish new visits from returning ones and to
          measure how people move through the site: which pages get viewed and which tool was
          used. These cookies do not know your name or identify you personally, and they never
          have access to anything inside a PDF you process here, since that processing never
          reaches a server.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Advertising cookies</h2>
        <p className="text-sm text-muted-foreground">
          This site runs display advertising through Google AdSense. Google and its advertising
          partners use cookies, including the standard Google advertising cookie, to serve ads
          and measure how they perform, based on general browsing activity across sites rather
          than anything specific to a document you process here. You can turn off personalized
          ads from Google at{" "}
          <a
            href="https://www.google.com/settings/ads"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            google.com/settings/ads
          </a>{" "}
          and opt out of many other ad networks at once at{" "}
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
        <h2 className="text-base font-semibold">Controlling or deleting cookies</h2>
        <p className="text-sm text-muted-foreground">
          Every major browser lets you view, block, or delete cookies. In Chrome, go to Settings,
          then Privacy and security, then Cookies and other site data. In Firefox, go to
          Settings, then Privacy and Security, then Cookies and Site Data. In Safari, go to
          Settings, then Privacy, then Manage Website Data. In Edge, go to Settings, then Cookies
          and site permissions. Blocking cookies entirely may stop analytics from working and can
          change how ads are shown, but it will not affect any of the PDF tools themselves, since
          those never depended on a cookie to function.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">More detail</h2>
        <p className="text-sm text-muted-foreground">
          For the full picture of what data is collected and why, see the{" "}
          <Link href="/privacy-policy" className="underline underline-offset-2">
            Privacy Policy
          </Link>
          . Questions can be sent to{" "}
          <a href={`mailto:${OWNER_EMAIL}`} className="underline underline-offset-2">
            {OWNER_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
