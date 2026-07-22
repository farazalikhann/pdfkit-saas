import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { categories, getCategory } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/tools";
import { ToolCard } from "@/components/home/tool-card";
import { categoryJsonLd } from "@/lib/seo/json-ld";

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const category = getCategory(params.slug);
  if (!category) return {};
  return {
    title: `${category.name} PDF Tools`,
    description: category.description,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default function CategoryPage({ params }: Props) {
  const category = getCategory(params.slug);
  if (!category) notFound();

  const tools = getToolsByCategory(category.slug);
  const jsonLd = categoryJsonLd(category, tools);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden>
          {category.emoji}
        </span>
        <div>
          <h1 className="text-xl font-bold">{category.name}</h1>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      {tools.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          Nothing available in this category right now.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
