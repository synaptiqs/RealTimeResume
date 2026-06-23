// Rule-based skill suggestion. This is a DETERMINISTIC keyword dictionary, NOT
// AI/ML. It scans activity text for known keywords and proposes matching skills.
// Users accept or edit suggestions; nothing is added automatically.
//
// A future milestone may add an AI-backed implementation behind this same
// signature, gated on an API key. This version intentionally ships no LLM.

export interface SuggestedSkill {
  name: string;
  category: string;
}

interface Rule {
  skill: string;
  category: string;
  keywords: string[];
}

// Keep keywords lowercase. Matching is whole-word, case-insensitive.
const RULES: Rule[] = [
  { skill: "Leadership", category: "Leadership", keywords: ["led", "lead", "leading", "organized", "organised", "coordinated", "managed", "directed", "captain", "founded"] },
  { skill: "Team Coordination", category: "Leadership", keywords: ["team", "teamwork", "collaborated", "coordinated", "delegated"] },
  { skill: "Communication", category: "Communication", keywords: ["presented", "presentation", "wrote", "writing", "spoke", "speaking", "explained", "facilitated", "negotiated"] },
  { skill: "Project Management", category: "Management", keywords: ["planned", "planning", "scheduled", "deadline", "milestone", "roadmap", "budget"] },
  { skill: "Mentoring", category: "Leadership", keywords: ["mentored", "tutored", "coached", "taught", "trained", "onboarded"] },
  { skill: "Research", category: "Analytical", keywords: ["researched", "research", "analyzed", "analysed", "investigated", "studied", "surveyed"] },
  { skill: "Data Analysis", category: "Analytical", keywords: ["data", "spreadsheet", "excel", "statistics", "metrics", "dashboard", "sql"] },
  { skill: "Programming", category: "Technical", keywords: ["coded", "programmed", "developed", "built", "javascript", "typescript", "python", "java", "react", "api", "software"] },
  { skill: "Design", category: "Creative", keywords: ["designed", "design", "prototyped", "figma", "ux", "ui", "branding", "illustrated"] },
  { skill: "Writing", category: "Creative", keywords: ["wrote", "authored", "blogged", "edited", "copywriting", "article", "essay"] },
  { skill: "Event Planning", category: "Operations", keywords: ["event", "fundraiser", "conference", "workshop", "meetup", "hosted"] },
  { skill: "Customer Service", category: "Interpersonal", keywords: ["customer", "client", "support", "helped", "served", "assisted"] },
  { skill: "Problem Solving", category: "Analytical", keywords: ["solved", "debugged", "troubleshot", "fixed", "resolved", "optimized", "optimised"] },
  { skill: "Volunteering", category: "Community", keywords: ["volunteer", "volunteered", "charity", "nonprofit", "donated", "community"] },
  { skill: "Fitness & Discipline", category: "Personal", keywords: ["ran", "running", "marathon", "trained", "workout", "gym", "yoga", "cycling"] },
  { skill: "Foreign Language", category: "Communication", keywords: ["spanish", "french", "mandarin", "german", "bilingual", "translated"] },
];

function tokenize(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter(Boolean);
  return new Set(tokens);
}

/**
 * Suggest skills for a piece of activity text using the keyword dictionary.
 * Deterministic: the same input always yields the same output, sorted by name.
 */
export function suggestSkills(text: string): SuggestedSkill[] {
  if (!text || !text.trim()) return [];
  const tokens = tokenize(text);
  const matched = new Map<string, SuggestedSkill>();

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => tokens.has(kw))) {
      matched.set(rule.skill, { name: rule.skill, category: rule.category });
    }
  }

  return [...matched.values()].sort((a, b) => a.name.localeCompare(b.name));
}
