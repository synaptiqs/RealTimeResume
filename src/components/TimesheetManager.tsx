"use client";

import { useCallback, useEffect, useState } from "react";

interface TimeEntry {
  id: string;
  date: string;
  hours: number;
  project: string | null;
  description: string;
}

interface Report {
  markdown: string;
  csv: string;
  summary: { totalHours: number; entryCount: number };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function TimesheetManager() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(today());
  const [hours, setHours] = useState("1");
  const [project, setProject] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<Report | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/timesheet");
    if (res.ok) setEntries((await res.json()).entries);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/timesheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          hours: Number(hours),
          project: project || undefined,
          description,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save");
        return;
      }
      setHours("1");
      setProject("");
      setDescription("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    await fetch(`/api/timesheet/${id}`, { method: "DELETE" });
    await load();
  }

  async function generate() {
    const res = await fetch("/api/timesheet/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: from || undefined,
        to: to || undefined,
        title: "Timesheet",
      }),
    });
    if (res.ok) setReport(await res.json());
  }

  function downloadCsv() {
    if (!report) return;
    const blob = new Blob([report.csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "timesheet.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="card space-y-3">
        <h2 className="font-semibold text-slate-900">Log time</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="hours">
              Hours
            </label>
            <input
              id="hours"
              type="number"
              step="0.25"
              min="0.25"
              max="24"
              className="input"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="project">
            Project / client (optional)
          </label>
          <input
            id="project"
            className="input"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g. Acme Co."
          />
        </div>
        <div>
          <label className="label" htmlFor="tdesc">
            What did you work on?
          </label>
          <input
            id="tdesc"
            className="input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : "Add entry"}
        </button>
      </form>

      <div className="card space-y-3">
        <h2 className="font-semibold text-slate-900">Generate timesheet</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label" htmlFor="from">
              From
            </label>
            <input
              id="from"
              type="date"
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label" htmlFor="to">
              To
            </label>
            <input
              id="to"
              type="date"
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <button onClick={generate} className="btn">
            Generate
          </button>
        </div>
        {report && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Total: <strong>{report.summary.totalHours} h</strong> across{" "}
                {report.summary.entryCount} entries
              </p>
              <button onClick={downloadCsv} className="btn-secondary">
                Download CSV
              </button>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-800">
              {report.markdown}
            </pre>
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-3 font-semibold text-slate-900">
          Recent entries {entries.length > 0 && `(${entries.length})`}
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-500">No time entries yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Project</th>
                  <th className="px-4 py-2 font-medium">Hours</th>
                  <th className="px-4 py-2 font-medium">Description</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 text-slate-600">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-slate-600">
                      {e.project ?? "General"}
                    </td>
                    <td className="px-4 py-2 text-slate-900">{e.hours}</td>
                    <td className="px-4 py-2 text-slate-600">{e.description}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => remove(e.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
