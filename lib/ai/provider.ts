export type SummaryLength = "short" | "detailed" | "bullets";

export interface SummarizeTextInput {
  text: string;
  length?: SummaryLength;
  maxOutputTokens?: number;
}

/**
 * Provider-agnostic contract for the (single) AI tool. Text is extracted from
 * the PDF client-side and passed in — providers never see the file itself.
 * To add another backend (Groq, Anthropic, ...): implement this interface in
 * providers/<name>-provider.ts and add a case to get-provider.ts.
 */
export interface AiProvider {
  summarizeText(input: SummarizeTextInput): Promise<string>;
}
