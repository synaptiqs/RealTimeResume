import { getAggregatedSkills } from "@/lib/skills";
import { json, withUser } from "@/lib/http";

export async function GET() {
  const auth = await withUser();
  if (!("user" in auth)) return auth;
  const skills = await getAggregatedSkills(auth.user.id);
  return json({ skills });
}
