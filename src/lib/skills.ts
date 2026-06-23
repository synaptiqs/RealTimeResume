import { prisma } from "@/lib/db";
import type { ResumeSkillInput } from "@/lib/resume/template";

/**
 * Aggregate a user's many ActivitySkill rows into one entry per skill, taking
 * the best proficiency and counting how many activities reference it. Pure
 * reducer extracted so it can be unit-tested without a database.
 */
export interface RawActivitySkill {
  name: string;
  category?: string | null;
  proficiency: number;
}

export function aggregateActivitySkills(
  rows: RawActivitySkill[],
): ResumeSkillInput[] {
  const map = new Map<string, ResumeSkillInput>();
  for (const row of rows) {
    const existing = map.get(row.name);
    if (existing) {
      existing.proficiency = Math.max(existing.proficiency, row.proficiency);
      existing.activityCount += 1;
      if (!existing.category && row.category) existing.category = row.category;
    } else {
      map.set(row.name, {
        name: row.name,
        category: row.category ?? null,
        proficiency: row.proficiency,
        activityCount: 1,
      });
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      b.proficiency - a.proficiency ||
      b.activityCount - a.activityCount ||
      a.name.localeCompare(b.name),
  );
}

function clampProficiency(value: number): number {
  if (Number.isNaN(value)) return 3;
  return Math.max(1, Math.min(5, Math.round(value)));
}

/**
 * Attach a skill to an activity, creating the skill for this user if needed.
 * Skill names are unique per user (case-insensitive normalized to the first
 * spelling seen).
 */
export async function addSkillToActivity(
  userId: string,
  activityId: string,
  data: { name: string; category?: string | null; proficiency?: number },
) {
  // Verify the activity belongs to the user.
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, userId },
  });
  if (!activity) throw new Error("Activity not found");

  const name = data.name.trim();
  if (!name) throw new Error("Skill name is required");

  const skill = await prisma.skill.upsert({
    where: { userId_name: { userId, name } },
    create: { userId, name, category: data.category ?? null },
    update: data.category ? { category: data.category } : {},
  });

  return prisma.activitySkill.upsert({
    where: { activityId_skillId: { activityId, skillId: skill.id } },
    create: {
      activityId,
      skillId: skill.id,
      proficiency: clampProficiency(data.proficiency ?? 3),
    },
    update: { proficiency: clampProficiency(data.proficiency ?? 3) },
  });
}

export async function removeSkillFromActivity(
  userId: string,
  activityId: string,
  skillId: string,
) {
  const activity = await prisma.activity.findFirst({
    where: { id: activityId, userId },
  });
  if (!activity) return false;
  const result = await prisma.activitySkill.deleteMany({
    where: { activityId, skillId },
  });
  return result.count > 0;
}

/** Aggregate all of a user's skills across activities. */
export async function getAggregatedSkills(
  userId: string,
): Promise<ResumeSkillInput[]> {
  const rows = await prisma.activitySkill.findMany({
    where: { skill: { userId } },
    include: { skill: true },
  });
  return aggregateActivitySkills(
    rows.map((r) => ({
      name: r.skill.name,
      category: r.skill.category,
      proficiency: r.proficiency,
    })),
  );
}
