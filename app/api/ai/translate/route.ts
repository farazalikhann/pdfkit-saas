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
    const targetLanguage = form.get("targetLanguage");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }
    if (typeof targetLanguage !== "string" || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing targetLanguage" },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();
    const base64 = await fileToBase64(file);

    const response = await client.messages.create({
      model: AI_MODEL,
      max_tokens: 8192,
      messages: [
        {
          role: "user",
          content: [
            pdfDocumentBlock(base64),
            {
              type: "text",
              text: `Translate the full text of this document into ${targetLanguage}. Preserve paragraph structure and headings. Output only the translated text, no commentary.`,
            },
          ],
        },
      ],
    });

    return NextResponse.json({ translation: extractText(response) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Translation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
