import type { MetadataRoute } from "next";
import { categories } from "@/lib/categories";
import { getAllToolSlugs } from "@/lib/tools";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/tools", "/recent"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  // Legal and trust pages, required for AdSense review, kept indexable and
  // linked from the footer on every page.
  const legalRoutes = [
    "/about",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/disclaimer",
    "/cookie-policy",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  // Keyword landing pages for the compression cluster, reuse the compress-pdf
  // tool's UI under different H1/copy targeting "compress pdf to Nkb" searches.
  const compressionLandingRoutes = [
    "/compress-pdf",
    "/compress-pdf-to-100kb",
    "/compress-pdf-to-200kb",
    "/compress-pdf-to-500kb",
    "/compress-pdf-to-1mb",
    "/compress-pdf-for-email",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const toolRoutes = getAllToolSlugs().map((slug) => ({
    url: `${SITE_URL}/tools/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...legalRoutes, ...compressionLandingRoutes, ...categoryRoutes, ...toolRoutes];
}
