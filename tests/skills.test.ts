import { describe, it, expect } from "vitest";
import { aggregateActivitySkills } from "@/lib/skills";

describe("aggregateActivitySkills", () => {
  it("collapses duplicate skills, keeping the best proficiency and counting activities", () => {
    const result = aggregateActivitySkills([
      { name: "Leadership", category: "Leadership", proficiency: 3 },
      { name: "Leadership", category: null, proficiency: 5 },
      { name: "Research", category: "Analytical", proficiency: 2 },
    ]);

    const leadership = result.find((s) => s.name === "Leadership")!;
    expect(leadership.proficiency).toBe(5);
    expect(leadership.activityCount).toBe(2);
    expect(leadership.category).toBe("Leadership"); // backfilled from first non-null

    const research = result.find((s) => s.name === "Research")!;
    expect(research.activityCount).toBe(1);
  });

  it("sorts by proficiency then activity count then name", () => {
    const result = aggregateActivitySkills([
      { name: "B", category: null, proficiency: 3 },
      { name: "A", category: null, proficiency: 3 },
      { name: "C", category: null, proficiency: 5 },
    ]);
    expect(result.map((s) => s.name)).toEqual(["C", "A", "B"]);
  });

  it("returns an empty array for no input", () => {
    expect(aggregateActivitySkills([])).toEqual([]);
  });
});
