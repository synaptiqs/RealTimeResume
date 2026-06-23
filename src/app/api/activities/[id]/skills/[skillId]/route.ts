import { removeSkillFromActivity } from "@/lib/skills";
import { error, json, withUser } from "@/lib/http";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; skillId: string }> },
) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const { id, skillId } = await params;
  const ok = await removeSkillFromActivity(auth.user.id, id, skillId);
  if (!ok) return error("Not found", 404);
  return json({ ok: true });
}
