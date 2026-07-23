import "server-only";
import { GoogleGenAI, ApiError } from "@google/genai";
import type { AiProvider, SummarizeTextInput } from "../provider";

// An alias, not a dated snapshot — keeps resolving to a current flash-tier model as
// Google retires specific versions (gemini-2.5-flash itself was pulled from new-user
// access after this was first wired up, which is exactly the failure mode this avoids).
const MODEL = "gemini-flash-latest";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_AI_API_KEY is not set. Add it to your environment to enable the Summarize tool."
    );
  }
  return new GoogleGenAI({ apiKey });
}

function toFriendlyError(err: unknown): Error {
  if (err instanceof ApiError) {
    if (err.status === 429) {
      return new Error(
        "Gemini's free tier is temporarily rate-limited. Please try again in a minute."
      );
    }
    return new Error(`Gemini API error (${err.status}): ${err.message}`);
  }
  return err instanceof Error ? err : new Error("Unknown AI provider error");
}

const INSTRUCTIONS: Record<NonNullable<SummarizeTextInput["length"]>, string> = {
  short:
    "Summarize the following document in 2-3 concise sentences — just the core point, no bullets.",
  detailed:
    "Write a detailed multi-paragraph summary of the following document, covering its main " +
    "points, supporting details, and any conclusions or recommendations.",
  bullets:
    "Summarize the following document text in 5-8 concise bullet points, followed by a " +
    "one-sentence TLDR.",
};

async function summarizeText({
  text,
  length = "bullets",
  maxOutputTokens = 1024,
}: SummarizeTextInput): Promise<string> {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${INSTRUCTIONS[length]} Respond with plain text only.\n\n---\n\n${text}`,
            },
          ],
        },
      ],
      config: { maxOutputTokens },
    });
    const summary = response.text;
    if (!summary) throw new Error("Gemini returned an empty response.");
    return summary;
  } catch (err) {
    throw toFriendlyError(err);
  }
}

export const geminiProvider: AiProvider = { summarizeText };
