import type { ToolDefinition } from "@/lib/tools";
import type { Category } from "@/lib/categories";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getToolSeoContent, type ToolFaq } from "./tool-content";

export function toolJsonLd(tool: ToolDefinition) {
  const content = getToolSeoContent(tool.slug);
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${tool.name}: ${SITE_NAME}`,
    applicationCategory: "Utility",
    operatingSystem: "Any",
    description: content?.metaDescription ?? tool.description,
    url: `${SITE_URL}/tools/${tool.slug}`,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to use",
    },
    // No aggregateRating here deliberately, this site has no real review or rating
    // collection system, and fabricating one violates both Google's structured-data
    // policies and the plain rule that schema should never claim what isn't real.
  };
}

/** HowTo schema: steps must match the visible, numbered "How to" list on the page. */
export function howToJsonLd(tool: ToolDefinition, steps: string[]) {
  const content = getToolSeoContent(tool.slug);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: content?.h1 ?? `How to use ${tool.name}`,
    step: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };
}

/**
 * Same HowTo shape as howToJsonLd, for pages not backed by a ToolDefinition,
 * e.g. keyword landing pages that reuse an existing tool's UI under a different H1.
 */
export function howToJsonLdNamed(name: string, steps: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((text, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      text,
    })),
  };
}

/**
 * Same SoftwareApplication shape as toolJsonLd, for pages not backed by a
 * ToolDefinition, e.g. keyword landing pages that reuse an existing tool's UI
 * under a different name/URL/description.
 */
export function softwareApplicationJsonLd(opts: {
  name: string;
  url: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: opts.name,
    applicationCategory: "Utility",
    operatingSystem: "Any",
    description: opts.description,
    url: opts.url,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to use",
    },
  };
}

/** FAQPage schema: must exactly mirror the visible FAQ content rendered on the page. */
export function faqJsonLd(faqs: ToolFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    // /tools reads ?q= and pre-populates the same search box used site-wide
    // (see components/home/search-bar.tsx), so this target is a real, working
    // search, not decorative schema.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
  };
}

export function categoryJsonLd(category: Category, tools: ToolDefinition[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name}: ${SITE_NAME}`,
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
