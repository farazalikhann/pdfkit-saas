export type SummaryLength = "short" | "detailed" | "bullets";

export interface SummarizeTextInput {
  text: string;
  length?: SummaryLength;
  maxOutputTokens?: number;
}

export interface TranslateTextInput {
  text: string;
  targetLanguage: string;
  /** Omit or "auto" to let the model detect the source language itself. */
  sourceLanguage?: string;
  maxOutputTokens?: number;
}

export type McqDifficulty = "easy" | "medium" | "hard";

export interface GenerateMcqsInput {
  text: string;
  count: number;
  difficulty: McqDifficulty;
  maxOutputTokens?: number;
}

export interface McqQuestion {
  question: string;
  options: string[];
  /** Index into `options` for the correct answer. */
  correctIndex: number;
}

/**
 * Provider-agnostic contract for the AI tools (Summarize, Translate, generate
 * MCQs). Text is extracted from the PDF client-side and passed in — providers
 * never see the file itself. To add another backend (Groq, Anthropic, ...):
 * implement this interface in providers/<name>-provider.ts and add a case to
 * get-provider.ts.
 */
export interface AiProvider {
  summarizeText(input: SummarizeTextInput): Promise<string>;
  translateText(input: TranslateTextInput): Promise<string>;
  generateMcqs(input: GenerateMcqsInput): Promise<McqQuestion[]>;
}
