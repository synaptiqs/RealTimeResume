import { prisma } from "@/lib/db";
import { getAggregatedSkills } from "@/lib/skills";
import {
  buildResumeMarkdown,
  defaultResumeTitle,
  type ResumeActivityInput,
} from "@/lib/resume/template";

/**
 * Generate a resume for the user from their stored activities and skills using
 * the deterministic template (no AI), and persist it as a ResumeVersion.
 */
export async function generateResume(
  userId: string,
  opts: { targetRole?: string } = {},
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

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
    targetRole: opts.targetRole ?? null,
    skills,
    activities: activityInputs,
  });

  return prisma.resumeVersion.create({
    data: {
      userId,
      title: defaultResumeTitle(opts.targetRole),
      targetRole: opts.targetRole?.trim() || null,
      content,
    },
  });
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
