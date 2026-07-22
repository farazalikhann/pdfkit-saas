import "server-only";
import Anthropic from "@anthropic-ai/sdk";

/** Server-only Anthropic client. Never import this from a Client Component. */
export function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your environment to enable AI tools."
    );
  }
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}

export const AI_MODEL = "claude-opus-4-8";

export function pdfDocumentBlock(base64: string) {
  return {
    type: "document" as const,
    source: {
      type: "base64" as const,
      media_type: "application/pdf" as const,
      data: base64,
    },
  };
}

export async function fileToBase64(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  return buffer.toString("base64");
}

export function extractText(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}
