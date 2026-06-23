// Deterministic timesheet generation. No AI — aggregates time entries into a
// summary plus Markdown and CSV exports.

export interface TimeEntryInput {
  date: Date;
  hours: number;
  project?: string | null;
  description: string;
}

export interface ProjectTotal {
  project: string;
  hours: number;
}

export interface TimesheetSummary {
  totalHours: number;
  byProject: ProjectTotal[];
  entryCount: number;
}

const NO_PROJECT = "General";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Summarize entries: total hours and per-project totals (sorted, deterministic). */
export function summarizeTimesheet(entries: TimeEntryInput[]): TimesheetSummary {
  const totals = new Map<string, number>();
  let totalHours = 0;
  for (const e of entries) {
    const project = e.project?.trim() || NO_PROJECT;
    totals.set(project, (totals.get(project) ?? 0) + e.hours);
    totalHours += e.hours;
  }
  const byProject = [...totals.entries()]
    .map(([project, hours]) => ({ project, hours: round2(hours) }))
    .sort((a, b) => b.hours - a.hours || a.project.localeCompare(b.project));

  return {
    totalHours: round2(totalHours),
    byProject,
    entryCount: entries.length,
  };
}

function sortEntries(entries: TimeEntryInput[]): TimeEntryInput[] {
  return [...entries].sort(
    (a, b) =>
      a.date.getTime() - b.date.getTime() ||
      (a.project ?? "").localeCompare(b.project ?? ""),
  );
}

/** Build a Markdown timesheet (chronological, with a totals summary). */
export function buildTimesheetMarkdown(
  entries: TimeEntryInput[],
  opts: { title?: string; from?: Date; to?: Date } = {},
): string {
  const lines: string[] = [];
  lines.push(`# ${opts.title?.trim() || "Timesheet"}`);
  if (opts.from && opts.to) {
    lines.push(`**Period:** ${isoDate(opts.from)} – ${isoDate(opts.to)}`);
  }
  lines.push("");

  const summary = summarizeTimesheet(entries);
  lines.push(`**Total hours:** ${summary.totalHours}`);
  lines.push("");

  lines.push("## Entries");
  if (entries.length === 0) {
    lines.push("_No time entries in this period._");
  } else {
    lines.push("| Date | Project | Hours | Description |");
    lines.push("| --- | --- | --- | --- |");
    for (const e of sortEntries(entries)) {
      const project = e.project?.trim() || NO_PROJECT;
      const desc = e.description.replace(/\|/g, "\\|").replace(/\n/g, " ");
      lines.push(`| ${isoDate(e.date)} | ${project} | ${round2(e.hours)} | ${desc} |`);
    }
  }
  lines.push("");

  if (summary.byProject.length > 0) {
    lines.push("## By project");
    for (const p of summary.byProject) {
      lines.push(`- **${p.project}** — ${p.hours} h`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

function csvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** Build a CSV timesheet (RFC-4180-ish, chronological). */
export function buildTimesheetCsv(entries: TimeEntryInput[]): string {
  const rows: string[] = ["Date,Project,Hours,Description"];
  for (const e of sortEntries(entries)) {
    const project = e.project?.trim() || NO_PROJECT;
    rows.push(
      [
        isoDate(e.date),
        csvField(project),
        String(round2(e.hours)),
        csvField(e.description),
      ].join(","),
    );
  }
  return rows.join("\r\n") + "\r\n";
}
