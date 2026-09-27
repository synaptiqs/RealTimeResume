import { describe, it, expect } from "vitest";
import { suggestSkills } from "@/lib/skills/suggest";

describe("suggestSkills (deterministic keyword dictionary)", () => {
  it("returns nothing for empty input", () => {
    expect(suggestSkills("")).toEqual([]);
    expect(suggestSkills("   ")).toEqual([]);
  });

  it("matches leadership-style verbs", () => {
    const names = suggestSkills("I led and organized the team").map(
      (s) => s.name,
    );
    expect(names).toContain("Leadership");
    expect(names).toContain("Team Coordination");
  });

  it("matches programming keywords", () => {
    const names = suggestSkills(
      "Built a React app in TypeScript with an API",
    ).map((s) => s.name);
    expect(names).toContain("Programming");
  });

  it("is case-insensitive and whole-word", () => {
    const names = suggestSkills("VOLUNTEERED at a charity").map((s) => s.name);
    expect(names).toContain("Volunteering");
    // "ledger" should not trigger "Leadership" (whole-word matching)
    expect(suggestSkills("balanced the ledger").map((s) => s.name)).not.toContain(
      "Leadership",
    );
  });

  it("is deterministic and sorted by name", () => {
    const a = suggestSkills("designed and presented a research project");
    const b = suggestSkills("designed and presented a research project");
    expect(a).toEqual(b);
    const names = a.map((s) => s.name);
    expect(names).toEqual([...names].sort((x, y) => x.localeCompare(y)));
  });

  it("returns each skill at most once", () => {
    const names = suggestSkills("led and led and led again").map((s) => s.name);
    expect(names.filter((n) => n === "Leadership")).toHaveLength(1);
  });
});
