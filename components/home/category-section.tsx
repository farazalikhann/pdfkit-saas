import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Category } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/tools";
import { ToolCard } from "./tool-card";

export function CategorySection({ category }: { category: Category }) {
  const tools = getToolsByCategory(category.slug).slice(0, 6);
  if (tools.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <span aria-hidden>{category.emoji}</span>
          {category.name}
        </h2>
        <Link
          href={`/category/${category.slug}`}
          className="flex items-center gap-0.5 text-sm font-medium text-primary"
        >
          See all
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </section>
  );
}
