import { describe, it, expect } from "vitest";
import {
  STRUCTURE_SCHEMA,
  STRUCTURE_SYSTEM_PROMPT,
  buildStructureUserPrompt,
  renderStructurePlan,
  type StructurePlan,
} from "@/lib/ai/structure/template";

describe("buildStructureUserPrompt", () => {
  it("includes target role, skills, and exact activity titles", () => {
    const prompt = buildStructureUserPrompt({
      targetRole: "Data Analyst",
      goal: "career-change",
      skills: ["SQL", "Python"],
      activities: [
        { title: "Built sales dashboard", skills: ["SQL"] },
        { title: "Volunteer tutoring", skills: [] },
      ],
    });
    expect(prompt).toContain("Target role: Data Analyst");
    expect(prompt).toContain("career-change");
    expect(prompt).toContain("- SQL");
    expect(prompt).toContain("Built sales dashboard");
    expect(prompt).toContain("[skills: SQL]");
  });

  it("handles an empty profile", () => {
    const prompt = buildStructureUserPrompt({ skills: [], activities: [] });
    expect(prompt).toContain("(none specified)");
    expect(prompt).toContain("- (none)");
  });
});

describe("STRUCTURE_SYSTEM_PROMPT", () => {
  it("constrains the model to structuring, not rewriting", () => {
    expect(STRUCTURE_SYSTEM_PROMPT).toMatch(/MUST NOT/);
    expect(STRUCTURE_SYSTEM_PROMPT.toLowerCase()).toContain("rewrite");
    expect(STRUCTURE_SYSTEM_PROMPT.toLowerCase()).toContain("invent");
  });
});

describe("STRUCTURE_SCHEMA", () => {
  it("requires sections with headings, item titles, and notes", () => {
    const sectionProps =
      STRUCTURE_SCHEMA.properties.sections.items.properties;
    expect(Object.keys(sectionProps)).toEqual(["heading", "itemTitles", "note"]);
    expect(STRUCTURE_SCHEMA.properties.sections.items.additionalProperties).toBe(
      false,
    );
  });
});

describe("renderStructurePlan", () => {
  const plan: StructurePlan = {
    overallNote: "Lead with skills for a career change.",
    sections: [
      {
        heading: "Skills",
        itemTitles: [],
        note: "Front-load transferable skills.",
      },
      {
        heading: "Experience",
        itemTitles: ["Built sales dashboard", "Volunteer tutoring"],
        note: "Most relevant first.",
      },
    ],
  };

  it("renders numbered sections with items and notes", () => {
    const md = renderStructurePlan(plan);
    expect(md).toContain("# Suggested resume structure");
    expect(md).toContain("_Lead with skills for a career change._");
    expect(md).toContain("## 1. Skills");
    expect(md).toContain("> Front-load transferable skills.");
    expect(md).toContain("## 2. Experience");
    expect(md).toContain("- Built sales dashboard");
  });

  it("shows a placeholder for sections with no items", () => {
    const md = renderStructurePlan(plan);
    expect(md).toContain("_(no items assigned)_");
  });

  it("orders sections as provided", () => {
    const md = renderStructurePlan(plan);
    expect(md.indexOf("## 1. Skills")).toBeLessThan(
      md.indexOf("## 2. Experience"),
    );
  });
});
