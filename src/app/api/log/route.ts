import { z } from "zod";
import { createActivity } from "@/lib/activities";
import { addSkillToActivity } from "@/lib/skills";
import { getExtractionUsage } from "@/lib/quota";
import { error, json, withUser } from "@/lib/http";

const schema = z.object({
  text: z.string().min(1, "Describe what you did").max(5000),
  title: z.string().max(200).optional(),
  source: z.enum(["text", "voice"]).default("text"),
  skills: z
    .array(
      z.object({
        name: z.string().min(1).max(80),
        category: z.string().max(60).optional(),
        proficiency: z.number().int().min(1).max(5).optional(),
      }),
    )
    .max(20)
    .default([]),
});

/** Log an activity with accepted skills, enforcing the Free monthly quota. */
export async function POST(req: Request) {
  const auth = await withUser();
  if (!("user" in auth)) return auth;

  // Voice is a Pro-only capability.
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

  if (parsed.data.source === "voice" && !auth.user.isPro) {
    return error("Voice logging is a Pro feature.", 402);
  }

  // Enforce the free monthly extraction quota.
  const usage = await getExtractionUsage(auth.user.id, auth.user.isPro);
  if (usage.remaining !== null && usage.remaining <= 0) {
    return error(
      "You've used all 5 free extractions this month. Upgrade to Pro for unlimited logging.",
      402,
    );
  }

  const text = parsed.data.text.trim();
  const title =
    parsed.data.title?.trim() ||
    text.split(/[.\n]/)[0].slice(0, 80).trim() ||
    "Activity";

  const activity = await createActivity(auth.user.id, {
    title,
    description: text,
    source: parsed.data.source,
  });

  for (const skill of parsed.data.skills) {
    await addSkillToActivity(auth.user.id, activity.id, {
      name: skill.name,
      category: skill.category ?? null,
      proficiency: skill.proficiency ?? 3,
    });
  }

  const newUsage = await getExtractionUsage(auth.user.id, auth.user.isPro);
  return json({ activity, usage: newUsage }, 201);
}
