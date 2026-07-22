import { NextResponse } from "next/server";
import { AI_MODEL, extractText, getAnthropicClient, pdfDocumentBlock } from "@/lib/ai/client";

export const runtime = "nodejs";

interface ChatTurn {
  role: "user" | "assistant";
  text: string;
}

interface ChatRequestBody {
  /** Base64-encoded PDF, captured once when the file is first uploaded. */
  base64: string;
  /** Full conversation so far, including the latest user turn at the end. */
  history: ChatTurn[];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ChatRequestBody>;
    if (!body.base64 || !body.history?.length) {
      return NextResponse.json(
        { error: "Missing base64 or history" },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();

    const messages = body.history.map((turn, i) => ({
      role: turn.role,
      content:
        i === 0
          ? [pdfDocumentBlock(body.base64!), { type: "text" as const, text: turn.text }]
          : turn.text,
    }));

    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system:
        "You are answering questions about the attached PDF document only. If the answer isn't in the document, say so.",
      messages,
    });

    return NextResponse.json({ reply: extractText(response) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
