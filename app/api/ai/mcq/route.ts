import { NextResponse } from "next/server";
import { getAiProvider } from "@/lib/ai/get-provider";
import type { McqDifficulty } from "@/lib/ai/provider";
import {
  checkDailyLimit,
  checkHourlyIpLimit,
  getClientIp,
  recordAiRequest,
} from "@/lib/ai/rate-limiter";

export const runtime = "nodejs";

/** Defensive server-side ceiling — the client is expected to stop well before this. */
const MAX_TEXT_LENGTH = 120_000;
const VALID_DIFFICULTIES: McqDifficulty[] = ["easy", "medium", "hard"];
const MAX_QUESTIONS = 20;

export async function POST(req: Request) {
  // Same shared counters as Summarize and Translate — one common daily budget.
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
      count?: number;
      difficulty?: string;
    };
    const text = body.text?.trim();
    if (!text) {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Document is too long to generate questions from." },
        { status: 413 }
      );
    }
    const count = Math.min(MAX_QUESTIONS, Math.max(1, Math.round(body.count ?? 10)));
    const difficulty = VALID_DIFFICULTIES.includes(body.difficulty as McqDifficulty)
      ? (body.difficulty as McqDifficulty)
      : "medium";

    const questions = await getAiProvider().generateMcqs({ text, count, difficulty });

    recordAiRequest(ip);
    return NextResponse.json({ questions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Question generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
