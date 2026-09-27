import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listActivities } from "@/lib/activities";
import { getAggregatedSkills } from "@/lib/skills";
import { listResumes, getResumeStrength } from "@/lib/resume";
import { relativeTime, computeStreak } from "@/lib/format";
import { PlusCircleIcon } from "@/components/ui/icons";
import Ring from "@/components/ui/Ring";
import Locked from "@/components/ui/Locked";

const FREE_SKILL_CAP = 5;

export default async function DashboardPage() {
  const user = await requireUser();
  const [skills, activities, resumes] = await Promise.all([
    getAggregatedSkills(user.id),
    listActivities(user.id),
    listResumes(user.id),
  ]);
  const targetJob = resumes[0]?.targetJob ?? null;
  const strength = await getResumeStrength(user.id, targetJob);
  const streak = computeStreak(activities.map((a) => a.occurredAt));

  const now = new Date();
  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  const firstName = (user.name || "there").split(" ")[0];

  const visibleSkills = user.isPro ? skills.length : Math.min(skills.length, FREE_SKILL_CAP);
  const hiddenSkills = Math.max(0, skills.length - FREE_SKILL_CAP);

  return (
    <div className="relative space-y-5">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted">{dateLabel}</p>
          <h1 className="mt-0.5 font-serif text-2xl text-text">
            {greeting}, {firstName}
          </h1>
        </div>
        {user.isPro ? (
          <span className="pro-badge">Pro</span>
        ) : (
          <span className="pill bg-surface-2 text-muted">Free</span>
        )}
      </header>

      {!user.isPro && (
        <Link
          href="/profile#upgrade"
          className="flex items-center justify-between rounded-card tint-upgrade px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-upgrade">Upgrade to Pro</p>
            <p className="text-xs text-upgrade">
              Unlock {hiddenSkills || 19} more skills &amp; resume score
            </p>
          </div>
          <span className="text-upgrade">→</span>
        </Link>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-xl font-bold text-text">{visibleSkills}</div>
          <div className="text-[11px] text-muted">Skills</div>
          {!user.isPro && hiddenSkills > 0 && (
            <div className="mt-0.5 text-[10px] text-subtle">
              {skills.length} total · Pro
            </div>
          )}
        </div>
        <div className="card text-center">
          <div className="text-xl font-bold text-text">{activities.length}</div>
          <div className="text-[11px] text-muted">Activities</div>
        </div>
        {user.isPro ? (
          <div className="card text-center">
            <div className="text-xl font-bold text-text">{strength.score}%</div>
            <div className="text-[11px] text-muted">Score</div>
          </div>
        ) : (
          <Locked label="Pro">
            <div className="card text-center">
              <div className="text-xl font-bold text-text">82%</div>
              <div className="text-[11px] text-muted">Score</div>
            </div>
          </Locked>
        )}
      </div>

      {/* Resume Strength */}
      {user.isPro ? (
        <div className="card">
          <div className="flex items-center gap-4">
            <Ring value={strength.score} />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
                Resume Strength
              </p>
              <p className="text-sm font-medium text-text">
                {strength.targetJob || "Set a target job"}
              </p>
              <p className="mt-1 text-[11px] text-muted">
                Skills match · ATS · Keywords · Format
              </p>
            </div>
          </div>
        </div>
      ) : (
        <Locked label="Pro">
          <div className="card">
            <div className="flex items-center gap-4">
              <Ring value={82} />
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
                  Resume Strength
                </p>
                <p className="text-sm font-medium text-text">
                  Product Manager · Tech Startup
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Skills match · ATS · Keywords · Format
                </p>
              </div>
            </div>
          </div>
        </Locked>
      )}

      {user.isPro && (
        <div className="grid grid-cols-2 gap-3">
          <div className="card text-center">
            <div className="text-xl font-bold text-text">{skills.length}</div>
            <div className="text-[11px] text-muted">Skills</div>
          </div>
          <div className="card text-center">
            <div className="text-xl font-bold text-text">{streak}</div>
            <div className="text-[11px] text-muted">Day Streak</div>
          </div>
        </div>
      )}

      {/* Recent activities */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-text">Recent</h2>
          <Link href="/log" className="text-xs text-accent">
            See all
          </Link>
        </div>
        {activities.length === 0 ? (
          <div className="card text-center text-sm text-muted">
            No activities yet. Tap{" "}
            <span className="font-semibold text-accent">+</span> to log your
            first one.
          </div>
        ) : (
          <ul className="space-y-2">
            {activities.slice(0, user.isPro ? 5 : 2).map((a) => (
              <li key={a.id} className="card">
                <p className="text-sm font-medium text-text">{a.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {a.skills.slice(0, 2).map((s) => (
                    <span
                      key={s.skill.id}
                      className="pill bg-accent-bg text-accent"
                    >
                      {s.skill.name}
                    </span>
                  ))}
                  <span className="ml-auto text-[11px] text-subtle">
                    {relativeTime(a.occurredAt)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* FAB */}
      <Link
        href="/log"
        aria-label="Log activity"
        className="fixed bottom-20 right-5 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white shadow-frame"
      >
        <PlusCircleIcon className="h-6 w-6" />
      </Link>
    </div>
  );
}
