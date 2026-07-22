/**
 * Whether the Summarize tool should be shown at all. Works in both contexts:
 * server-side reads the real secret directly; client-side reads the boolean
 * next.config.mjs bakes in from that same secret at build time (never the
 * key itself). Used to hide the tool from the UI entirely — nav, search,
 * homepage, sitemap, and the route itself — rather than showing a broken page.
 */
export function isSummarizeEnabled(): boolean {
  if (typeof window === "undefined") {
    return Boolean(process.env.GOOGLE_AI_API_KEY);
  }
  return process.env.NEXT_PUBLIC_AI_SUMMARIZE_ENABLED === "true";
}
