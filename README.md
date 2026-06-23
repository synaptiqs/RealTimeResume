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
- **Journal** — plain dated notes to capture achievements.

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

## Production deployment

1. Switch the Prisma datasource `provider` to `postgresql` and point
   `DATABASE_URL` at managed Postgres.
2. Set a strong `AUTH_SECRET`.
3. `npm run build && npm start` (or deploy to Vercel).

## Roadmap

See [`PLAN.md`](./PLAN.md) for the full plan, including the deferred AI features
and the path to mobile, real-time sync, and job-board integrations.
