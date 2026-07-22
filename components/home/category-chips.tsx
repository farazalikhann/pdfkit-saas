import Link from "next/link";
import { categories } from "@/lib/categories";

export function CategoryChips() {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          href={`/category/${cat.slug}`}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors active:bg-accent"
        >
          <span aria-hidden>{cat.emoji}</span>
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
