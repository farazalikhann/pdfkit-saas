import Link from "next/link";
import { getToolBySlug, type ToolDefinition } from "@/lib/tools";
import { getToolSeoContent } from "@/lib/seo/tool-content";

/**
 * Server-rendered content block placed below the tool UI on every tool page:
 * intro copy, a "How to" list, FAQs, and related-tool links. Deliberately a plain
 * Server Component (no "use client", no hooks) so this text is present in the
 * initial HTML a crawler sees, not something that only appears after JS hydrates.
 */
export function ToolSeoSection({ tool }: { tool: ToolDefinition }) {
  const content = getToolSeoContent(tool.slug);
  if (!content) return null;

  const relatedTools = content.related
    .map((slug) => getToolBySlug(slug))
    .filter((t): t is ToolDefinition => Boolean(t));

  return (
    <article className="mx-auto mt-10 max-w-2xl space-y-10 px-4 pb-16 text-sm text-foreground/90">
      <section className="space-y-3">
        {content.intro.map((paragraph, i) => (
          <p key={i} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold leading-tight">How to {tool.name}</h2>
        <ol className="list-inside list-decimal space-y-2 leading-relaxed">
          {content.howTo.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
        <div className="divide-y divide-border rounded-xl border border-border">
          {content.faqs.map((faq, i) => (
            <details key={i} className="group p-4 open:pb-4">
              <summary className="cursor-pointer list-none font-medium marker:content-none">
                <span className="flex items-center justify-between gap-2">
                  {faq.q}
                  <span aria-hidden className="shrink-0 text-muted-foreground group-open:rotate-180">
                    ▾
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-muted-foreground leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {relatedTools.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold leading-tight">Related tools</h2>
          <ul className="space-y-2 leading-relaxed">
            {relatedTools.map((related) => {
              const relatedContent = getToolSeoContent(related.slug);
              return (
                <li key={related.slug}>
                  <Link href={`/tools/${related.slug}`} className="font-medium text-primary underline-offset-2 hover:underline">
                    {related.name}
                  </Link>
                  {relatedContent && <span className="text-muted-foreground">: {related.description}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
