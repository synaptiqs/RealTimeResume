# RealTimeResume

**Your life is your resume.** A mobile-first web app that turns everyday
activities into professional skills and ATS-optimized resumes, built to the
design handoff PRD (5 screens, light/dark, Free vs Pro).

## App structure

Mobile-first responsive web app with a bottom tab bar — **Home · Log · Resume ·
Profile** — plus an onboarding flow. Light/dark themes follow the OS by default
with a manual override (Profile → Theme).

| Screen | What it does |
|---|---|
| **Onboarding** | Pick a path (Recent Graduate / Career Changer / Return to Work / Freelancer-Pro) and see plan inclusions. |
| **Home (Dashboard)** | Greeting, plan badge, stats (Skills/Activities/Score), Resume Strength ring, recent activity feed, FAB to log. |
| **Log** | Capture an activity by text or voice (Pro), extract skills, review/accept, save. Free quota: 5 extractions/month. |
| **Resume** | Resume Strength score per target job, top-skill bars, saved resumes, generate, AI structure (free) / AI enhance (Pro). |
| **Profile** | Identity, stats, plan management (demo upgrade), theme toggle, settings, Journal/Timesheet tools, sign out. |

## Features

- **Accounts & onboarding** — email/password auth; path/persona selection.
- **Activity logging** — text or **voice** (Pro, Web Speech API); deterministic
  keyword skill extraction with an accept/edit review step; **5/month** free quota.
- **Skills** — accrue across activities with proficiency (Proficient/Advanced/Expert).
- **Resume generation** — ATS-friendly Markdown resumes, kept as versions.
- **Resume Strength score** — deterministic 0–100 per target job, composed of
  Skills match · ATS · Keywords · Format (Pro; locked/blurred on Free).
- **Light/dark theming** — CSS-variable tokens from the PRD; OS-follow + override.
- **Free vs Pro gating** — blurred locked previews + PRO tags, upgrade banners,
  quotas; a **demo** upgrade toggle (`/api/billing`) flips `user.isPro` (no
  payment processor yet — see roadmap).
- **AI resume structuring (free)** — Claude suggests section ordering of your
  *existing* material; never rewrites content.
- **Full AI assistance (Pro)** — AI rewriting/tailoring, gated behind `isPro` (402).
- **Timesheet & Journal** — secondary tools, reachable from Profile.

> AI features use the Anthropic API and are optional: without `ANTHROPIC_API_KEY`
> set, AI endpoints return a friendly "not available" message and the rest of the
> app works unchanged. Skill suggestion and resume/timesheet generation are
> deterministic (no AI). Broader AI (skill extraction, journaling assistant) is
> planned behind the same paywall in a later update.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS**
- **Prisma** ORM with **SQLite** for local/dev (swap to Postgres for production)
- **bcryptjs** + **jose** (JWT) for auth
- **Vitest** for tests, **GitHub Actions** for CI

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   then set AUTH_SECRET to a long random string:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 3. Create the database schema (SQLite by default)
npm run db:push

# 4. Run the dev server
npm run dev
# open http://localhost:3000
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm start` | Run the production build |
| `npm run typecheck` | TypeScript type checking (`tsc --noEmit`) |
| `npm test` | Run the Vitest suite |
| `npm run db:push` | Apply the Prisma schema to the database |

## Project layout

```
prisma/schema.prisma     Data model (User, Activity, Skill, ActivitySkill, ResumeVersion, JournalEntry)
src/lib/                 Domain logic (auth, activities, skills, resume, journal) — framework-agnostic
src/lib/skills/suggest   Deterministic keyword → skill dictionary (NOT AI)
src/lib/resume/template  Deterministic Markdown resume builder
src/app/api/             Thin route handlers calling src/lib
src/app/                 Pages (landing, auth, dashboard, activities, skills, resume, journal)
tests/                   Vitest unit/integration tests for the pure logic
```

## Production deployment (AWS)

The app ships as a Docker image (Next.js standalone output). The recommended
target is **AWS App Runner + RDS PostgreSQL**, with the domain pointed from
**Bluehost** DNS. Full step-by-step instructions — switching Prisma to Postgres,
building/pushing to ECR, the VPC connector, and the Bluehost DNS records — are in
[`DEPLOY.md`](./DEPLOY.md).

## Roadmap

See [`PLAN.md`](./PLAN.md) for the full plan, including the deferred AI features
and the path to mobile, real-time sync, and job-board integrations.
