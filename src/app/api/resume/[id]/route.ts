import { deleteResume, getResume } from "@/lib/resume";
import { error, json, withUser } from "@/lib/http";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const { id } = await params;
  const resume = await getResume(auth.user.id, id);
  if (!resume) return error("Resume not found", 404);
  return json({ resume });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const { id } = await params;
  const ok = await deleteResume(auth.user.id, id);
  if (!ok) return error("Resume not found", 404);
  return json({ ok: true });
}
