import type { Metadata } from "next";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { getToolBySlug } from "@/lib/tools";
import { ToolCard } from "@/components/home/tool-card";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist — but here are some popular PDF tools you can use right now.",
};

const POPULAR_SLUGS = ["merge-pdf", "compress-pdf", "pdf-to-jpg", "split-pdf", "password-protect", "esign-pdf"];

export default function NotFound() {
  const popularTools = POPULAR_SLUGS.map((slug) => getToolBySlug(slug)).filter(
    (t): t is NonNullable<typeof t> => Boolean(t)
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-12 text-center">
      <div className="flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <FileQuestion className="h-8 w-8" />
        </span>
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          That page doesn&apos;t exist, or may have moved. Here are some popular tools instead:
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-3">
        {popularTools.map((tool) => (
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>

      <div className="pt-2">
        <Link href="/tools" className="text-sm font-medium text-primary underline-offset-2 hover:underline">
          Browse all tools
        </Link>
      </div>
    </div>
  );
}
