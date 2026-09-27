"use client";

import { useCallback, useEffect, useState } from "react";

interface Entry {
  id: string;
  content: string;
  createdAt: string;
}

export default function JournalManager() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/journal");
    if (res.ok) {
      const data = await res.json();
      setEntries(data.entries);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setContent("");
        await load();
      }
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/journal/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="card space-y-3">
        <label className="label" htmlFor="entry">
          What did you accomplish today?
        </label>
        <textarea
          id="entry"
          className="input min-h-[90px]"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Jot down a win, a lesson, or something you're proud of…"
        />
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : "Add entry"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-slate-500">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-500">No entries yet.</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) => (
            <li key={e.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap text-sm text-slate-700">
                  {e.content}
                </p>
                <button
                  onClick={() => remove(e.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                {new Date(e.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
