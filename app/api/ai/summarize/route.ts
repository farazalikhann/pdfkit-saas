import { NextResponse } from "next/server";
import {
  AI_MODEL,
  extractText,
  fileToBase64,
  getAnthropicClient,
  pdfDocumentBlock,
} from "@/lib/ai/client";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const client = getAnthropicClient();
    const base64 = await fileToBase64(file);

    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            pdfDocumentBlock(base64),
            {
              type: "text",
              text: "Summarize this document in 5-8 concise bullet points, followed by a one-sentence TLDR.",
            },
          ],
        },
      ],
    });

    return NextResponse.json({ summary: extractText(response) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Summarization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
