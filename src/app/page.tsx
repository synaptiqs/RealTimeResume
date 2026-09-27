import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="mx-auto max-w-app px-6 py-12">
      <header className="flex items-center justify-between">
        <span className="font-serif text-xl text-accent">RealTimeResume</span>
        <nav className="flex gap-2">
          {user ? (
            <Link href="/dashboard" className="btn">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn-secondary">
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <section className="mt-16 text-center">
        <h1 className="font-serif text-4xl leading-tight text-text">
          Your life is your resume.
        </h1>
        <p className="mt-4 text-text-2">
          AI discovers the professional skills in everything you do — work,
          study, volunteering, side projects — and assembles an ATS-optimized
          resume on demand.
        </p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href={user ? "/dashboard" : "/register"} className="btn">
            {user ? "Open dashboard" : "Get Started"}
          </Link>
          {!user && (
            <Link href="/login" className="btn-secondary">
              I already have an account
            </Link>
          )}
        </div>
      </section>

      <section className="mt-16 space-y-3">
        {[
          {
            title: "Log activities",
            body: "Capture anything you do — by text or voice (Pro).",
          },
          {
            title: "Skills accrue",
            body: "Every activity surfaces the professional skills behind it.",
          },
          {
            title: "Generate targeted resumes",
            body: "ATS-optimized resumes scored against your target job.",
          },
        ].map((f) => (
          <div key={f.title} className="card">
            <h3 className="font-semibold text-text">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
