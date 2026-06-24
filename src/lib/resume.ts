import { prisma } from "@/lib/db";
import { getAggregatedSkills } from "@/lib/skills";
import { computeResumeScore, type ResumeScore } from "@/lib/score";
import {
  buildResumeMarkdown,
  defaultResumeTitle,
  type ResumeActivityInput,
} from "@/lib/resume/template";

/**
 * Generate a resume for the user from their stored activities and skills using
 * the deterministic template (no AI), score it against the target job, and
 * persist it as a ResumeVersion.
 */
export async function generateResume(
  userId: string,
  opts: { targetJob?: string } = {},
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const targetJob = opts.targetJob?.trim() || null;

  const [activities, skills] = await Promise.all([
    prisma.activity.findMany({
      where: { userId },
      orderBy: { occurredAt: "desc" },
      include: { skills: { include: { skill: true } } },
    }),
    getAggregatedSkills(userId),
  ]);

  const activityInputs: ResumeActivityInput[] = activities.map((a) => ({
    title: a.title,
    description: a.description,
    occurredAt: a.occurredAt,
    skills: a.skills.map((s) => s.skill.name),
  }));

  const content = buildResumeMarkdown({
    name: user.name,
    goal: user.goal,
    targetRole: targetJob,
    skills,
    activities: activityInputs,
  });

  const strength = computeResumeScore({
    targetJob,
    skills: skills.map((s) => ({
      name: s.name,
      proficiency: s.proficiency,
      activityCount: s.activityCount,
    })),
    activityCount: activities.length,
  });

  return prisma.resumeVersion.create({
    data: {
      userId,
      title: defaultResumeTitle(targetJob),
      targetRole: targetJob,
      targetJob,
      content,
      score: strength.score,
      skillsMatch: strength.skillsMatch,
      ats: strength.ats,
      keywords: strength.keywords,
      format: strength.format,
    },
  });
}

/** Live Resume Strength for the dashboard / builder, computed from current data. */
export async function getResumeStrength(
  userId: string,
  targetJob?: string | null,
): Promise<ResumeScore & { targetJob: string | null }> {
  const [activityCount, skills] = await Promise.all([
    prisma.activity.count({ where: { userId } }),
    getAggregatedSkills(userId),
  ]);
  const score = computeResumeScore({
    targetJob,
    skills: skills.map((s) => ({
      name: s.name,
      proficiency: s.proficiency,
      activityCount: s.activityCount,
    })),
    activityCount,
  });
  return { ...score, targetJob: targetJob?.trim() || null };
}

export async function listResumes(userId: string) {
  return prisma.resumeVersion.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getResume(userId: string, id: string) {
  return prisma.resumeVersion.findFirst({ where: { id, userId } });
}

export async function deleteResume(userId: string, id: string) {
  const result = await prisma.resumeVersion.deleteMany({
    where: { id, userId },
  });
  return result.count > 0;
}
