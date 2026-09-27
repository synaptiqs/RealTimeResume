import { describe, it, expect } from "vitest";
import {
  buildTimesheetCsv,
  buildTimesheetMarkdown,
  summarizeTimesheet,
} from "@/lib/timesheet/template";

const entries = [
  { date: new Date("2025-03-03"), hours: 2, project: "Acme", description: "Build feature" },
  { date: new Date("2025-03-01"), hours: 1.5, project: "Acme", description: "Planning" },
  { date: new Date("2025-03-02"), hours: 3, project: null, description: "Admin, email & calls" },
];

describe("summarizeTimesheet", () => {
  it("totals hours and groups by project", () => {
    const s = summarizeTimesheet(entries);
    expect(s.totalHours).toBe(6.5);
    expect(s.entryCount).toBe(3);
    const acme = s.byProject.find((p) => p.project === "Acme")!;
    expect(acme.hours).toBe(3.5);
    expect(s.byProject.find((p) => p.project === "General")!.hours).toBe(3);
  });

  it("sorts projects by hours descending", () => {
    const s = summarizeTimesheet(entries);
    expect(s.byProject[0].project).toBe("Acme");
  });

  it("handles an empty list", () => {
    expect(summarizeTimesheet([])).toEqual({
      totalHours: 0,
      byProject: [],
      entryCount: 0,
    });
  });
});

describe("buildTimesheetMarkdown", () => {
  it("renders a table sorted chronologically with totals", () => {
    const md = buildTimesheetMarkdown(entries, {
      from: new Date("2025-03-01"),
      to: new Date("2025-03-31"),
    });
    expect(md).toContain("# Timesheet");
    expect(md).toContain("**Total hours:** 6.5");
    expect(md).toContain("| Date | Project | Hours | Description |");
    // chronological order: 03-01 before 03-02 before 03-03
    expect(md.indexOf("2025-03-01")).toBeLessThan(md.indexOf("2025-03-02"));
    expect(md.indexOf("2025-03-02")).toBeLessThan(md.indexOf("2025-03-03"));
    expect(md).toContain("## By project");
  });

  it("escapes pipe characters in descriptions", () => {
    const md = buildTimesheetMarkdown([
      { date: new Date("2025-03-01"), hours: 1, project: null, description: "a | b" },
    ]);
    expect(md).toContain("a \\| b");
  });

  it("shows an empty hint when there are no entries", () => {
    expect(buildTimesheetMarkdown([])).toContain("_No time entries");
  });
});

describe("buildTimesheetCsv", () => {
  it("produces a header and one row per entry", () => {
    const csv = buildTimesheetCsv(entries);
    const rows = csv.trim().split("\r\n");
    expect(rows[0]).toBe("Date,Project,Hours,Description");
    expect(rows).toHaveLength(4);
  });

  it("quotes fields containing commas", () => {
    const csv = buildTimesheetCsv([
      { date: new Date("2025-03-02"), hours: 3, project: null, description: "Admin, email & calls" },
    ]);
    expect(csv).toContain('"Admin, email & calls"');
  });
});
