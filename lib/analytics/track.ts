"use client";

import { track } from "@vercel/analytics";

/**
 * Central place for the handful of custom events we care about — which tools
 * actually get used, which searches come up empty (signals what to build next),
 * and where in a tool's flow people stop (upload vs. completed export).
 */
export function trackToolUsed(slug: string) {
  track("tool_used", { tool: slug });
}

export function trackToolUploadStarted(slug: string) {
  track("tool_upload", { tool: slug });
}

export function trackSearchZeroResults(query: string) {
  track("search_zero_results", { query: query.slice(0, 100) });
}
