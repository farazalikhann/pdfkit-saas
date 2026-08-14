import "server-only";
import type {
  AiProvider,
  SummarizeTextInput,
  TranslateTextInput,
  GenerateMcqsInput,
  McqQuestion,
} from "../provider";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Primary: a free-tier reasoning model on OpenRouter. Fallback: a different
// free model from a different provider (Google, not Nvidia), used for
// exactly one retry when the primary is rate-limited or unavailable, so a
// single vendor's outage or exhausted free-tier quota doesn't take every AI
// tool down at once. Both were verified directly against the live API to
// accept `reasoning: { enabled: false }` and return clean, non-reasoning
// output, some free models on OpenRouter reject that field outright (e.g.
// openai/gpt-oss-20b:free returns a 400, "Reasoning is mandatory for this
// endpoint"), so don't swap either for a model that hasn't been checked.
const PRIMARY_MODEL = "nvidia/nemotron-3.5-lightning:free";
const FALLBACK_MODEL = "google/gemma-4-31b-it:free";

function getApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your environment to enable this AI tool."
    );
  }
  return apiKey;
}

/** Carries the HTTP status (when there is one) so callOpenRouter can decide whether a failure is worth retrying on the fallback model. */
class OpenRouterError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

function toFriendlyMessage(status: number, body: string): string {
  if (status === 429) {
    return "The AI tool's free tier is temporarily rate-limited. Please try again in a minute.";
  }
  if (status >= 500) {
    return "The AI tool is temporarily unavailable. Please try again shortly.";
  }
  return `OpenRouter API error (${status}): ${body || "request failed"}`;
}

/** A failure worth retrying on the fallback model: rate-limited, a server-side error, or the request never reached OpenRouter at all (status undefined). Anything else, a bad request or an auth failure, would fail identically on the fallback, so it isn't retried. */
function isRetryable(status: number | undefined): boolean {
  return status === undefined || status === 429 || status >= 500;
}

async function requestModel(
  model: string,
  prompt: string,
  config: { maxOutputTokens?: number }
): Promise<string> {
  const apiKey = getApiKey();
  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Optional but recommended by OpenRouter for attributing usage on their dashboard.
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: config.maxOutputTokens ?? 1024,
        // Both configured models reason by default (even with no "reasoning"
        // key at all) and, verified against the live API, echo their full
        // chain-of-thought into `message.content` too, not just
        // `message.reasoning`. On a trivial 2-sentence summary that alone
        // burned ~650 tokens before any real answer appeared, so a request
        // that hits maxOutputTokens mid-thought returns garbled, truncated
        // reasoning instead of an answer. Every tool here is single-shot
        // structured output with no follow-up turn to benefit from a visible
        // trace, so reasoning is disabled: confirmed via a direct API call
        // this drops token usage ~13x (654 to 50 for the same prompt) and
        // returns a clean final answer every time.
        reasoning: { enabled: false },
      }),
    });
  } catch {
    throw new OpenRouterError("Could not reach OpenRouter. Check your connection and try again.");
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new OpenRouterError(toFriendlyMessage(res.status, body), res.status);
  }

  let data: { choices?: { message?: { content?: string | null } }[] };
  try {
    data = await res.json();
  } catch {
    throw new OpenRouterError("The AI tool returned a response that couldn't be read.", res.status);
  }
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new OpenRouterError("The AI tool returned an empty response.", res.status);
  return text;
}

/**
 * The single call path every AI tool on this site goes through. Summarize,
 * Translate, and generate-MCQs each just build a different prompt and pass it
 * here, the model, the request shape, and the error handling live in exactly
 * one place, so they can't quietly drift apart. Tries the primary model
 * first; on a rate limit, a server error, or a network failure, retries
 * exactly once against the fallback model, never in a loop, since every
 * attempt draws down the shared daily budget in lib/ai/rate-limiter.ts.
 */
async function callOpenRouter(
  prompt: string,
  config: { maxOutputTokens?: number } = {}
): Promise<string> {
  try {
    return await requestModel(PRIMARY_MODEL, prompt, config);
  } catch (err) {
    const status = err instanceof OpenRouterError ? err.status : undefined;
    if (!isRetryable(status)) throw err;
    console.error(
      `[openrouter-provider] Primary model failed (${err instanceof Error ? err.message : err}), retrying once on fallback model ${FALLBACK_MODEL}.`
    );
    try {
      return await requestModel(FALLBACK_MODEL, prompt, config);
    } catch {
      // Both models failed, surface the primary's error: it's the one a
      // reader would recognize ("rate-limited", "temporarily unavailable"),
      // while the fallback failing the same way adds no new information.
      throw err;
    }
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
  return callOpenRouter(prompt, { maxOutputTokens });
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
  const raw = await callOpenRouter(prompt, { maxOutputTokens });
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
 * comma, things models occasionally do even when told not to. Throws (a
 * plain SyntaxError from JSON.parse) if nothing usable can be recovered.
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
  // Models occasionally wrap the array in an object (e.g. {"questions": [...]})
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
  // more than a smaller token ceiling; that would silently truncate the JSON
  // mid-array, which is indistinguishable from a parse failure.
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
    const raw = await callOpenRouter(prompt, { maxOutputTokens });
    lastRaw = raw;

    let parsed: unknown;
    try {
      parsed = parseJsonLoose(raw);
    } catch (err) {
      lastParseError = err instanceof Error ? err.message : String(err);
      console.error(
        `[openrouter-provider] MCQ attempt ${attempt}: JSON.parse failed (${lastParseError}). Raw response:`,
        raw
      );
      continue;
    }

    const questions = toMcqQuestions(parsed, count);
    if (questions.length > 0) return questions;

    console.error(
      `[openrouter-provider] MCQ attempt ${attempt}: parsed but no usable questions. Raw response:`,
      raw
    );
  }

  console.error("[openrouter-provider] MCQ generation exhausted retries. Last raw response:", lastRaw);
  throw new Error(
    lastParseError
      ? "The AI tool returned a response that couldn't be parsed as quiz questions. Please try again."
      : "The AI tool didn't return any usable questions for this document. Please try again."
  );
}

export const openrouterProvider: AiProvider = { summarizeText, translateText, generateMcqs };
