/**
 * Whether the AI tools (Summarize, Translate, generate MCQs) should be shown at
 * all. Works in both contexts: server-side reads the real secret directly;
 * client-side reads the boolean next.config.js bakes in from that same secret
 * at build time (never the key itself). Used to hide these tools from the UI
 * entirely — nav, search, homepage, sitemap, and the routes themselves —
 * rather than showing a broken page. All three tools share one Gemini key, so
 * one flag covers all of them.
 */
export function isAiToolsEnabled(): boolean {
  if (typeof window === "undefined") {
    return Boolean(process.env.GOOGLE_AI_API_KEY);
  }
  return process.env.NEXT_PUBLIC_AI_TOOLS_ENABLED === "true";
}
