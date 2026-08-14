import "server-only";
import type { AiProvider } from "./provider";
import { openrouterProvider } from "./providers/openrouter-provider";

/**
 * Central switch for the active AI provider. To plug in another one (Groq,
 * Anthropic, ...): add a providers/<name>-provider.ts implementing AiProvider,
 * add a case below, and point AI_PROVIDER at it, the route handlers and tool
 * components never change.
 */
export function getAiProvider(): AiProvider {
  const name = process.env.AI_PROVIDER ?? "openrouter";
  switch (name) {
    case "openrouter":
      return openrouterProvider;
    default:
      throw new Error(
        `Unknown AI_PROVIDER "${name}", only "openrouter" is currently implemented.`
      );
  }
}
