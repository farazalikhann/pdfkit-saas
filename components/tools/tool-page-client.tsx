"use client";

import dynamic from "next/dynamic";
import { getToolBySlug, type ToolDefinition } from "@/lib/tools";
import { GenericTool } from "./generic-tool";
import { Skeleton } from "@/components/ui/skeleton";

function loadingFallback() {
  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-56 w-full rounded-2xl" />
    </div>
  );
}

const IMPLEMENTED_TOOLS: Record<
  string,
  ReturnType<typeof dynamic<{ tool: ToolDefinition }>>
> = {
  "merge-pdf": dynamic(() => import("./merge-pdf").then((m) => m.MergePdfTool), {
    loading: loadingFallback,
    ssr: false,
  }),
  "split-pdf": dynamic(() => import("./split-pdf").then((m) => m.SplitPdfTool), {
    loading: loadingFallback,
    ssr: false,
  }),
  "compress-pdf": dynamic(
    () => import("./compress-pdf").then((m) => m.CompressPdfTool),
    { loading: loadingFallback, ssr: false }
  ),
  "rotate-pages": dynamic(
    () => import("./rotate-pages").then((m) => m.RotatePagesTool),
    { loading: loadingFallback, ssr: false }
  ),
  "pdf-to-jpg": dynamic(() => import("./pdf-to-jpg").then((m) => m.PdfToJpgTool), {
    loading: loadingFallback,
    ssr: false,
  }),
  "jpg-to-pdf": dynamic(() => import("./jpg-to-pdf").then((m) => m.JpgToPdfTool), {
    loading: loadingFallback,
    ssr: false,
  }),
  "add-watermark": dynamic(
    () => import("./add-watermark").then((m) => m.AddWatermarkTool),
    { loading: loadingFallback, ssr: false }
  ),
  "password-protect": dynamic(
    () => import("./password-protect").then((m) => m.PasswordProtectTool),
    { loading: loadingFallback, ssr: false }
  ),
  "summarize-pdf": dynamic(
    () => import("./summarize-pdf").then((m) => m.SummarizePdfTool),
    { loading: loadingFallback, ssr: false }
  ),
  "translate-pdf": dynamic(
    () => import("./translate-pdf").then((m) => m.TranslatePdfTool),
    { loading: loadingFallback, ssr: false }
  ),
  "extract-data-csv": dynamic(
    () => import("./extract-data-csv").then((m) => m.ExtractDataCsvTool),
    { loading: loadingFallback, ssr: false }
  ),
  "chat-with-pdf": dynamic(
    () => import("./chat-with-pdf").then((m) => m.ChatWithPdfTool),
    { loading: loadingFallback, ssr: false }
  ),
};

export function ToolPageClient({
  slug,
  categoryName,
}: {
  slug: string;
  categoryName: string;
}) {
  // Resolved here (client-side) rather than passed down from the Server Component —
  // ToolDefinition.icon is a component reference, which can't cross the RSC boundary as a prop.
  const tool: ToolDefinition | undefined = getToolBySlug(slug);
  if (!tool) return null;

  const Implementation = IMPLEMENTED_TOOLS[tool.slug];

  if (Implementation) {
    return <Implementation tool={tool} />;
  }

  return <GenericTool tool={tool} categoryName={categoryName} />;
}
