import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${SITE_NAME} handles your files and data.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div>
        <h1 className="text-xl font-bold">Privacy</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Short version: almost everything happens on your device. Here&apos;s exactly
          what doesn&apos;t.
        </p>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Every tool except Summarize</h2>
        <p className="text-sm text-muted-foreground">
          Merge, Split, Compress, Rotate, PDF→JPG, JPG→PDF, Add Watermark, Password
          Protect — and everything else on this site — run entirely in your browser
          using JavaScript. Your file is read locally, processed locally, and the
          result never touches a server. We have no copy of it, ever.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Summarize PDF</h2>
        <p className="text-sm text-muted-foreground">
          This is the one exception. Your PDF&apos;s text is extracted locally in your
          browser, then only that extracted text (not the file itself) is sent to{" "}
          <a
            href="https://ai.google.dev/gemini-api/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Google&apos;s Gemini API
          </a>{" "}
          to generate a summary. We don&apos;t store the text or the summary on our
          servers beyond the request itself — Google&apos;s own terms govern how they
          handle it on their end.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">Recent history</h2>
        <p className="text-sm text-muted-foreground">
          The &ldquo;Recent&rdquo; tab reads from your browser&apos;s local storage
          only — a list of tool names and file names you&apos;ve used, kept on your
          device. There are no accounts, no sign-in, and nothing is synced anywhere.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold">No tracking, no ads</h2>
        <p className="text-sm text-muted-foreground">
          There&apos;s no usage-based paywall, no billing, and no analytics tied to a
          personal account on this site.
        </p>
      </section>
    </div>
  );
}
