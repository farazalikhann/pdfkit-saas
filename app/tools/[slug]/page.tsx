import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllToolSlugs, getToolBySlug } from "@/lib/tools";
import { getCategory } from "@/lib/categories";
import { toolJsonLd } from "@/lib/seo/json-ld";
import { ToolPageClient } from "@/components/tools/tool-page-client";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return getAllToolSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const tool = getToolBySlug(params.slug);
  if (!tool) return {};
  return {
    title: tool.name,
    description: tool.description,
    alternates: { canonical: `/tools/${tool.slug}` },
    openGraph: {
      title: tool.name,
      description: tool.description,
    },
  };
}

export default function ToolPage({ params }: Props) {
  const tool = getToolBySlug(params.slug);
  if (!tool) notFound();

  const category = getCategory(tool.category);
  const jsonLd = toolJsonLd(tool);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ToolPageClient slug={tool.slug} categoryName={category?.name ?? tool.category} />
    </>
  );
}
