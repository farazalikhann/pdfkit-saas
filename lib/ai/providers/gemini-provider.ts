import "server-only";
import { GoogleGenAI, ApiError } from "@google/genai";
import type {
  AiProvider,
  SummarizeTextInput,
  TranslateTextInput,
  GenerateMcqsInput,
  McqQuestion,
} from "../provider";

// An alias, not a dated snapshot, keeps resolving to a current flash-tier model as
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

/**
 * The single call path every AI tool on this site goes through. Summarize,
 * Translate, and generate-MCQs each just build a different prompt and pass it
 * here, the model, the client, and the error handling live in exactly one
 * place, so they can't quietly drift apart (e.g. one tool still pointing at a
 * model Google has since retired for new users, like gemini-2.5-flash was).
 */
async function callGemini(
  prompt: string,
  config: { maxOutputTokens?: number; responseMimeType?: string } = {}
): Promise<string> {
  const ai = getClient();
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        maxOutputTokens: config.maxOutputTokens ?? 1024,
        ...(config.responseMimeType ? { responseMimeType: config.responseMimeType } : {}),
      },
    });
    const text = response.text;
    if (!text) throw new Error("Gemini returned an empty response.");
    return text;
  } catch (err) {
    throw toFriendlyError(err);
  }
}

const SUMMARY_INSTRUCTIONS: Record<NonNullable<SummarizeTextInput["length"]>, string> = {
  short:
    "Summarize the following document in 2-3 concise sentences, just the core point, no bullets.",
  detailed:
    "Write a detailed multi-paragraph summary of the following document, covering its main " +
    "points, supporting details, and any conclusions or recommendations. Use Markdown: a level-2 " +
    "heading (##) for each major section if the document has distinct topics, and \"- \" bullet " +
    "points for lists.",
  bullets:
    "Summarize the following document text in 5-8 concise bullet points (each starting with \"- \"), " +
    "followed by a one-sentence TLDR on its own line starting with \"TLDR: \".",
};

async function summarizeText({
  text,
  length = "bullets",
  maxOutputTokens = 1024,
}: SummarizeTextInput): Promise<string> {
  const prompt = `${SUMMARY_INSTRUCTIONS[length]} Respond in plain Markdown (headings as "## ", bullets as "- "), no other formatting.\n\n---\n\n${text}`;
  return callGemini(prompt, { maxOutputTokens });
}

async function translateText({
  text,
  targetLanguage,
  sourceLanguage,
  maxOutputTokens = 4096,
}: TranslateTextInput): Promise<string> {
  const sourceClause = sourceLanguage && sourceLanguage !== "auto" ? `from ${sourceLanguage} ` : "";
  const prompt =
    `Translate the following document text ${sourceClause}into ${targetLanguage}. ` +
    "Preserve the original paragraph structure and meaning as closely as possible. " +
    "Respond with only the translated text, no preamble, no notes, no explanation.\n\n---\n\n" +
    text;
  const raw = await callGemini(prompt, { maxOutputTokens });
  // Translate doesn't ask for structured output, but models occasionally wrap
  // even plain-text replies in a ``` fence anyway, strip it defensively so a
  // stray fence marker never ends up in the on-screen text or exported PDF.
  return stripCodeFence(raw);
}

const DIFFICULTY_INSTRUCTIONS: Record<GenerateMcqsInput["difficulty"], string> = {
  easy: "Questions should test recall of clearly-stated facts directly from the text.",
  medium: "Questions should require connecting two or more points from the text, not just recall.",
  hard: "Questions should require inference or synthesis across the text, and include plausible, non-obvious distractor options.",
};

/** Strips a wrapping ```json ... ``` or ``` ... ``` fence, if present, models
 * sometimes add one even in JSON mode, or even around plain prose. No-op
 * (aside from trimming) when there isn't one. */
function stripCodeFence(raw: string): string {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : raw).trim();
}

/**
 * Best-effort recovery for a JSON value that should be in `raw` but may be
 * preceded/followed by prose, wrapped in a markdown fence, or have a trailing
 * comma, things models occasionally do even when told not to and even in
 * JSON response-mime mode. Throws (a plain SyntaxError from JSON.parse) if
 * nothing usable can be recovered.
 */
function parseJsonLoose(raw: string): unknown {
  let text = stripCodeFence(raw);

  // Trim to the outermost [ ] or { }, drops any leading/trailing prose the
  // fence strip above didn't catch.
  const firstBracket = text.search(/[[{]/);
  const lastBracket = Math.max(text.lastIndexOf("]"), text.lastIndexOf("}"));
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    text = text.slice(firstBracket, lastBracket + 1);
  }

  // Trailing commas before a closing bracket: `..., ]` / `..., }`.
  text = text.replace(/,(\s*[\]}])/g, "$1");

  return JSON.parse(text);
}

function toMcqQuestions(parsed: unknown, count: number): McqQuestion[] {
  // Gemini occasionally wraps the array in an object (e.g. {"questions": [...]})
  // even when told to respond with a bare array, unwrap it if so.
  const candidate = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { questions?: unknown }).questions)
      ? (parsed as { questions: unknown[] }).questions
      : null;
  if (!candidate) return [];

  return candidate
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
}

async function generateMcqs({
  text,
  count,
  difficulty,
  // 20 questions (the tool's max) at "hard" difficulty, which is explicitly
  // instructed to write longer, non-obvious distractors, can genuinely need
  // more than the previous 4096-token ceiling; that was silently truncating
  // the JSON mid-array, which is indistinguishable from a parse failure.
  maxOutputTokens = 8192,
}: GenerateMcqsInput): Promise<McqQuestion[]> {
  const prompt =
    `Generate exactly ${count} multiple-choice questions from the following document text, ` +
    `for a student studying this material. Difficulty: ${difficulty}. ${DIFFICULTY_INSTRUCTIONS[difficulty]} ` +
    "Each question must have exactly 4 options with exactly one correct answer. Keep each question " +
    "and option concise, one sentence each, so the full response fits comfortably within the output limit.\n\n" +
    "Respond with ONLY valid JSON: a single array, no markdown code fences, no commentary before or " +
    'after it, in exactly this shape: [{"question": "...", "options": ["...", "...", "...", "..."], "correctIndex": 0}]\n\n' +
    "correctIndex is a 0-based index into options.\n\n---\n\n" +
    text;

  let lastRaw = "";
  let lastParseError: string | null = null;

  // One retry: JSON parse failures here are almost always a transient model
  // quirk (a stray fence, truncation, wrapping object) rather than a
  // deterministic one, so asking again before giving up on the user usually
  // just works.
  for (let attempt = 1; attempt <= 2; attempt++) {
    const raw = await callGemini(prompt, { maxOutputTokens, responseMimeType: "application/json" });
    lastRaw = raw;

    let parsed: unknown;
    try {
      parsed = parseJsonLoose(raw);
    } catch (err) {
      lastParseError = err instanceof Error ? err.message : String(err);
      console.error(
        `[gemini-provider] MCQ attempt ${attempt}: JSON.parse failed (${lastParseError}). Raw response:`,
        raw
      );
      continue;
    }

    const questions = toMcqQuestions(parsed, count);
    if (questions.length > 0) return questions;

    console.error(
      `[gemini-provider] MCQ attempt ${attempt}: parsed but no usable questions. Raw response:`,
      raw
    );
  }

  console.error("[gemini-provider] MCQ generation exhausted retries. Last raw response:", lastRaw);
  throw new Error(
    lastParseError
      ? "Gemini returned a response that couldn't be parsed as quiz questions. Please try again."
      : "Gemini didn't return any usable questions for this document. Please try again."
  );
}

export const geminiProvider: AiProvider = { summarizeText, translateText, generateMcqs };
