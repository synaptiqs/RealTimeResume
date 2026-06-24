import Anthropic from "@anthropic-ai/sdk";

/** Default model for all AI features. */
export const AI_MODEL = "claude-opus-4-8";

/** Whether an Anthropic API key is configured. AI features are optional — the
 *  rest of the app runs without one (e.g. local dev / CI). */
export function isAIConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

let client: Anthropic | null = null;

/** Lazily construct a shared Anthropic client. Throws if not configured. */
export function getAIClient(): Anthropic {
  if (!isAIConfigured()) {
    throw new Error("AI is not configured (missing ANTHROPIC_API_KEY).");
  }
  client ??= new Anthropic();
  return client;
}
