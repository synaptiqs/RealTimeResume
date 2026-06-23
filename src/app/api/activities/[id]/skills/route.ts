import { z } from "zod";
import { addSkillToActivity } from "@/lib/skills";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({
  name: z.string().min(1).max(80),
  category: z.string().max(60).optional(),
  proficiency: z.number().int().min(1).max(5).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return error("Invalid JSON body");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  try {
    const link = await addSkillToActivity(auth.user.id, id, parsed.data);
    return json({ activitySkill: link }, 201);
  } catch (e) {
    return error(e instanceof Error ? e.message : "Could not add skill", 404);
  }
}
