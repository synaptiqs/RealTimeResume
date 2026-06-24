import { AI_MODEL, getAIClient } from "@/lib/ai/client";

const ENHANCE_SYSTEM_PROMPT = [
  "You are an expert resume writer. Rewrite the provided Markdown resume so it",
  "reads sharper and more professional, and — when a job description is given —",
  "tailor emphasis and wording toward that role.",
  "",
  "Rules:",
  "- Keep it truthful: never invent employers, dates, metrics, or achievements.",
  "  You may rephrase and strengthen existing content, not fabricate new facts.",
  "- Preserve the candidate's real experience; improve clarity, impact verbs,",
  "  and consistency.",
  "- Return ONLY the improved resume as Markdown — no commentary.",
].join("\n");

/**
 * Full AI assistance (paywalled): rewrite/tailor an existing resume. Callers
 * must enforce the paywall (user.isPro) before invoking this.
 */
export async function enhanceResume(opts: {
  resumeContent: string;
  jobDescription?: string;
}): Promise<{ markdown: string }> {
  const client = getAIClient();

  const parts = [`Resume to improve:\n\n${opts.resumeContent}`];
  if (opts.jobDescription?.trim()) {
    parts.push(`\n\nTarget job description:\n\n${opts.jobDescription.trim()}`);
  }

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 8000,
    system: ENHANCE_SYSTEM_PROMPT,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    messages: [{ role: "user", content: parts.join("") }],
  });

  const markdown = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .trim();

  return { markdown };
}
