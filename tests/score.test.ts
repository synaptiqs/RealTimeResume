import { describe, it, expect } from "vitest";
import {
  computeResumeScore,
  proficiencyLabel,
  proficiencyPercent,
} from "@/lib/score";
import { extractionsThisMonth } from "@/lib/quota";
import { relativeTime, computeStreak } from "@/lib/format";

describe("computeResumeScore", () => {
  const skills = [
    { name: "Product Management", proficiency: 5, activityCount: 4 },
    { name: "Leadership", proficiency: 4, activityCount: 3 },
    { name: "Data Analysis", proficiency: 3, activityCount: 2 },
  ];

  it("returns a 0-100 score and four metrics", () => {
    const r = computeResumeScore({
      targetJob: "Product Manager",
      skills,
      activityCount: 9,
    });
    for (const v of [r.score, r.skillsMatch, r.ats, r.keywords, r.format]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
  });

  it("is deterministic", () => {
    const input = { targetJob: "Manager", skills, activityCount: 5 };
    expect(computeResumeScore(input)).toEqual(computeResumeScore(input));
  });

  it("rewards target-job keyword overlap", () => {
    const matched = computeResumeScore({
      targetJob: "Product Management Lead",
      skills,
      activityCount: 5,
    });
    const unmatched = computeResumeScore({
      targetJob: "Underwater Welding",
      skills,
      activityCount: 5,
    });
    expect(matched.keywords).toBeGreaterThan(unmatched.keywords);
  });

  it("scores an empty profile low", () => {
    const r = computeResumeScore({ targetJob: null, skills: [], activityCount: 0 });
    expect(r.score).toBeLessThan(30);
  });
});

describe("proficiency mapping", () => {
  it("labels by band", () => {
    expect(proficiencyLabel(5)).toBe("Expert");
    expect(proficiencyLabel(4)).toBe("Advanced");
    expect(proficiencyLabel(2)).toBe("Proficient");
  });
  it("converts to a percent", () => {
    expect(proficiencyPercent(5)).toBe(100);
    expect(proficiencyPercent(3)).toBe(60);
  });
});

describe("extractionsThisMonth", () => {
  it("counts only dates in the current month", () => {
    const now = new Date("2026-06-15T12:00:00Z");
    const dates = [
      new Date("2026-06-01T00:00:00Z"),
      new Date("2026-06-14T00:00:00Z"),
      new Date("2026-05-31T00:00:00Z"), // previous month
      new Date("2025-06-10T00:00:00Z"), // previous year
    ];
    expect(extractionsThisMonth(dates, now)).toBe(2);
  });
});

describe("format helpers", () => {
  it("formats relative time", () => {
    const now = new Date("2026-06-15T12:00:00Z");
    expect(relativeTime(new Date("2026-06-15T10:00:00Z"), now)).toBe("2h ago");
    expect(relativeTime(new Date("2026-06-14T12:00:00Z"), now)).toBe("Yesterday");
  });

  it("computes a consecutive-day streak", () => {
    const now = new Date("2026-06-15T20:00:00Z");
    const dates = [
      new Date("2026-06-15T09:00:00Z"),
      new Date("2026-06-14T09:00:00Z"),
      new Date("2026-06-13T09:00:00Z"),
      new Date("2026-06-10T09:00:00Z"), // gap breaks the streak
    ];
    expect(computeStreak(dates, now)).toBe(3);
  });

  it("returns 0 streak with no activity", () => {
    expect(computeStreak([], new Date())).toBe(0);
  });
});
