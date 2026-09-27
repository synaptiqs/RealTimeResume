import { z } from "zod";
import { isAIConfigured } from "@/lib/ai/client";
import { enhanceResume } from "@/lib/ai/enhance";
import { getResume } from "@/lib/resume";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({
  resumeId: z.string().min(1),
  jobDescription: z.string().max(8000).optional(),
});

// Full AI assistance: gated behind the paywall (user.isPro).
export async function POST(req: Request) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;

  if (!auth.user.isPro) {
    return error(
      "Full AI resume assistance is a Pro feature. Upgrade to unlock AI rewriting and tailoring.",
      402,
    );
  }

  if (!isAIConfigured()) {
    return error("AI is not available right now.", 503);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid input");

  const resume = await getResume(auth.user.id, parsed.data.resumeId);
  if (!resume) return error("Resume not found", 404);

  try {
    const result = await enhanceResume({
      resumeContent: resume.content,
      jobDescription: parsed.data.jobDescription,
    });
    return json(result);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not enhance resume", 502);
  }
}
