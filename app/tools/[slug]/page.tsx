import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tools";
import { getCategory } from "@/lib/categories";
import { toolJsonLd, howToJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { buildToolMetadata } from "@/lib/seo/metadata";
import { getToolSeoContent } from "@/lib/seo/tool-content";
import { isAiToolsEnabled } from "@/lib/ai/is-enabled";
import { SITE_URL } from "@/lib/constants";
import { ToolPageClient } from "@/components/tools/tool-page-client";
import { ToolSeoSection } from "@/components/seo/tool-seo-section";
import { ToolHeader } from "@/components/seo/tool-header";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return buildToolMetadata(tool);
}

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();
  // Hidden entirely (not a broken page) when there's no Gemini key configured:
  // covers every AI tool (Summarize, Translate, MCQ), not just one hardcoded slug.
  if (tool.category === "ai" && !isAiToolsEnabled()) notFound();

  const category = getCategory(tool.category);
  const content = getToolSeoContent(tool.slug);
  const categoryName = category?.name ?? tool.category;

  const jsonLdBlocks: Record<string, unknown>[] = [
    toolJsonLd(tool),
    breadcrumbJsonLd([
      { name: "Home", url: SITE_URL },
      { name: categoryName, url: `${SITE_URL}/category/${tool.category}` },
      { name: tool.name, url: `${SITE_URL}/tools/${tool.slug}` },
    ]),
  ];
  if (content) {
    jsonLdBlocks.push(howToJsonLd(tool, content.howTo));
    jsonLdBlocks.push(faqJsonLd(content.faqs));
  }

  return (
    <>
      {jsonLdBlocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <ToolHeader tool={tool} />
      <ToolPageClient slug={tool.slug} />
      <ToolSeoSection tool={tool} />
    </>
  );
}
