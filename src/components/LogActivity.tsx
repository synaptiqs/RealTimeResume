"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MicIcon, LockIcon, ArrowRightIcon } from "@/components/ui/icons";

interface Suggestion {
  name: string;
  category: string;
}
interface Usage {
  used: number;
  limit: number | null;
  remaining: number | null;
}

const QUICK = ["Led team meeting", "Completed training", "Mentored colleague"];

// Minimal typing for the Web Speech API (not in lib.dom defaults everywhere).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

export default function LogActivity({
  isPro,
  usage: initialUsage,
}: {
  isPro: boolean;
  usage: Usage;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"text" | "voice">("text");
  const [usage, setUsage] = useState(initialUsage);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const recogRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    return () => recogRef.current?.stop();
  }, []);

  function toggleVoice() {
    if (!isPro) return;
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      SpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setNotice("Voice input isn't supported in this browser — type instead.");
      return;
    }
    if (listening) {
      recogRef.current?.stop();
      return;
    }
    const r = new Ctor();
    r.lang = "en-US";
    r.interimResults = false;
    r.onresult = (e) => {
      const said = e.results[0][0].transcript;
      setText((prev) => (prev ? `${prev} ${said}` : said));
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }

  async function extract() {
    if (!text.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      const list: Suggestion[] = data.suggestions ?? [];
      setSuggestions(list);
      setAccepted(new Set(list.map((s) => s.name)));
    } finally {
      setBusy(false);
    }
  }

  function toggle(name: string) {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  async function save() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          source: mode,
          skills: (suggestions ?? [])
            .filter((s) => accepted.has(s.name))
            .map((s) => ({ name: s.name, category: s.category })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      if (res.status === 402) setNotice(`🔒 ${data.error}`);
      else setNotice(data.error ?? "Could not save.");
      if (data.usage) setUsage(data.usage);
    } finally {
      setBusy(false);
    }
  }

  const quotaText =
    usage.limit === null
      ? "Unlimited"
      : `${Math.max(0, usage.limit - usage.used)} of ${usage.limit} left`;

  // Review step
  if (suggestions) {
    return (
      <div className="space-y-5">
        <Header />
        <p className="text-sm text-muted">
          We found these skills. Accept or remove, then save.
        </p>
        {suggestions.length === 0 ? (
          <p className="text-sm text-subtle">
            No skills detected — you can still save the activity.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => {
              const on = accepted.has(s.name);
              return (
                <button
                  key={s.name}
                  onClick={() => toggle(s.name)}
                  className={`pill border ${
                    on
                      ? "border-accent bg-accent-bg text-accent"
                      : "border-border bg-surface text-muted"
                  }`}
                >
                  {on ? "✓ " : "+ "}
                  {s.name}
                </button>
              );
            })}
          </div>
        )}
        {notice && <p className="text-sm text-upgrade">{notice}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => setSuggestions(null)}
            className="btn-secondary flex-1"
          >
            Back
          </button>
          <button onClick={save} disabled={busy} className="btn flex-1">
            {busy ? "Saving…" : "Save activity"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Header />

      <div className="flex items-center justify-between">
        <p className="font-serif text-xl text-text">
          {isPro ? "What did you do today?" : "What did you do?"}
        </p>
        {usage.limit !== null && (
          <span className="pill bg-surface-2 text-muted">{quotaText}</span>
        )}
      </div>
      {usage.limit !== null && (
        <p className="-mt-3 text-xs text-subtle">
          Free plan: {usage.limit} extractions/month
        </p>
      )}

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("text")}
          className={`flex-1 rounded-[10px] border px-3 py-2 text-sm font-medium ${
            mode === "text"
              ? "border-accent bg-accent-bg text-accent"
              : "border-border bg-surface text-muted"
          }`}
        >
          Type
        </button>
        <button
          onClick={() => (isPro ? setMode("voice") : null)}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border px-3 py-2 text-sm font-medium ${
            !isPro
              ? "border-border bg-surface text-disabled"
              : mode === "voice"
                ? "border-accent bg-accent-bg text-accent"
                : "border-border bg-surface text-muted"
          }`}
        >
          Voice
          {!isPro && <span className="pro-badge">Pro</span>}
        </button>
      </div>

      {mode === "voice" && isPro ? (
        <div className="card flex flex-col items-center gap-3 py-8">
          <button
            onClick={toggleVoice}
            className={`flex h-20 w-20 items-center justify-center rounded-full ${
              listening ? "bg-danger text-white" : "bg-accent text-white"
            }`}
          >
            <MicIcon className="h-8 w-8" />
          </button>
          <p className="text-sm text-muted">
            {listening ? "Listening… tap to stop" : "Tap to speak"}
          </p>
          {text && <p className="text-sm text-text-2">{text}</p>}
        </div>
      ) : (
        <textarea
          className="input min-h-[120px] resize-none"
          placeholder="Describe what you did today..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      )}

      {/* AI suggestions / quick-fill */}
      <div>
        <p className="label">{isPro ? "Quick Suggestions" : "AI Suggestions"}</p>
        <div className="flex flex-wrap gap-2">
          {QUICK.map((q, i) => {
            const locked = !isPro && i > 0;
            return (
              <button
                key={q}
                onClick={() => (locked ? null : setText(q))}
                className={`pill border ${
                  locked
                    ? "border-border bg-surface text-disabled"
                    : "border-border bg-surface text-text-2 hover:bg-surface-2"
                }`}
              >
                {locked && <LockIcon className="h-3 w-3 text-upgrade" />}
                {q}
              </button>
            );
          })}
        </div>
        {!isPro && (
          <a
            href="/profile#upgrade"
            className="mt-2 inline-block text-xs font-semibold text-upgrade"
          >
            Unlock unlimited suggestions →
          </a>
        )}
      </div>

      {notice && <p className="text-sm text-upgrade">{notice}</p>}

      <button onClick={extract} disabled={busy || !text.trim()} className="btn w-full">
        {busy ? "Extracting…" : "Extract Skills"}
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="font-serif text-2xl text-text">Log Activity</h1>
    </header>
  );
}
