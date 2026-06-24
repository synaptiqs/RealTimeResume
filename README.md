# RealTimeResume

Turn your daily activities into professional skills and a polished, ATS-friendly
resume. Log what you do — studying, volunteering, side projects, work — capture
the skills behind it, and generate a resume from your history.

> **This version ships the core workflow with no AI integration.** Skill
> suggestions come from a deterministic keyword dictionary (not AI), and resumes
> are assembled from a template. AI-assisted features are a documented future
> milestone (see [`PLAN.md`](./PLAN.md)).

## Features (v1)

- **Accounts** — email/password auth with hashed passwords and signed session cookies.
- **Activity logging** — create, list, and delete activities.
- **Skills** — tag activities with skills (manual), with optional keyword
  suggestions; skills aggregate across activities with proficiency.
- **Resume generation** — assemble a Markdown resume from your activities and
  skills; keep multiple versions; copy to clipboard.
- **Timesheet generation** — log hours (date, project, description) and generate
  a timesheet report with totals by project; export as Markdown or CSV.
- **Journal** — plain dated notes to capture achievements.
- **AI resume structuring (free, narrow)** — Claude suggests how to order and
  group your *existing* material into resume sections. It never rewrites your
  content — that's the Pro feature.
- **Full AI assistance (Pro / paywalled)** — AI rewriting and job-description
  tailoring of a resume, gated behind `user.isPro` (returns HTTP 402 until
  upgraded).

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
