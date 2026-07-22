import {
  ArrowLeftRight,
  FolderKanban,
  Zap,
  PenSquare,
  ShieldCheck,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type CategorySlug =
  | "convert"
  | "organize"
  | "optimize"
  | "edit"
  | "security"
  | "ai";

export interface Category {
  slug: CategorySlug;
  name: string;
  emoji: string;
  icon: LucideIcon;
  description: string;
  /** CSS var (without var()) holding this category's accent color, see globals.css */
  colorVar: string;
}

export const categories: Category[] = [
  {
    slug: "convert",
    name: "Convert",
    emoji: "🔄",
    icon: ArrowLeftRight,
    description: "Turn PDFs into Word, Excel, images and back again",
    colorVar: "--cat-convert",
  },
  {
    slug: "organize",
    name: "Organize",
    emoji: "🗂️",
    icon: FolderKanban,
    description: "Merge, split, reorder and manage pages",
    colorVar: "--cat-organize",
  },
  {
    slug: "optimize",
    name: "Optimize",
    emoji: "⚡",
    icon: Zap,
    description: "Compress, repair and clean up scanned PDFs",
    colorVar: "--cat-optimize",
  },
  {
    slug: "edit",
    name: "Edit",
    emoji: "✏️",
    icon: PenSquare,
    description: "Add text, annotations, watermarks and page numbers",
    colorVar: "--cat-edit",
  },
  {
    slug: "security",
    name: "Security",
    emoji: "🔐",
    icon: ShieldCheck,
    description: "Protect, unlock, sign and redact documents",
    colorVar: "--cat-security",
  },
  {
    slug: "ai",
    name: "AI Tools",
    emoji: "🤖",
    icon: Sparkles,
    description: "Get a quick AI summary of a long document",
    colorVar: "--cat-ai",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
