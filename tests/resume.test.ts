import { describe, it, expect } from "vitest";
import {
  buildResumeMarkdown,
  defaultResumeTitle,
} from "@/lib/resume/template";

describe("buildResumeMarkdown", () => {
  it("includes name, summary, skills, and experience sections", () => {
    const md = buildResumeMarkdown({
      name: "Alex Doe",
      goal: "recent-grad",
      targetRole: "Product Analyst",
      skills: [
        { name: "Leadership", category: "Leadership", proficiency: 5, activityCount: 2 },
        { name: "Research", category: "Analytical", proficiency: 3, activityCount: 1 },
      ],
      activities: [
        {
          title: "Led a fundraiser",
          description: "Raised $5000 for charity.",
          occurredAt: new Date("2025-03-15"),
          skills: ["Leadership"],
        },
      ],
    });

    expect(md).toContain("# Alex Doe");
    expect(md).toContain("**Target role:** Product Analyst");
    expect(md).toContain("## Summary");
    expect(md).toContain("## Skills");
    expect(md).toContain("Leadership");
    expect(md).toContain("## Experience & Activities");
    expect(md).toContain("Led a fundraiser");
    expect(md).toContain("Raised $5000 for charity.");
  });

  it("sorts skills by proficiency descending", () => {
    const md = buildResumeMarkdown({
      name: "X",
      goal: null,
      skills: [
        { name: "Low", category: null, proficiency: 1, activityCount: 1 },
        { name: "High", category: null, proficiency: 5, activityCount: 1 },
      ],
      activities: [],
    });
    expect(md.indexOf("High")).toBeLessThan(md.indexOf("Low"));
  });

  it("sorts experience most-recent first", () => {
    const md = buildResumeMarkdown({
      name: "X",
      goal: null,
      skills: [],
      activities: [
        { title: "Older", description: "", occurredAt: new Date("2024-01-01"), skills: [] },
        { title: "Newer", description: "", occurredAt: new Date("2025-01-01"), skills: [] },
      ],
    });
    expect(md.indexOf("Newer")).toBeLessThan(md.indexOf("Older"));
  });

  it("falls back to a placeholder name and empty-section hints", () => {
    const md = buildResumeMarkdown({
      name: null,
      goal: null,
      skills: [],
      activities: [],
    });
    expect(md).toContain("# Your Name");
    expect(md).toContain("_Add skills");
    expect(md).toContain("_Log activities");
  });

  it("is deterministic", () => {
    const input = {
      name: "Sam",
      goal: "level-up",
      skills: [{ name: "A", category: null, proficiency: 3, activityCount: 1 }],
      activities: [
        { title: "T", description: "d", occurredAt: new Date("2025-02-02"), skills: ["A"] },
      ],
    };
    expect(buildResumeMarkdown(input)).toEqual(buildResumeMarkdown(input));
  });
});

describe("defaultResumeTitle", () => {
  it("uses the target role when present", () => {
    expect(defaultResumeTitle("Engineer")).toBe("Resume — Engineer");
  });
  it("falls back to a generic title", () => {
    expect(defaultResumeTitle()).toBe("Resume");
    expect(defaultResumeTitle("  ")).toBe("Resume");
  });
});
