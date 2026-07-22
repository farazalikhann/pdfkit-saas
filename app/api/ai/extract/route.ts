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
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            pdfDocumentBlock(base64),
            {
              type: "text",
              text:
                "Find the most prominent table or structured dataset in this document and convert it to CSV. " +
                "Output only raw CSV (comma-separated, first row as headers) with no markdown code fences and no commentary. " +
                "If there is no tabular data, extract the key facts as a two-column CSV of field,value pairs.",
            },
          ],
        },
      ],
    });

    const csv = extractText(response)
      .replace(/^```csv\s*/i, "")
      .replace(/```\s*$/, "")
      .trim();

    return NextResponse.json({ csv });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
