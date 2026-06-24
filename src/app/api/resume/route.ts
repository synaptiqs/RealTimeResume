import { z } from "zod";
import { generateResume, listResumes } from "@/lib/resume";
import { error, json, withUser } from "@/lib/http";

const FREE_RESUME_LIMIT = 1;

const schema = z.object({
  targetJob: z.string().max(120).optional(),
  targetRole: z.string().max(120).optional(), // legacy alias
});

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

  // Free plan: limited to one saved resume.
  if (!auth.user.isPro) {
    const existing = await listResumes(auth.user.id);
    if (existing.length >= FREE_RESUME_LIMIT) {
      return error(
        "Free plan is limited to 1 resume. Upgrade to Pro for unlimited resumes.",
        402,
      );
    }
  }

  const resume = await generateResume(auth.user.id, {
    targetJob: parsed.data.targetJob ?? parsed.data.targetRole,
  });
  return json({ resume }, 201);
}
