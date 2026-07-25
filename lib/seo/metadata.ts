import type { Metadata } from "next";
import type { ToolDefinition } from "@/lib/tools";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { getToolSeoContent } from "./tool-content";

/** Builds full per-page metadata for a tool page from its hand-written SEO content. */
export function buildToolMetadata(tool: ToolDefinition): Metadata {
  const content = getToolSeoContent(tool.slug);
  const title = content?.metaTitle ?? tool.name;
  const description = content?.metaDescription ?? tool.description;
  const url = `${SITE_URL}/tools/${tool.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url,
      title: `${title} | ${SITE_NAME}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
    },
  };
}
