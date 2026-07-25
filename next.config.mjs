/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Bakes in whether the AI tools (Summarize, Translate, MCQ) have a key at
    // build time — never the key itself — so client components can hide them
    // without a network round-trip. See lib/ai/is-enabled.ts.
    NEXT_PUBLIC_AI_TOOLS_ENABLED: process.env.GOOGLE_AI_API_KEY ? "true" : "false",
  },
};

export default nextConfig;
