"use client";

import { useState } from "react";
import Ring from "@/components/ui/Ring";
import Locked from "@/components/ui/Locked";

interface Resume {
  id: string;
  title: string;
  targetJob: string | null;
  content: string;
  score: number | null;
  createdAt: string;
}
interface TopSkill {
  name: string;
  label: string;
  percent: number;
}
interface Strength {
  score: number;
  skillsMatch: number;
  ats: number;
  keywords: number;
  format: number;
  targetJob: string | null;
}

export default function ResumeBuilder({
  isPro,
  initialResumes,
  topSkills,
  strength,
}: {
  isPro: boolean;
  initialResumes: Resume[];
  topSkills: TopSkill[];
  strength: Strength;
}) {
  const [resumes, setResumes] = useState(initialResumes);
  const [targetJob, setTargetJob] = useState(
    strength.targetJob || initialResumes[0]?.targetJob || "",
  );
  const [open, setOpen] = useState<Resume | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiResult, setAiResult] = useState<{ title: string; md: string } | null>(
    null,
  );

  async function reload() {
    const res = await fetch("/api/resume");
    if (res.ok) setResumes((await res.json()).resumes);
  }

  async function generate() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetJob ? { targetJob } : {}),
      });
      const data = await res.json();
      if (res.ok) {
        await reload();
        setOpen(data.resume);
      } else if (res.status === 402) {
        setNotice(`🔒 ${data.error}`);
      } else setNotice(data.error ?? "Could not generate.");
    } finally {
      setBusy(false);
    }
  }

  async function aiStructure() {
    setAiBusy(true);
    setNotice(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetJob ? { targetRole: targetJob } : {}),
      });
      const data = await res.json();
      if (res.ok) setAiResult({ title: "AI structure suggestion", md: data.markdown });
      else setNotice(data.error ?? "AI unavailable.");
    } finally {
      setAiBusy(false);
    }
  }

  async function aiEnhance() {
    if (!open) {
      setNotice("Open a resume first to enhance it.");
      return;
    }
    setAiBusy(true);
    setNotice(null);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: open.id }),
      });
      const data = await res.json();
      if (res.ok) setAiResult({ title: "AI-enhanced resume", md: data.markdown });
      else if (res.status === 402) setNotice(`🔒 ${data.error}`);
      else setNotice(data.error ?? "AI unavailable.");
    } finally {
      setAiBusy(false);
    }
  }

  const atLimit = !isPro && resumes.length >= 1;

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-text">Resumes</h1>
        {!isPro && (
          <span className="pill bg-surface-2 text-muted">
            {resumes.length} of 1 free
          </span>
        )}
      </header>

      {/* Resume Strength */}
      {isPro ? (
        <div className="card">
          <div className="flex items-center gap-4">
            <Ring value={strength.score} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">
                Resume Strength
              </p>
              <p className="truncate text-sm font-medium text-text">
                {strength.targetJob || targetJob || "Set a target job"}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted">
                <span>Skills match {strength.skillsMatch}</span>
                <span>ATS {strength.ats}</span>
                <span>Keywords {strength.keywords}</span>
                <span>Format {strength.format}</span>
              </div>
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
                  Score locked on Free plan
                </p>
                <p className="mt-1 text-[11px] text-muted">Upgrade to unlock</p>
              </div>
            </div>
          </div>
        </Locked>
      )}

      {/* Target job */}
      <div>
        <label className="label" htmlFor="target">
          Target Job
        </label>
        <input
          id="target"
          className="input"
          value={targetJob}
          onChange={(e) => setTargetJob(e.target.value)}
          placeholder="Product Manager · Tech Startup"
        />
      </div>

      {/* Top skills (Pro) */}
      {isPro && topSkills.length > 0 && (
        <div className="card">
          <p className="mb-3 text-[13px] font-semibold text-text">Top Skills</p>
          <ul className="space-y-2.5">
            {topSkills.map((s) => (
              <li key={s.name}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-text-2">{s.name}</span>
                  <span className="text-subtle">{s.label}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${s.percent}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Saved resumes */}
      <section>
        <p className="mb-2 text-[13px] font-semibold text-text">Saved Resumes</p>
        <ul className="space-y-2">
          {resumes.map((r) => (
            <li key={r.id}>
              <button
                onClick={() => setOpen(r)}
                className="flex w-full items-center justify-between rounded-card border border-border bg-surface px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-text">{r.title}</p>
                  <p className="text-[11px] text-subtle">
                    {new Date(r.createdAt).toLocaleDateString()}
                    {r.score != null && isPro ? ` · Score ${r.score}` : ""}
                  </p>
                </div>
                <span className="text-xs text-accent">View</span>
              </button>
            </li>
          ))}
          {atLimit && (
            <Locked label="Pro">
              <div className="rounded-card border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted">
                + New Resume
              </div>
            </Locked>
          )}
        </ul>
      </section>

      {notice && <p className="text-sm text-upgrade">{notice}</p>}

      <div className="space-y-2">
        <button
          onClick={generate}
          disabled={busy || atLimit}
          className="btn w-full"
        >
          {busy
            ? "Generating…"
            : resumes.length === 0
              ? "Generate Resume"
              : "Generate New Version"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={aiStructure}
            disabled={aiBusy}
            className="btn-secondary flex-1"
          >
            ✨ Suggest structure
          </button>
          <button
            onClick={aiEnhance}
            disabled={aiBusy}
            className="btn-secondary flex-1"
          >
            Enhance with AI
            <span className="pro-badge">Pro</span>
          </button>
        </div>
      </div>

      {aiResult && (
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text">
              {aiResult.title}
            </p>
            <button
              onClick={() => setAiResult(null)}
              className="text-xs text-subtle"
            >
              Dismiss
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-[10px] bg-bg p-3 text-xs text-text-2">
            {aiResult.md}
          </pre>
        </div>
      )}

      {open && (
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text">{open.title}</p>
            <button onClick={() => setOpen(null)} className="text-xs text-subtle">
              Close
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-[10px] bg-bg p-3 text-xs text-text-2">
            {open.content}
          </pre>
        </div>
      )}
    </div>
  );
}
