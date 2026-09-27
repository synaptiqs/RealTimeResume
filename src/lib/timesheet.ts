import { prisma } from "@/lib/db";
import {
  buildTimesheetCsv,
  buildTimesheetMarkdown,
  summarizeTimesheet,
  type TimeEntryInput,
} from "@/lib/timesheet/template";

export interface NewTimeEntry {
  date: Date;
  hours: number;
  project?: string | null;
  description: string;
}

export async function addTimeEntry(userId: string, data: NewTimeEntry) {
  if (!(data.hours > 0)) throw new Error("Hours must be greater than 0");
  return prisma.timeEntry.create({
    data: {
      userId,
      date: data.date,
      hours: data.hours,
      project: data.project?.trim() || null,
      description: data.description.trim(),
    },
  });
}

export async function listTimeEntries(
  userId: string,
  range?: { from?: Date; to?: Date },
) {
  return prisma.timeEntry.findMany({
    where: {
      userId,
      date: {
        gte: range?.from,
        lte: range?.to,
      },
    },
    orderBy: { date: "desc" },
  });
}

export async function deleteTimeEntry(userId: string, id: string) {
  const result = await prisma.timeEntry.deleteMany({ where: { id, userId } });
  return result.count > 0;
}

/** Generate a timesheet report (Markdown + CSV + summary) for a date range. */
export async function generateTimesheet(
  userId: string,
  opts: { from?: Date; to?: Date; title?: string } = {},
) {
  const rows = await listTimeEntries(userId, opts);
  const entries: TimeEntryInput[] = rows.map((r) => ({
    date: r.date,
    hours: r.hours,
    project: r.project,
    description: r.description,
  }));

  return {
    markdown: buildTimesheetMarkdown(entries, opts),
    csv: buildTimesheetCsv(entries),
    summary: summarizeTimesheet(entries),
  };
}
