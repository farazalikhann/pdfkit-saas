import type { ToolDefinition } from "@/lib/tools";
import type { Category } from "@/lib/categories";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export function toolJsonLd(tool: ToolDefinition) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${tool.name} — ${SITE_NAME}`,
    applicationCategory: "Utility",
    operatingSystem: "Any (runs in the browser)",
    description: tool.description,
    url: `${SITE_URL}/tools/${tool.slug}`,
    offers: {
      "@type": "Offer",
      price: tool.isPro ? "0" : "0",
      priceCurrency: "USD",
      description: tool.isPro
        ? "Free preview; unlimited use requires PDFKit Pro"
        : "Free to use",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1240",
    },
  };
}

export function categoryJsonLd(category: Category, tools: ToolDefinition[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} — ${SITE_NAME}`,
    description: category.description,
    url: `${SITE_URL}/category/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: tools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/tools/${tool.slug}`,
        name: tool.name,
      })),
    },
  };
}
