// Deterministic, template-based resume generation. No AI/LLM is used — this
// assembles the user's stored activities and skills into ATS-friendly Markdown.

export interface ResumeSkillInput {
  name: string;
  category?: string | null;
  proficiency: number; // 1..5, best across activities
  activityCount: number;
}

export interface ResumeActivityInput {
  title: string;
  description: string;
  occurredAt: Date;
  skills: string[];
}

export interface ResumeInput {
  name?: string | null;
  goal?: string | null;
  targetRole?: string | null;
  skills: ResumeSkillInput[];
  activities: ResumeActivityInput[];
}

const GOAL_SUMMARIES: Record<string, string> = {
  "recent-grad":
    "Motivated recent graduate translating academic, project, and volunteer experience into professional impact.",
  "career-change":
    "Career changer applying transferable skills from diverse experience to a new field.",
  "returning-parent":
    "Returning professional bringing organizational, planning, and interpersonal strengths back to the workforce.",
  "level-up":
    "Driven professional consolidating a track record of accomplishments to take on greater responsibility.",
};

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function stars(proficiency: number): string {
  const p = Math.max(1, Math.min(5, Math.round(proficiency)));
  return "★".repeat(p) + "☆".repeat(5 - p);
}

/**
 * Build an ATS-friendly Markdown resume from the provided profile data.
 * Pure and deterministic given its input.
 */
export function buildResumeMarkdown(input: ResumeInput): string {
  const name = input.name?.trim() || "Your Name";
  const lines: string[] = [];

  lines.push(`# ${name}`);
  if (input.targetRole?.trim()) {
    lines.push(`**Target role:** ${input.targetRole.trim()}`);
  }
  lines.push("");

  // Summary
  lines.push("## Summary");
  const summary =
    (input.goal && GOAL_SUMMARIES[input.goal]) ||
    "Professional with a growing record of hands-on experience and demonstrated skills.";
  lines.push(summary);
  lines.push("");

  // Skills (sorted by proficiency desc, then by reach, then name)
  lines.push("## Skills");
  if (input.skills.length === 0) {
    lines.push("_Add skills to your activities to populate this section._");
  } else {
    const sorted = [...input.skills].sort(
      (a, b) =>
        b.proficiency - a.proficiency ||
        b.activityCount - a.activityCount ||
        a.name.localeCompare(b.name),
    );
    for (const s of sorted) {
      const category = s.category ? ` _(${s.category})_` : "";
      lines.push(`- **${s.name}**${category} — ${stars(s.proficiency)}`);
    }
  }
  lines.push("");

  // Experience (most recent first)
  lines.push("## Experience & Activities");
  if (input.activities.length === 0) {
    lines.push("_Log activities to populate this section._");
  } else {
    const sorted = [...input.activities].sort(
      (a, b) => b.occurredAt.getTime() - a.occurredAt.getTime(),
    );
    for (const a of sorted) {
      lines.push(`### ${a.title} — ${formatMonthYear(a.occurredAt)}`);
      const desc = a.description.trim();
      if (desc) lines.push(desc);
      if (a.skills.length > 0) {
        lines.push("");
        lines.push(`_Skills: ${a.skills.join(", ")}_`);
      }
      lines.push("");
    }
  }

  return lines.join("\n").trimEnd() + "\n";
}

export function defaultResumeTitle(targetRole?: string | null): string {
  const role = targetRole?.trim();
  return role ? `Resume — ${role}` : "Resume";
}
