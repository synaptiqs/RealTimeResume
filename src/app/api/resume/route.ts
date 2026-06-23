import { z } from "zod";
import { generateResume, listResumes } from "@/lib/resume";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({ targetRole: z.string().max(120).optional() });

export async function GET() {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const resumes = await listResumes(auth.user.id);
  return json({ resumes });
}

export async function POST(req: Request) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;

  let body: unknown = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    return error("Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return error("Invalid input");

  const resume = await generateResume(auth.user.id, {
    targetRole: parsed.data.targetRole,
  });
  return json({ resume }, 201);
}
