/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Bakes in whether the AI tools (Summarize, Translate, MCQ) have a key at
    // build time, never the key itself, so client components can hide them
    // without a network round-trip. See lib/ai/is-enabled.ts.
    NEXT_PUBLIC_AI_TOOLS_ENABLED: process.env.GOOGLE_AI_API_KEY ? "true" : "false",
  },
  async redirects() {
    return [
      // The privacy page moved to /privacy-policy to match the rest of the
      // legal/trust page cluster (terms, about, contact, disclaimer, cookie
      // policy). Permanent so any existing bookmark or backlink still lands
      // on the real page instead of a 404.
      { source: "/privacy", destination: "/privacy-policy", permanent: true },
    ];
  },
};

export default nextConfig;
