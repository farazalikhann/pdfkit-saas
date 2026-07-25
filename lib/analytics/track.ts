"use client";

import { track } from "@vercel/analytics";
import { sendGAEvent } from "@next/third-parties/google";

/**
 * Central place for the handful of custom events we care about — which tools
 * actually get used, which searches come up empty (signals what to build next),
 * and where in a tool's flow people stop (upload vs. completed export).
 *
 * Sent to both Vercel Analytics and GA4 (when configured) so the same tool
 * funnel shows up in either dashboard. Only tool slugs / search strings /
 * counts ever go here — never a file name, file content, or anything read
 * from inside a document. That boundary is what keeps this consistent with
 * the "files never leave your device" claim on /privacy.
 */
function forwardToGA(name: string, params: Record<string, string | number>) {
  if (!process.env.NEXT_PUBLIC_GA_ID) return;
  sendGAEvent("event", name, params);
}

export function trackToolUsed(slug: string) {
  track("tool_used", { tool: slug });
  forwardToGA("tool_used", { tool: slug });
}

export function trackToolUploadStarted(slug: string) {
  track("tool_upload", { tool: slug });
  forwardToGA("tool_upload", { tool: slug });
}

export function trackSearchZeroResults(query: string) {
  const trimmed = query.slice(0, 100);
  track("search_zero_results", { query: trimmed });
  forwardToGA("search_zero_results", { query: trimmed });
}
