"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const GOALS = [
  { value: "recent-grad", label: "Recent graduate" },
  { value: "career-change", label: "Career changer" },
  { value: "returning-parent", label: "Returning parent" },
  { value: "level-up", label: "Level up my career" },
];

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("recent-grad");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isRegister ? { email, password, name, goal } : { email, password },
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push(isRegister ? "/onboarding" : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-12 max-w-app px-6">
      <Link href="/" className="text-sm text-accent">
        ← RealTimeResume
      </Link>
      <h1 className="mt-4 font-serif text-2xl text-text">
        {isRegister ? "Create your account" : "Welcome back"}
      </h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {isRegister && (
          <div>
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Doe"
            />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={isRegister ? 8 : undefined}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isRegister ? "At least 8 characters" : ""}
          />
        </div>
        {isRegister && (
          <div>
            <label className="label" htmlFor="goal">
              Your goal
            </label>
            <select
              id="goal"
              className="input"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              {GOALS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <button type="submit" className="btn w-full" disabled={loading}>
          {loading
            ? "Please wait…"
            : isRegister
              ? "Create account"
              : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="text-accent">
              Log in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/register" className="text-accent">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
