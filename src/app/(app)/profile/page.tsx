import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAggregatedSkills } from "@/lib/skills";
import { ChevronRightIcon } from "@/components/ui/icons";
import ThemeToggle from "@/components/ThemeToggle";
import PlanButton from "@/components/PlanButton";
import SignOutButton from "@/components/SignOutButton";

const FREE_SKILL_CAP = 5;

function initials(name: string | null, email: string): string {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]!.toUpperCase())
      .join("");
  }
  return email[0]!.toUpperCase();
}

function Row({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-text-2">{label}</span>
      <ChevronRightIcon className="text-subtle" />
    </div>
  );
}

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="label mb-1.5">{title}</p>
      <div className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
        {children}
      </div>
    </section>
  );
}

export default async function ProfilePage() {
  const user = await requireUser();
  const [skills, activityCount, resumeCount] = await Promise.all([
    getAggregatedSkills(user.id),
    prisma.activity.count({ where: { userId: user.id } }),
    prisma.resumeVersion.count({ where: { userId: user.id } }),
  ]);

  const visibleSkills = user.isPro
    ? skills.length
    : Math.min(skills.length, FREE_SKILL_CAP);

  return (
    <div className="space-y-5">
      {/* Identity */}
      <div className="flex items-center gap-3">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold ${
            user.isPro
              ? "bg-accent text-white"
              : "bg-surface-2 text-muted"
          }`}
        >
          {initials(user.name, user.email)}
        </div>
        <div>
          <p className="font-serif text-xl text-text">
            {user.name || "Your name"}
          </p>
          <p className="text-sm text-muted">{user.email}</p>
          <span
            className={`mt-1 inline-flex ${
              user.isPro ? "pro-badge" : "pill bg-surface-2 text-muted"
            }`}
          >
            {user.isPro ? "Pro Plan" : "Free Plan"}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <div className="text-xl font-bold text-text">{visibleSkills}</div>
          <div className="text-[11px] text-muted">Skills</div>
          {!user.isPro && skills.length > FREE_SKILL_CAP && (
            <div className="text-[10px] text-subtle">{skills.length} total</div>
          )}
        </div>
        <div className="card text-center">
          <div className="text-xl font-bold text-text">{activityCount}</div>
          <div className="text-[11px] text-muted">Activities</div>
        </div>
        <div className="card text-center">
          <div className="text-xl font-bold text-text">{resumeCount}</div>
          <div className="text-[11px] text-muted">Resumes</div>
        </div>
      </div>

      {/* Upgrade (free) */}
      {!user.isPro && (
        <div id="upgrade" className="rounded-card tint-upgrade p-4">
          <p className="text-sm font-semibold text-upgrade">Upgrade to Pro</p>
          <ul className="mt-2 space-y-1 text-xs text-upgrade">
            <li>• Unlock all {Math.max(skills.length, 24)} skills &amp; full score</li>
            <li>• Unlimited resumes &amp; generations</li>
            <li>• Voice logging + ATS analysis</li>
          </ul>
          <PlanButton action="upgrade" className="btn-upgrade mt-3 w-full">
            Upgrade Now
          </PlanButton>
          <p className="mt-1.5 text-center text-[10px] text-upgrade">
            Demo upgrade — no payment required yet.
          </p>
        </div>
      )}

      {/* Theme */}
      <section className="flex items-center justify-between rounded-card border border-border bg-surface px-4 py-3">
        <span className="text-sm text-text-2">Theme</span>
        <ThemeToggle />
      </section>

      <Group title="Account">
        <Row label="Edit Profile" />
        <Row label="Email Preferences" />
      </Group>

      <Group title="Privacy">
        <Row label="Data & Privacy" />
        <Row label="Export My Data" />
      </Group>

      {/* Tools (Journal & Timesheet still available off the main tabs) */}
      <Group title="Tools">
        <Link href="/journal">
          <Row label="Journal" />
        </Link>
        <Link href="/timesheet">
          <Row label="Timesheet" />
        </Link>
      </Group>

      {user.isPro && (
        <Group title="Subscription">
          <Row label="Manage Pro Plan" />
          <Row label="Billing & Receipts" />
          <PlanButton
            action="downgrade"
            className="w-full px-4 py-3 text-left text-sm text-muted"
          >
            Switch to Free (demo)
          </PlanButton>
        </Group>
      )}

      <SignOutButton />
    </div>
  );
}
