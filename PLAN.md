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
| **AI** | **Excluded from this version.** No LLM/Claude integration. Skill suggestion is a deterministic keyword dictionary; resume generation is template-based. AI is a documented future milestone behind a clean interface. |
| How far now | **Build v1 end-to-end with tests, then push** |

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
6. **Journal** — plain dated notes (no assistant).

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
- **Ship:** deploy to Vercel (swap `DATABASE_URL` to managed Postgres, set
  `AUTH_SECRET`). Mobile + integrations + AI are follow-on milestones.

## Roadmap beyond v1

1. **Enhanced AI (deferred this version):** Claude-powered skill extraction,
   journaling assistant, and resume writing behind the existing interfaces.
2. Real-time sync (websockets / SSE) and optimistic UI.
3. Voice input + the 30-second logging flow from the wiki.
4. Job-board integrations (ZipRecruiter / Indeed / LinkedIn).
5. Mobile (Expo/React Native) sharing the TypeScript core.
6. Privacy & compliance: E2E encryption for journals, GDPR/COPPA, data export.
7. PDF export, resume templates, job-targeted tailoring.
