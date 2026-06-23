import { deleteActivity } from "@/lib/activities";
import { error, json, withUser } from "@/lib/http";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const { id } = await params;
  const ok = await deleteActivity(auth.user.id, id);
  if (!ok) return error("Activity not found", 404);
  return json({ ok: true });
}
