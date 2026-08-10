import { FaqList } from "@/components/seo/faq-list";
import { HOME_INTRO, HOME_FAQS } from "@/lib/seo/home-content";

/**
 * Real, substantial homepage prose below the tool grid, plain Server
 * Component so it's present in the initial HTML for crawlers, not something
 * that only appears after JS hydrates. Exists so the homepage isn't just a
 * search box and a grid of cards over an ad slot (the AdSense rejection this
 * is meant to fix: "Google-served ads on screens without publisher content").
 */
export function HomeContentSection() {
  return (
    <article className="mx-auto mt-4 max-w-2xl space-y-10 px-4 pb-10 text-sm text-foreground/90">
      <section className="space-y-3">
        <h2 className="text-lg font-bold leading-tight">About PDFKit</h2>
        {HOME_INTRO.map((paragraph, i) => (
          <p key={i} className="leading-relaxed">
            {paragraph}
          </p>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold leading-tight">Frequently asked questions</h2>
        <FaqList faqs={HOME_FAQS} />
      </section>
    </article>
  );
}
