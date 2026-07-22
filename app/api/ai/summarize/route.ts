import { NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai/get-provider";
import {
  checkDailyLimit,
  checkHourlyIpLimit,
  getClientIp,
  recordAiRequest,
} from "@/lib/ai/rate-limiter";

export const runtime = "nodejs";

/** Defensive server-side ceiling — the client is expected to stop well before this. */
const MAX_TEXT_LENGTH = 120_000;

export async function POST(req: Request) {
  if (!checkDailyLimit().allowed) {
    return NextResponse.json(
      { error: "AI tools are busy, try again tomorrow." },
      { status: 429 }
    );
  }

  const ip = getClientIp(req);
  if (!checkHourlyIpLimit(ip).allowed) {
    return NextResponse.json(
      { error: "Too many summaries from this device — try again in a bit." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as { text?: string };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Document is too long to summarize." },
        { status: 413 }
      );
    }

    const summary = await getAiProvider().summarizeText({ text });

    recordAiRequest(ip);
    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summarization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
