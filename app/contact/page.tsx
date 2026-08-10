import type { Metadata } from "next";
import { LegalHeader } from "@/components/legal/legal-header";
import { SITE_NAME, SITE_URL, OWNER_EMAIL, OWNER_LOCATION } from "@/lib/constants";

const PAGE_URL = `${SITE_URL}/contact`;
const TITLE = "Contact";
const DESCRIPTION =
  "Contact PDFKit directly by email for bug reports, tool suggestions, advertising enquiries, or privacy requests. Usually a reply within 2 to 3 business days.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION, url: PAGE_URL },
  twitter: { card: "summary", title: `${TITLE} | ${SITE_NAME}`, description: DESCRIPTION },
};

const CATEGORIES = [
  {
    heading: "Report a bug",
    body: "Something crashed, a file came out wrong, or a tool did not behave the way this site says it should. Include the tool name and, if you can, what kind of PDF you were working with, since that is usually the fastest way to reproduce it.",
    subject: "Bug report",
  },
  {
    heading: "Suggest a tool",
    body: "A PDF task you needed and could not find here, or an idea for how an existing tool could work better. A lot of what has been added to this site started as someone pointing out a gap.",
    subject: "Tool suggestion",
  },
  {
    heading: "Business or advertising enquiries",
    body: "Sponsorship, advertising, or a partnership question. Include a short summary of what you have in mind.",
    subject: "Business enquiry",
  },
  {
    heading: "Privacy requests",
    body: "Questions about data collection, or a request covered under GDPR or CCPA. See the Privacy Policy for the full detail on what is and is not collected.",
    subject: "Privacy request",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <LegalHeader
        title="Contact"
        subtitle="One person runs this site, so email is the fastest way to reach me. No contact form, since the site is static and a real inbox works better anyway."
      />

      <section className="space-y-2 rounded-xl border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">Email</p>
        <a
          href={`mailto:${OWNER_EMAIL}`}
          className="text-lg font-semibold text-primary underline-offset-2 hover:underline"
        >
          {OWNER_EMAIL}
        </a>
        <p className="text-sm text-muted-foreground">
          Based in {OWNER_LOCATION}. Typical reply time is 2 to 3 business days.
        </p>
      </section>

      <div className="space-y-5">
        {CATEGORIES.map((cat) => (
          <section key={cat.heading} className="space-y-2">
            <h2 className="text-base font-semibold">{cat.heading}</h2>
            <p className="text-sm text-muted-foreground">{cat.body}</p>
            <a
              href={`mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(cat.subject)}`}
              className="inline-block text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              Email about this
            </a>
          </section>
        ))}
      </div>
    </div>
  );
}
