"use client";

import { useCallback, useEffect, useState } from "react";

interface Resume {
  id: string;
  title: string;
  targetRole: string | null;
  content: string;
  createdAt: string;
}

export default function ResumeManager() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [targetRole, setTargetRole] = useState("");
  const [selected, setSelected] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiStructure, setAiStructure] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/resume");
    if (res.ok) {
      const data = await res.json();
      setResumes(data.resumes);
      if (data.resumes.length > 0) setSelected(data.resumes[0]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetRole ? { targetRole } : {}),
      });
      if (res.ok) {
        const data = await res.json();
        setSelected(data.resume);
        setTargetRole("");
        await load();
      }
    } finally {
      setGenerating(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/resume/${id}`, { method: "DELETE" });
    if (selected?.id === id) setSelected(null);
    await load();
  }

  async function copy() {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  // Narrow AI (free): suggest how to organize existing material.
  async function suggestStructure() {
    setAiBusy(true);
    setAiNotice(null);
    setAiStructure(null);
    try {
      const res = await fetch("/api/ai/structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetRole ? { targetRole } : {}),
      });
      const data = await res.json();
      if (res.ok) setAiStructure(data.markdown);
      else setAiNotice(data.error ?? "Could not generate suggestions.");
    } finally {
      setAiBusy(false);
    }
  }

  // Full AI (Pro): rewrite/tailor the selected resume. 402 → upgrade prompt.
  async function enhance() {
    if (!selected) return;
    setAiBusy(true);
    setAiNotice(null);
    setEnhanced(null);
    try {
      const res = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: selected.id }),
      });
      const data = await res.json();
      if (res.ok) setEnhanced(data.markdown);
      else if (res.status === 402)
        setAiNotice(`🔒 ${data.error}`);
      else setAiNotice(data.error ?? "Could not enhance resume.");
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-900">Generate a resume</h2>
        <p className="text-sm text-slate-600">
          Builds an ATS-friendly Markdown resume from your activities and skills.
          Optionally target a specific role.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            className="input max-w-xs"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target role (optional)"
          />
          <button onClick={generate} className="btn" disabled={generating}>
            {generating ? "Generating…" : "Generate"}
          </button>
          <button
            onClick={suggestStructure}
            className="btn-secondary"
            disabled={aiBusy}
            title="AI suggests how to organize your existing material (free)"
          >
            {aiBusy ? "Thinking…" : "✨ Suggest structure (AI)"}
          </button>
        </div>
      </div>

      {aiNotice && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {aiNotice}
        </div>
      )}

      {aiStructure && (
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">
              AI structure suggestion
            </h3>
            <button
              onClick={() => setAiStructure(null)}
              className="text-xs text-slate-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
          <p className="mb-3 text-xs text-slate-500">
            A suggested ordering of your existing sections — it doesn&apos;t
            rewrite content. Full AI rewriting is a Pro feature.
          </p>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-800">
            {aiStructure}
          </pre>
        </div>
      )}

      {enhanced && (
        <div className="card">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">AI-enhanced resume</h3>
            <button
              onClick={() => setEnhanced(null)}
              className="text-xs text-slate-400 hover:underline"
            >
              Dismiss
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-800">
            {enhanced}
          </pre>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : resumes.length === 0 ? (
        <p className="text-sm text-slate-500">
          No resumes yet. Generate your first above.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <ul className="space-y-2">
            {resumes.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSelected(r)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                    selected?.id === r.id
                      ? "border-brand-500 bg-brand-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="font-medium text-slate-900">{r.title}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {selected && (
            <div className="card">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">
                  {selected.title}
                </h3>
                <div className="flex gap-2">
                  <button onClick={copy} className="btn-secondary">
                    {copied ? "Copied!" : "Copy Markdown"}
                  </button>
                  <button
                    onClick={enhance}
                    className="btn-secondary"
                    disabled={aiBusy}
                    title="Full AI rewrite & tailoring (Pro)"
                  >
                    Enhance with AI
                    <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] font-semibold text-amber-700">
                      PRO
                    </span>
                  </button>
                  <button
                    onClick={() => remove(selected.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-800">
                {selected.content}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
