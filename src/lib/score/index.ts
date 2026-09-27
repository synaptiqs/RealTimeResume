// Deterministic Resume Strength scoring (PRD §4). The score is PER target job
// and decomposes into four metrics: Skills match, ATS, Keywords, Format.
// Pure and unit-testable — no AI, no database.

export interface ScoreSkill {
  name: string;
  proficiency: number; // 1..5
  activityCount: number;
}

export interface ScoreInput {
  targetJob?: string | null;
  skills: ScoreSkill[];
  activityCount: number;
}

export interface ScoreMetrics {
  skillsMatch: number;
  ats: number;
  keywords: number;
  format: number;
}

export interface ResumeScore extends ScoreMetrics {
  score: number; // 0..100 overall
}

const STOP = new Set([
  "the", "a", "an", "and", "or", "for", "to", "of", "in", "at", "on", "with",
]);

function tokenize(text: string | null | undefined): Set<string> {
  if (!text) return new Set();
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9+]+/)
      .filter((t) => t.length > 1 && !STOP.has(t)),
  );
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Compute the Resume Strength score and its component metrics. */
export function computeResumeScore(input: ScoreInput): ResumeScore {
  const { skills, activityCount } = input;
  const jobTokens = tokenize(input.targetJob);
  const hasJob = jobTokens.size > 0;

  const matched = skills.filter((s) =>
    [...tokenize(s.name)].some((t) => jobTokens.has(t)),
  ).length;

  const avgProf =
    skills.length === 0
      ? 0
      : skills.reduce((sum, s) => sum + s.proficiency, 0) /
        (skills.length * 5); // 0..1
  const breadth = Math.min(skills.length / 12, 1); // 0..1
  const match = !hasJob
    ? 0.6
    : skills.length === 0
      ? 0
      : matched / skills.length;

  const skillsMatch = clamp(100 * (0.5 * match + 0.3 * breadth + 0.2 * avgProf));

  const keywords = hasJob
    ? clamp(100 * Math.min(matched / jobTokens.size, 1))
    : clamp(100 * breadth * 0.7);

  const ats = clamp(
    100 *
      ((skills.length > 0 ? 0.4 : 0) +
        (activityCount > 0 ? 0.4 : 0) +
        (hasJob ? 0.2 : 0)),
  );

  const format =
    activityCount > 0 ? clamp(60 + Math.min(activityCount, 8) * 5) : 30;

  const score = clamp(
    0.4 * skillsMatch + 0.25 * ats + 0.2 * keywords + 0.15 * format,
  );

  return { score, skillsMatch, ats, keywords, format };
}

/** Map a 1..5 proficiency to the PRD's labels. */
export function proficiencyLabel(n: number): "Proficient" | "Advanced" | "Expert" {
  if (n >= 5) return "Expert";
  if (n >= 3) return "Advanced";
  return "Proficient";
}

/** Proficiency as a 0..100 bar percentage. */
export function proficiencyPercent(n: number): number {
  return Math.max(0, Math.min(100, Math.round((n / 5) * 100)));
}
