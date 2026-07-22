import "server-only";

/** Hard stop comfortably inside Gemini's free tier (1,500 requests/day on gemini-2.5-flash). */
export const AI_DAILY_LIMIT = 1400;
/** Per-IP throttle so one visitor can't burn through the shared daily budget alone. */
export const AI_HOURLY_LIMIT_PER_IP = 5;

/**
 * In-memory counters — a safety net, not a precise meter. Correct for a single
 * long-running Node process (e.g. `next start` on a VPS/Railway/Render), but
 * on serverless platforms (Vercel, etc.) each cold start resets these, and
 * concurrent instances don't share counts. For an exact cap across multiple
 * instances, back this with a shared store instead — e.g. a Redis/Upstash
 * counter or a Supabase table, incremented per request.
 */
let day = "";
let dailyCount = 0;
const hourlyByIp = new Map<string, { windowStart: number; count: number }>();
const HOUR_MS = 60 * 60 * 1000;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function syncDay(): void {
  const current = today();
  if (current !== day) {
    day = current;
    dailyCount = 0;
  }
}

export function checkDailyLimit(): { allowed: boolean; remaining: number } {
  syncDay();
  return {
    allowed: dailyCount < AI_DAILY_LIMIT,
    remaining: Math.max(0, AI_DAILY_LIMIT - dailyCount),
  };
}

export function checkHourlyIpLimit(ip: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = hourlyByIp.get(ip);
  if (!entry || now - entry.windowStart >= HOUR_MS) {
    return { allowed: true, remaining: AI_HOURLY_LIMIT_PER_IP };
  }
  return {
    allowed: entry.count < AI_HOURLY_LIMIT_PER_IP,
    remaining: Math.max(0, AI_HOURLY_LIMIT_PER_IP - entry.count),
  };
}

export function recordAiRequest(ip: string): void {
  syncDay();
  dailyCount += 1;

  const now = Date.now();
  const entry = hourlyByIp.get(ip);
  if (!entry || now - entry.windowStart >= HOUR_MS) {
    hourlyByIp.set(ip, { windowStart: now, count: 1 });
  } else {
    entry.count += 1;
  }

  // Bound memory: occasionally sweep expired IP windows.
  if (hourlyByIp.size > 5000) {
    for (const [key, value] of Array.from(hourlyByIp.entries())) {
      if (now - value.windowStart >= HOUR_MS) hourlyByIp.delete(key);
    }
  }
}

/** Best-effort client IP extraction behind typical proxies (Vercel, etc.). */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  return "unknown";
}
