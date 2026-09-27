import { z } from "zod";
import { suggestSkills } from "@/lib/skills/suggest";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({ text: z.string().max(5000) });

// Deterministic keyword-based suggestions (NOT AI).
export async function POST(req: Request) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid input");

  return json({ suggestions: suggestSkills(parsed.data.text) });
}
