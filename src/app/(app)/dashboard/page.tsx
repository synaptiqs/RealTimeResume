import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listActivities } from "@/lib/activities";
import { getAggregatedSkills } from "@/lib/skills";
import { listResumes } from "@/lib/resume";
import { listTimeEntries } from "@/lib/timesheet";

export default async function DashboardPage() {
  const user = await requireUser();
  const [activities, skills, resumes, timeEntries] = await Promise.all([
    listActivities(user.id),
    getAggregatedSkills(user.id),
    listResumes(user.id),
    listTimeEntries(user.id),
  ]);

  const stats = [
    { label: "Activities", value: activities.length, href: "/activities" },
    { label: "Skills", value: skills.length, href: "/skills" },
    { label: "Resumes", value: resumes.length, href: "/resume" },
    { label: "Time entries", value: timeEntries.length, href: "/timesheet" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">
        Welcome{user.name ? `, ${user.name}` : ""} 👋
      </h1>
      <p className="mt-1 text-slate-600">
        Keep logging what you do — it all adds up to your resume.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card hover:shadow-md">
            <div className="text-3xl font-bold text-brand-600">{s.value}</div>
            <div className="mt-1 text-sm text-slate-600">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/activities" className="btn">
          Log an activity
        </Link>
        <Link href="/resume" className="btn-secondary">
          Generate a resume
        </Link>
      </div>

      {activities.length === 0 && (
        <div className="card mt-8">
          <h2 className="font-semibold text-slate-900">Get started</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">
            <li>Log your first activity.</li>
            <li>Add the skills it demonstrates (we suggest some).</li>
            <li>Generate your first resume.</li>
          </ol>
        </div>
      )}
    </div>
  );
}
