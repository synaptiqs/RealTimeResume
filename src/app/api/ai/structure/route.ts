import { z } from "zod";
import { isAIConfigured } from "@/lib/ai/client";
import { suggestResumeStructure } from "@/lib/ai/structure";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({ targetRole: z.string().max(120).optional() });

// Narrow AI: free for all signed-in users.
export async function POST(req: Request) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;

  if (!isAIConfigured()) {
    return error("AI is not available right now.", 503);
  }

  let body: unknown = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid input");

  try {
    const result = await suggestResumeStructure(auth.user.id, {
      targetRole: parsed.data.targetRole,
    });
    return json(result);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not generate suggestions", 502);
  }
}
