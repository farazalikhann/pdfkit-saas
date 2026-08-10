import type { Metadata } from "next";
import { Fragment, Suspense } from "react";
import { SearchBar } from "@/components/home/search-bar";
import { CategoryChips } from "@/components/home/category-chips";
import { CategorySection } from "@/components/home/category-section";
import { CompressionGuides } from "@/components/home/compression-guides";
import { HomeContentSection } from "@/components/home/home-content-section";
import { categories } from "@/lib/categories";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { websiteJsonLd, organizationJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import { HOME_FAQS } from "@/lib/seo/home-content";

const HOME_TITLE = "Free PDF Tools Online - Compress, Merge, Convert PDF in Your Browser";
const HOME_DESCRIPTION =
  "Compress, merge, split, and convert PDFs online for free. Every file processes entirely on your device and is never uploaded to a server. No signup, no limits.";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
  },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(HOME_FAQS)) }}
      />
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Free PDF Tools Online: Compress, Merge, Convert
          </h1>
          <p className="text-sm text-muted-foreground">
            Every PDF tool you need. Fast, private, and free, most tools run right on your device.
          </p>
        </div>
        <Suspense fallback={<div className="h-14 w-full rounded-2xl border border-border bg-card" />}>
          <SearchBar />
        </Suspense>
        <CategoryChips />
      </div>

      <div className="space-y-8">
        {categories.map((category) => (
          <Fragment key={category.slug}>
            <CategorySection category={category} />
            {category.slug === "optimize" && <CompressionGuides />}
          </Fragment>
        ))}
      </div>

      <HomeContentSection />
    </div>
  );
}
