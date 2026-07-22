import type { Metadata } from "next";
import { categories } from "@/lib/categories";
import { getToolsByCategory } from "@/lib/tools";
import { ToolCard } from "@/components/home/tool-card";
import { SearchBar } from "@/components/home/search-bar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "All PDF Tools",
  description: `Browse every PDF tool available on ${SITE_NAME}, organized by category.`,
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  const categoriesWithTools = categories
    .map((c) => ({ category: c, tools: getToolsByCategory(c.slug) }))
    .filter((c) => c.tools.length > 0);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-5">
      <div>
        <h1 className="text-xl font-bold">All Tools</h1>
        <p className="text-sm text-muted-foreground">
          Every PDF tool, organized by category.
        </p>
      </div>

      <SearchBar />

      <Tabs defaultValue="all">
        <TabsList className="no-scrollbar h-auto flex-wrap justify-start gap-1 overflow-x-auto bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All
          </TabsTrigger>
          {categoriesWithTools.map(({ category: c }) => (
            <TabsTrigger
              key={c.slug}
              value={c.slug}
              className="rounded-full border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {c.emoji} {c.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categoriesWithTools.flatMap(({ tools }) =>
              tools.map((tool) => <ToolCard key={tool.slug} tool={tool} />)
            )}
          </div>
        </TabsContent>

        {categoriesWithTools.map(({ category: c, tools }) => (
          <TabsContent key={c.slug} value={c.slug} className="mt-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {tools.map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
