import { prisma } from "@/lib/db";
import { getAggregatedSkills } from "@/lib/skills";
import { AI_MODEL, getAIClient } from "@/lib/ai/client";
import {
  STRUCTURE_SCHEMA,
  STRUCTURE_SYSTEM_PROMPT,
  buildStructureUserPrompt,
  renderStructurePlan,
  type StructurePlan,
  type StructureProfile,
} from "@/lib/ai/structure/template";

/** Load the user's profile for structuring (titles + skills only — no rewriting). */
async function loadProfile(
  userId: string,
  targetRole?: string,
): Promise<StructureProfile> {
  const [user, activities, skills] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.activity.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
      include: { skills: { include: { skill: true } } },
    }),
    getAggregatedSkills(userId),
  ]);

  return {
    targetRole: targetRole ?? null,
    goal: user?.goal ?? null,
    skills: skills.map((s) => s.name),
    activities: activities.map((a) => ({
      title: a.title,
      skills: a.skills.map((s) => s.skill.name),
    })),
  };
}

export interface StructureResult {
  plan: StructurePlan;
  markdown: string;
}

/**
 * Narrow AI: suggest how to organize the user's existing resume material into
 * ordered sections. Free for all users. Does not rewrite content.
 */
export async function suggestResumeStructure(
  userId: string,
  opts: { targetRole?: string } = {},
): Promise<StructureResult> {
  const profile = await loadProfile(userId, opts.targetRole);
  const client = getAIClient();

  const response = await client.messages.create({
    model: AI_MODEL,
    max_tokens: 2000,
    system: STRUCTURE_SYSTEM_PROMPT,
    output_config: {
      effort: "low",
      format: {
        type: "json_schema",
        schema: STRUCTURE_SCHEMA,
      },
    },
    messages: [{ role: "user", content: buildStructureUserPrompt(profile) }],
  });

  const text = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  let plan: StructurePlan;
  try {
    plan = JSON.parse(text) as StructurePlan;
  } catch {
    throw new Error("AI returned an unexpected response. Please try again.");
  }

  return { plan, markdown: renderStructurePlan(plan) };
}
