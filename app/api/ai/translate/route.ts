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
  // Same shared counters as Summarize and the MCQ generator — checkDailyLimit()
  // has no per-tool concept, so all three AI tools draw down one common budget.
  if (!checkDailyLimit().allowed) {
    return NextResponse.json(
      { error: "AI tools are busy, try again tomorrow." },
      { status: 429 }
    );
  }

  const ip = getClientIp(req);
  if (!checkHourlyIpLimit(ip).allowed) {
    return NextResponse.json(
      { error: "Too many requests from this device — try again in a bit." },
      { status: 429 }
    );
  }

  try {
    const body = (await req.json()) as {
      text?: string;
      targetLanguage?: string;
      sourceLanguage?: string;
    };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Document is too long to translate." },
        { status: 413 }
      );
    }
    const targetLanguage = body.targetLanguage?.trim();
    if (!targetLanguage) {
      return NextResponse.json({ error: "Missing target language" }, { status: 400 });
    }

    const translation = await getAiProvider().translateText({
      text,
      targetLanguage,
      sourceLanguage: body.sourceLanguage,
    });

    recordAiRequest(ip);
    return NextResponse.json({ translation });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
