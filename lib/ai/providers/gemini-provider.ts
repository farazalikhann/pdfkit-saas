import "server-only";
import { GoogleGenAI, ApiError } from "@google/genai";
import type {
  AiProvider,
  SummarizeTextInput,
  TranslateTextInput,
  GenerateMcqsInput,
  McqQuestion,
} from "../provider";

// An alias, not a dated snapshot — keeps resolving to a current flash-tier model as
// Google retires specific versions (gemini-2.5-flash itself was pulled from new-user
// access after this was first wired up, which is exactly the failure mode this avoids).
const MODEL = "gemini-flash-latest";

function getClient(): GoogleGenAI {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_AI_API_KEY is not set. Add it to your environment to enable this AI tool."
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

const SUMMARY_INSTRUCTIONS: Record<NonNullable<SummarizeTextInput["length"]>, string> = {
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
              text: `${SUMMARY_INSTRUCTIONS[length]} Respond with plain text only.\n\n---\n\n${text}`,
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

async function translateText({
  text,
  targetLanguage,
  sourceLanguage,
  maxOutputTokens = 4096,
}: TranslateTextInput): Promise<string> {
  const ai = getClient();
  const sourceClause = sourceLanguage && sourceLanguage !== "auto"
    ? `from ${sourceLanguage} `
    : "";
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `Translate the following document text ${sourceClause}into ${targetLanguage}. ` +
                "Preserve the original paragraph structure and meaning as closely as possible. " +
                "Respond with only the translated text — no preamble, no notes, no explanation.\n\n---\n\n" +
                text,
            },
          ],
        },
      ],
      config: { maxOutputTokens },
    });
    const translated = response.text;
    if (!translated) throw new Error("Gemini returned an empty response.");
    return translated;
  } catch (err) {
    throw toFriendlyError(err);
  }
}

const DIFFICULTY_INSTRUCTIONS: Record<GenerateMcqsInput["difficulty"], string> = {
  easy: "Questions should test recall of clearly-stated facts directly from the text.",
  medium: "Questions should require connecting two or more points from the text, not just recall.",
  hard: "Questions should require inference or synthesis across the text, and include plausible, non-obvious distractor options.",
};

function extractJson(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

async function generateMcqs({
  text,
  count,
  difficulty,
  maxOutputTokens = 4096,
}: GenerateMcqsInput): Promise<McqQuestion[]> {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                `Generate exactly ${count} multiple-choice questions from the following document text, ` +
                `for a student studying this material. Difficulty: ${difficulty}. ${DIFFICULTY_INSTRUCTIONS[difficulty]} ` +
                "Each question must have exactly 4 options with exactly one correct answer.\n\n" +
                'Respond with ONLY a JSON array, no markdown fences, no commentary, in this exact shape: ' +
                '[{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0}]\n\n' +
                "correctIndex is a 0-based index into options.\n\n---\n\n" +
                text,
            },
          ],
        },
      ],
      config: { maxOutputTokens, responseMimeType: "application/json" },
    });
    const raw = response.text;
    if (!raw) throw new Error("Gemini returned an empty response.");

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJson(raw));
    } catch {
      throw new Error("Gemini returned a response that couldn't be parsed as quiz questions. Please try again.");
    }
    if (!Array.isArray(parsed)) {
      throw new Error("Gemini returned a response that couldn't be parsed as quiz questions. Please try again.");
    }

    const questions: McqQuestion[] = parsed
      .filter(
        (q): q is McqQuestion =>
          typeof q === "object" &&
          q !== null &&
          typeof (q as McqQuestion).question === "string" &&
          Array.isArray((q as McqQuestion).options) &&
          (q as McqQuestion).options.length === 4 &&
          typeof (q as McqQuestion).correctIndex === "number" &&
          (q as McqQuestion).correctIndex >= 0 &&
          (q as McqQuestion).correctIndex <= 3
      )
      .slice(0, count);

    if (questions.length === 0) {
      throw new Error("Gemini didn't return any usable questions for this document. Please try again.");
    }
    return questions;
  } catch (err) {
    if (err instanceof ApiError) throw toFriendlyError(err);
    throw err instanceof Error ? err : new Error("Unknown AI provider error");
  }
}

export const geminiProvider: AiProvider = { summarizeText, translateText, generateMcqs };
