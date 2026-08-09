import type { Metadata } from "next";
import { Fragment } from "react";
import { SearchBar } from "@/components/home/search-bar";
import { CategoryChips } from "@/components/home/category-chips";
import { CategorySection } from "@/components/home/category-section";
import { CompressionGuides } from "@/components/home/compression-guides";
import { categories } from "@/lib/categories";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { websiteJsonLd, organizationJsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Free Online PDF Tools`,
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
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
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Every PDF tool you need
          </h1>
          <p className="text-sm text-muted-foreground">
            Fast, private, and free — most tools run right on your device.
          </p>
        </div>
        <SearchBar />
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
    </div>
  );
}
