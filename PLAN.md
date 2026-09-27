# RealTimeResume — Build, Test & Ship Plan

> Status of the repo when this plan was written: a single `README.md` and one
> commit. Despite the wiki labelling the product "v1.0.0", **no application code
> existed.** This is therefore a greenfield build, not a repair. The product
> vision comes from the project wiki (an app that turns daily activities into
> professional skills and resumes).

## Decision summary

| Question | Decision |
| --- | --- |
| v1 scope | **Web MVP first** (mobile later) |
| Stack | **Next.js 15 + TypeScript + Tailwind**, Prisma + SQLite (→ Postgres in prod) |
| Auth | Session cookies, `bcryptjs` password hashing, `jose`-signed JWT |
| **AI** | **Narrow AI only.** A single Claude-powered feature — resume *structuring* (suggests section order/grouping of existing material; never rewrites content) — is free for all users. Skill suggestion and resume/timesheet generation remain deterministic/template-based. **Full AI assistance (rewriting & tailoring) is gated behind a paywall** (`user.isPro`), returning HTTP 402 until upgraded. |
| Hosting | **AWS** (App Runner + RDS PostgreSQL); domain registered via **Bluehost** (DNS → AWS). See `DEPLOY.md`. |
| How far now | **Build v1 end-to-end with tests, then push** |

## Phasing

- **Phase 0 (this version):** manual, deterministic tooling — activity tracking,
  skills, resume generation, **timesheet generation**, and journaling notes —
  plus one **narrow, free AI feature: resume structuring**. Free.
- **Paywall (this version):** **full AI assistance** (AI resume rewriting &
  job-description tailoring) is implemented behind `user.isPro` and returns 402
  until upgraded. Billing/checkout to flip `isPro` is the next step.
- **Next update:** broaden AI behind the paywall (AI skill extraction,
  journaling assistant, AI timesheet writing) after measuring engagement.

## What v1 (this slice) delivers — no enhanced AI

The core loop from the wiki — *log activity → capture skills → generate a resume* —
end to end on the web, using **deterministic logic only** (no LLM):

1. **Accounts** — register / login / logout (hashed passwords, signed session cookie).
2. **Activity logging** — create, list, delete activities (title + description + date).
3. **Skills (manual)** — add skills with a proficiency (1–5), link them to activities,
   and get **rule-based keyword suggestions** from a static dictionary (accept/edit —
   *not* AI). Skills aggregate per user.
4. **Skills dashboard** — aggregated skills with proficiency and source-activity counts.
5. **Resume generation (template)** — assemble an ATS-friendly Markdown resume
   (summary, skills, experience bullets) from the user's activities + skills using a
   deterministic template. Store versions; view as Markdown.
6. **Timesheet generation** — log hours (date, project, description) and
   generate a timesheet report (Markdown + CSV export, totals by project).
7. **Journal** — plain dated notes (no assistant).

### Explicitly out of this version

- **All enhanced AI features** (per request): AI skill extraction, AI journaling
  assistant, AI/LLM resume writing, job tailoring.
- Mobile apps, real-time multi-device sync, job-board integrations, end-to-end
  encryption, voice input, PDF export polish, GDPR/COPPA compliance work.

## Architecture

```
src/
  lib/
    db.ts            Prisma client singleton
    auth.ts          password hashing, JWT session, getCurrentUser
    skills/
      suggest.ts     rule-based keyword → skill dictionary (deterministic, NOT AI)
    activities.ts    domain ops (create/list/delete)
    skills.ts        skill + activity-skill ops, aggregation
    resume.ts        deterministic template resume generation + persistence
    journal.ts       plain journal entry ops
  app/
    (marketing)/     landing page
    login, register  auth pages
    dashboard, activities, skills, resume, journal  app pages
    api/...          thin route handlers calling src/lib
prisma/schema.prisma User, Activity, Skill, ActivitySkill, ResumeVersion, JournalEntry
```

> **Extension point for later AI:** `src/lib/skills/suggest.ts` and
> `src/lib/resume.ts` expose plain functions. A future milestone can add an
> AI-backed implementation behind the same signatures (gated on an
> `ANTHROPIC_API_KEY`) without touching routes or UI. Nothing in this version
> imports an LLM SDK.

## Data model (Prisma)

- **User** — email, passwordHash, name, goal.
- **Activity** — userId, title, description, occurredAt.
- **Skill** — userId, name (unique per user), category.
- **ActivitySkill** — join: activityId ↔ skillId, proficiency (1–5).
- **ResumeVersion** — userId, title, content (Markdown), targetRole.
- **JournalEntry** — userId, content, createdAt.

## Check / Test / Ship

- **Typecheck:** `npm run typecheck` (`tsc --noEmit`).
- **Unit + integration tests:** `npm test` (Vitest) — covers the keyword
  suggester, skill aggregation, auth hashing/JWT, and template resume assembly.
- **Build:** `npm run build` (`prisma generate` + `next build`).
- **CI:** GitHub Actions runs typecheck → test → build on every push/PR.
- **Ship:** deploy to **AWS** (App Runner + RDS PostgreSQL) via the Docker
  image; domain through Bluehost. Full steps in `DEPLOY.md`.

## Roadmap beyond v1

1. **Monetize the paywall:** add checkout (e.g. Stripe) to set `user.isPro`, so
   the already-built full-AI endpoint (`/api/ai/enhance`) unlocks on payment.
2. **Broaden paid AI:** Claude-powered skill extraction, journaling assistant,
   and AI timesheet writing behind the same `isPro` gate, after gauging
   engagement with the free narrow structuring feature.
2. Real-time sync (websockets / SSE) and optimistic UI.
3. Voice input + the 30-second logging flow from the wiki.
4. Job-board integrations (ZipRecruiter / Indeed / LinkedIn).
5. Mobile (Expo/React Native) sharing the TypeScript core.
6. Privacy & compliance: E2E encryption for journals, GDPR/COPPA, data export.
7. PDF export, resume templates, job-targeted tailoring.

## v2 — Design-handoff implementation (mobile redesign)

Implemented the designer PRD in one pass on the existing Next.js stack:

- **Mobile-first IA**: bottom tab bar (Home/Log/Resume/Profile) + onboarding;
  centered `max-w-app` column scales to desktop.
- **Theming**: CSS-variable design tokens (PRD §7) for light/dark, OS-follow with
  a persisted manual override; IBM Plex Sans + DM Serif Display.
- **Free vs Pro gating**: blurred locked previews + PRO tags, upgrade banners,
  quotas. `user.isPro` drives it; `/api/billing` is a **demo** toggle (no payment
  processor — Stripe checkout remains the next step to make Pro real).
- **Resume Strength score**: deterministic per-target-job engine (`src/lib/score`)
  — Skills match · ATS · Keywords · Format → 0–100; stored on each resume and
  computed live for the dashboard/builder.
- **Voice logging**: Web Speech API on the Log screen (Pro), text fallback.
- **Monthly quota**: 5 free extractions/month (`src/lib/quota`).

Folded the old desktop screens into the new IA (Activities → Log; Skills →
Dashboard/Resume); Journal & Timesheet remain as Profile-linked tools.

### Out of scope (per PRD §10) / next
Real payment processor, AI journaling assistant, job-platform apply, multi-device
sync internals, the marketing wiki. Settings rows (Edit Profile, Email
Preferences, Data & Privacy, Export) are placeholders.
