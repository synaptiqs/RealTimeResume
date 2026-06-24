import { requireUser } from "@/lib/auth";
import { listResumes, getResumeStrength } from "@/lib/resume";
import { getAggregatedSkills } from "@/lib/skills";
import { proficiencyLabel, proficiencyPercent } from "@/lib/score";
import ResumeBuilder from "@/components/ResumeBuilder";

export default async function ResumePage() {
  const user = await requireUser();
  const [resumes, skills] = await Promise.all([
    listResumes(user.id),
    getAggregatedSkills(user.id),
  ]);
  const targetJob = resumes[0]?.targetJob ?? null;
  const strength = await getResumeStrength(user.id, targetJob);

  const topSkills = skills.slice(0, 3).map((s) => ({
    name: s.name,
    label: proficiencyLabel(s.proficiency),
    percent: proficiencyPercent(s.proficiency),
  }));

  return (
    <ResumeBuilder
      isPro={user.isPro}
      initialResumes={resumes.map((r) => ({
        id: r.id,
        title: r.title,
        targetJob: r.targetJob,
        content: r.content,
        score: r.score,
        createdAt: r.createdAt.toISOString(),
      }))}
      topSkills={topSkills}
      strength={strength}
    />
  );
}
