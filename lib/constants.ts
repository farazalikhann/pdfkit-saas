export const SITE_NAME = "PDFKit";
export const SITE_DESCRIPTION =
  "Free, private PDF tools that run right in your browser: merge, split, compress, convert and more. No account, no paywall.";

// Real contact/ownership details used across the legal and trust pages
// (Privacy Policy, Terms, About, Contact, Disclaimer, Cookie Policy) so
// they stay in sync from one place rather than six copies of the same text.
export const OWNER_NAME = "Faraz Ali Khan";
export const OWNER_EMAIL = "farazalikhannnn@gmail.com";
export const OWNER_LOCATION = "Lucknow, Uttar Pradesh, India";

/**
 * Resolves the real deployed URL for canonical tags, OG tags, JSON-LD, and the
 * sitemap. Priority: an explicit NEXT_PUBLIC_SITE_URL (e.g. for a custom
 * domain) > Vercel's own build-time env vars (so it's correct out of the box
 * with zero config) > localhost for local dev. Never falls back to a fake
 * placeholder domain.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
