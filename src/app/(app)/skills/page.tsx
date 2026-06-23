import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getAggregatedSkills } from "@/lib/skills";

function stars(p: number) {
  const v = Math.max(1, Math.min(5, Math.round(p)));
  return "★".repeat(v) + "☆".repeat(5 - v);
}

export default async function SkillsPage() {
  const user = await requireUser();
  const skills = await getAggregatedSkills(user.id);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Skills</h1>
      <p className="mb-6 text-slate-600">
        Aggregated from the skills you tag on your activities.
      </p>

      {skills.length === 0 ? (
        <div className="card">
          <p className="text-sm text-slate-600">
            No skills yet. Add skills to your{" "}
            <Link href="/activities" className="text-brand-600">
              activities
            </Link>{" "}
            and they will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Skill</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Proficiency</th>
                <th className="px-4 py-2 font-medium">Activities</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.name} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {s.name}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {s.category ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-amber-500">
                    {stars(s.proficiency)}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {s.activityCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
