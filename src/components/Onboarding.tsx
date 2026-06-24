"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const PATHS = [
  { value: "recent-grad", label: "Recent Graduate" },
  { value: "career-change", label: "Career Changer" },
  { value: "returning-parent", label: "Return to Work" },
  { value: "level-up", label: "Freelancer / Pro" },
];

const FREE_INCLUDES = [
  { text: "Up to 5 skill extractions/month", pro: false },
  { text: "1 resume template", pro: false },
  { text: "Voice logging", pro: true },
  { text: "Resume score & ATS analysis", pro: true },
];

const PRO_INCLUDES = [
  "Unlimited skill extractions",
  "Unlimited resume versions",
  "Voice logging + AI journaling",
  "Resume score & ATS analysis",
];

export default function Onboarding({
  isPro,
  initialGoal,
}: {
  isPro: boolean;
  initialGoal: string | null;
}) {
  const router = useRouter();
  const [goal, setGoal] = useState(initialGoal || "recent-grad");
  const [busy, setBusy] = useState(false);

  async function start() {
    setBusy(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      router.push("/dashboard");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-app px-6 py-12">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <h1 className="font-serif text-3xl text-accent">RealTimeResume</h1>
          {isPro && <span className="pro-badge">Pro</span>}
        </div>
        <p className="mt-3 font-serif text-xl text-text">
          Your life is your resume.
        </p>
        <p className="mt-1 text-sm text-muted">
          AI discovers the professional skills in everything you do.
        </p>
      </div>

      <div className="card mt-8">
        <h2 className="text-[13px] font-semibold text-text">
          {isPro ? "Pro Plan includes everything:" : "Free Plan includes:"}
        </h2>
        <ul className="mt-3 space-y-2 text-sm">
          {isPro
            ? PRO_INCLUDES.map((t) => (
                <li key={t} className="flex items-center gap-2 text-text-2">
                  <span className="text-accent">✓</span> {t}
                </li>
              ))
            : FREE_INCLUDES.map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-2 text-text-2"
                >
                  {item.pro ? (
                    <span className="text-disabled">✕</span>
                  ) : (
                    <span className="text-accent">✓</span>
                  )}
                  <span className={item.pro ? "text-disabled line-through" : ""}>
                    {item.text}
                  </span>
                  {item.pro && (
                    <span className="pro-badge ml-auto">Pro</span>
                  )}
                </li>
              ))}
        </ul>
        {!isPro && (
          <a
            href="/profile#upgrade"
            className="mt-3 inline-flex text-sm font-semibold text-upgrade"
          >
            Want everything? Upgrade to Pro →
          </a>
        )}
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-[13px] font-semibold text-text">
          Choose your path
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {PATHS.map((p) => (
            <button
              key={p.value}
              onClick={() => setGoal(p.value)}
              className={`rounded-card border px-3 py-4 text-sm font-medium transition-colors ${
                goal === p.value
                  ? "border-accent bg-accent-bg text-accent"
                  : "border-border bg-surface text-text-2"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={start} disabled={busy} className="btn mt-8 w-full">
        {busy ? "Starting…" : isPro ? "Get Started with Pro" : "Continue with Free"}
      </button>
    </div>
  );
}
