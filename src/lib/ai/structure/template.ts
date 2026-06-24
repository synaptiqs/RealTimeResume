// Pure helpers for the NARROW resume-structuring AI feature: the prompt, the
// response schema, and a deterministic renderer for the returned plan.
//
// Scope boundary (important): this feature only reorganizes the user's EXISTING
// material — section order, grouping, and headings. It must not rewrite wording
// or invent achievements. Rewriting/tailoring is the paywalled "full AI
// assistance" feature (see src/lib/ai/enhance.ts).

export interface StructureProfileItem {
  title: string;
  skills: string[];
}

export interface StructureProfile {
  targetRole?: string | null;
  goal?: string | null;
  skills: string[];
  activities: StructureProfileItem[];
}

export interface StructureSection {
  heading: string;
  /** Titles of existing activities to place in this section, in order. */
  itemTitles: string[];
  /** One-line rationale for the section / its placement. */
  note: string;
}

export interface StructurePlan {
  sections: StructureSection[];
  overallNote: string;
}

/** JSON schema for the structured output the model must return. */
export const STRUCTURE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          heading: { type: "string" },
          itemTitles: { type: "array", items: { type: "string" } },
          note: { type: "string" },
        },
        required: ["heading", "itemTitles", "note"],
      },
    },
    overallNote: { type: "string" },
  },
  required: ["sections", "overallNote"],
} as const;

export const STRUCTURE_SYSTEM_PROMPT = [
  "You are a resume STRUCTURING assistant with a deliberately narrow job.",
  "You help organize a candidate's EXISTING material into a clear resume outline.",
  "",
  "You MUST:",
  "- Decide a sensible order and grouping of sections (e.g. Summary, Skills, Experience, Projects, Education/Volunteer).",
  "- Assign each existing activity to exactly one section, by its exact title.",
  "- Give a short, practical note explaining each section's purpose or order.",
  "- Tailor the ordering to the target role when one is given.",
  "",
  "You MUST NOT:",
  "- Rewrite, embellish, or paraphrase any activity wording.",
  "- Invent achievements, metrics, skills, jobs, or sections with no backing items.",
  "- Output any prose resume — only the structured plan.",
  "Rewriting and content generation are a separate paid feature; stay within structuring.",
].join("\n");

export function buildStructureUserPrompt(profile: StructureProfile): string {
  const lines: string[] = [];
  lines.push(
    `Target role: ${profile.targetRole?.trim() || "(none specified)"}`,
  );
  lines.push(`Candidate goal: ${profile.goal?.trim() || "(none specified)"}`);
  lines.push("");
  lines.push("Skills:");
  if (profile.skills.length === 0) lines.push("- (none)");
  else for (const s of profile.skills) lines.push(`- ${s}`);
  lines.push("");
  lines.push("Activities (use these exact titles):");
  if (profile.activities.length === 0) {
    lines.push("- (none)");
  } else {
    for (const a of profile.activities) {
      const skills = a.skills.length ? ` [skills: ${a.skills.join(", ")}]` : "";
      lines.push(`- ${a.title}${skills}`);
    }
  }
  lines.push("");
  lines.push(
    "Produce a structured plan grouping these existing items into ordered sections.",
  );
  return lines.join("\n");
}

/** Render a returned plan as a readable Markdown outline (deterministic). */
export function renderStructurePlan(plan: StructurePlan): string {
  const lines: string[] = ["# Suggested resume structure", ""];
  if (plan.overallNote.trim()) {
    lines.push(`_${plan.overallNote.trim()}_`, "");
  }
  plan.sections.forEach((section, i) => {
    lines.push(`## ${i + 1}. ${section.heading}`);
    if (section.note.trim()) lines.push(`> ${section.note.trim()}`);
    if (section.itemTitles.length === 0) {
      lines.push("- _(no items assigned)_");
    } else {
      for (const t of section.itemTitles) lines.push(`- ${t}`);
    }
    lines.push("");
  });
  return lines.join("\n").trimEnd() + "\n";
}
