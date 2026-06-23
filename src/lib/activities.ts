import { prisma } from "@/lib/db";

export interface NewActivity {
  title: string;
  description: string;
  occurredAt?: Date;
}

export async function createActivity(userId: string, data: NewActivity) {
  return prisma.activity.create({
    data: {
      userId,
      title: data.title.trim(),
      description: data.description.trim(),
      occurredAt: data.occurredAt ?? new Date(),
    },
  });
}

export async function listActivities(userId: string) {
  return prisma.activity.findMany({
    where: { userId },
    orderBy: { occurredAt: "desc" },
    include: {
      skills: { include: { skill: true } },
    },
  });
}

export async function getActivity(userId: string, id: string) {
  return prisma.activity.findFirst({
    where: { id, userId },
    include: { skills: { include: { skill: true } } },
  });
}

export async function deleteActivity(userId: string, id: string) {
  // Scope the delete to the owner so users can't delete others' rows.
  const result = await prisma.activity.deleteMany({ where: { id, userId } });
  return result.count > 0;
}
