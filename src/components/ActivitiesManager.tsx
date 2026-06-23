"use client";

import { useEffect, useState, useCallback } from "react";

interface SkillLink {
  skill: { id: string; name: string; category: string | null };
  proficiency: number;
}
interface Activity {
  id: string;
  title: string;
  description: string;
  occurredAt: string;
  skills: SkillLink[];
}
interface Suggestion {
  name: string;
  category: string;
}

export default function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/activities");
    if (res.ok) {
      const data = await res.json();
      setActivities(data.activities);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function fetchSuggestions() {
    const text = `${title} ${description}`.trim();
    if (!text) return;
    const res = await fetch("/api/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      const data = await res.json();
      setSuggestions(data.suggestions);
    }
  }

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save");
        return;
      }
      const newActivity: Activity = { ...data.activity, skills: [] };
      // Auto-apply any suggestions the user surfaced.
      for (const s of suggestions) {
        await fetch(`/api/activities/${newActivity.id}/skills`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: s.name, category: s.category }),
        });
      }
      setTitle("");
      setDescription("");
      setSuggestions([]);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function deleteActivity(id: string) {
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    await load();
  }

  async function addSkill(activityId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    await fetch(`/api/activities/${activityId}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    await load();
  }

  async function removeSkill(activityId: string, skillId: string) {
    await fetch(`/api/activities/${activityId}/skills/${skillId}`, {
      method: "DELETE",
    });
    await load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={addActivity} className="card space-y-3">
        <h2 className="font-semibold text-slate-900">Log an activity</h2>
        <div>
          <label className="label" htmlFor="title">
            What did you do?
          </label>
          <input
            id="title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Organized a charity fundraiser"
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="desc">
            Details
          </label>
          <textarea
            id="desc"
            className="input min-h-[90px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you did and the outcome…"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={fetchSuggestions}
            className="btn-secondary"
          >
            Suggest skills
          </button>
          {suggestions.length > 0 && (
            <span className="text-xs text-slate-500">
              These will be added automatically:
            </span>
          )}
          {suggestions.map((s) => (
            <span
              key={s.name}
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700"
            >
              {s.name}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400">
          Suggestions come from a keyword dictionary (not AI). You can edit
          skills after saving.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="btn" disabled={saving}>
          {saving ? "Saving…" : "Save activity"}
        </button>
      </form>

      <section>
        <h2 className="mb-3 font-semibold text-slate-900">
          Your activities {activities.length > 0 && `(${activities.length})`}
        </h2>
        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : activities.length === 0 ? (
          <p className="text-sm text-slate-500">
            No activities yet. Log your first above.
          </p>
        ) : (
          <ul className="space-y-4">
            {activities.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                onDelete={() => deleteActivity(a.id)}
                onAddSkill={(name) => addSkill(a.id, name)}
                onRemoveSkill={(skillId) => removeSkill(a.id, skillId)}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ActivityCard({
  activity,
  onDelete,
  onAddSkill,
  onRemoveSkill,
}: {
  activity: Activity;
  onDelete: () => void;
  onAddSkill: (name: string) => void;
  onRemoveSkill: (skillId: string) => void;
}) {
  const [skill, setSkill] = useState("");

  return (
    <li className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">{activity.title}</h3>
          <p className="text-xs text-slate-400">
            {new Date(activity.occurredAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={onDelete}
          className="text-xs text-red-500 hover:underline"
        >
          Delete
        </button>
      </div>
      {activity.description && (
        <p className="mt-2 text-sm text-slate-600">{activity.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {activity.skills.map((s) => (
          <span
            key={s.skill.id}
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700"
          >
            {s.skill.name}
            <button
              onClick={() => onRemoveSkill(s.skill.id)}
              className="text-slate-400 hover:text-red-500"
              aria-label={`Remove ${s.skill.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAddSkill(skill);
          setSkill("");
        }}
      >
        <input
          className="input max-w-xs"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
          placeholder="Add a skill…"
        />
        <button type="submit" className="btn-secondary">
          Add
        </button>
      </form>
    </li>
  );
}
