import { prisma } from "@/lib/db";

/** Free plan: number of activity/skill extractions allowed per calendar month. */
export const FREE_MONTHLY_EXTRACTIONS = 5;

/** Count how many of the given timestamps fall in the same month as `now`. Pure. */
export function extractionsThisMonth(dates: Date[], now: Date): number {
  return dates.filter(
    (d) =>
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(),
  ).length;
}

export interface ExtractionUsage {
  used: number;
  limit: number | null; // null = unlimited (Pro)
  remaining: number | null;
}

/** Resolve a user's extraction usage for the current month. */
export async function getExtractionUsage(
  userId: string,
  isPro: boolean,
): Promise<ExtractionUsage> {
  if (isPro) return { used: 0, limit: null, remaining: null };

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const used = await prisma.activity.count({
    where: { userId, createdAt: { gte: monthStart } },
  });
  return {
    used,
    limit: FREE_MONTHLY_EXTRACTIONS,
    remaining: Math.max(0, FREE_MONTHLY_EXTRACTIONS - used),
  };
}
