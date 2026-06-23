import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="text-xl font-bold text-brand-600">RealTimeResume</span>
        <nav className="flex gap-3">
          {user ? (
            <Link href="/dashboard" className="btn">
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">
                Log in
              </Link>
              <Link href="/register" className="btn">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mt-20 max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Turn your life into your resume.
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          Log what you do — studying, volunteering, side projects, work — and
          RealTimeResume helps you capture the skills behind it and assemble a
          polished, ATS-friendly resume in seconds.
        </p>
        <div className="mt-8 flex gap-3">
          <Link href={user ? "/dashboard" : "/register"} className="btn">
            {user ? "Open dashboard" : "Create your free account"}
          </Link>
          <Link href="/login" className="btn-secondary">
            I already have an account
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-400">
          This version focuses on the core workflow. AI-assisted features are on
          the roadmap.
        </p>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {[
          {
            title: "Log activities",
            body: "Capture anything you do in a few seconds.",
          },
          {
            title: "Capture skills",
            body: "Tag activities with skills — with keyword suggestions to help.",
          },
          {
            title: "Generate a resume",
            body: "Assemble a clean Markdown resume from your history.",
          },
        ].map((f) => (
          <div key={f.title} className="card">
            <h3 className="font-semibold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
