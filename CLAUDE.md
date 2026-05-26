# CLAUDE.md

## Commands

```bash
npm run dev          # http://localhost:3000
npm run dev:https    # https://localhost:3000 (self-signed cert)
npm run build        # production
npm run lint
npm run style:format
```

## Stack

Next.js App Router · Supabase (auth + PostgreSQL) · React Query · React Hook Form + Zod · Tailwind v4 · Framer Motion

## Roles

`business | influencer | admin | creator` — routes live under `app/dashboard/{role}/`

## Key files

- `contexts/AuthContext.tsx` — user, role, profile, loading, onboarding flags
- `lib/supabase/client.ts` — Supabase client
- `lib/supabase/types.ts` — auto-generated, **do not edit**
- `components/ui/` — shadcn/ui, **do not edit**
- `lib/utils.ts` — `cn()` helper

## Auth flow

Login → `app_role` check → `/onboarding` (new users) → `app/dashboard/{role}/`
`ProtectedRoute` guards all dashboard routes. `app/dashboard/layout.tsx` includes Navbar.

`/demo` — optional sandbox login (`POST /api/demo/login`) when `NEXT_PUBLIC_DEMO_ENABLED=true`; emails/password via `DEMO_*` env. Create Auth users first: `npm run demo:create-users`, then seed: `supabase/seed_yc_demo.sql`.

`/review` — Meta App Review login (`POST /api/review/login`) when `NEXT_PUBLIC_META_REVIEW_ENABLED=true`; redirects to `/onboarding` (not dashboard). `META_REVIEW_EMAIL` + `META_REVIEW_PASSWORD`. Reviewer has no pre-seeded role/IG — same onboarding + Instagram connect as new creators. Setup: `npm run meta:create-reviewer`, `supabase/seed_meta_reviewer.sql`, `npm run meta:clear-instagram` before OAuth screencast. Does not change `/demo`. Submission copy: `docs/META_APP_REVIEW.md`.

Meta OAuth redirect: `https://plugoh.com/api/auth/callback/instagram` (requires `NEXT_PUBLIC_APP_URL=https://plugoh.com` in production).

## Data

Tables: `profiles`, `user_roles`, `campaigns`. Dark mode forced globally via `ThemeProvider`.
Aliases: `@/*` = project root.

## Output rules

- Be terse. No filler phrases, no summaries of what you just did.
- Skip explanations unless asked.
- Prefer diffs over full file rewrites.
- No comments in code unless logic is non-obvious.

## graphify

Knowledge graph at `graphify-out/`. Before any architecture/codebase question, read `graphify-out/GRAPH_REPORT.md`. If `graphify-out/wiki/index.md` exists, use it instead of raw files.
After modifying files: `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"`

## gstack skills (`~/.claude/skills/gstack`)

| Trigger                     | Skill                    |
| --------------------------- | ------------------------ |
| review / check for bugs     | `/review`                |
| plan feature / architecture | `/plan-eng-review`       |
| rethink / first principles  | `/plan-ceo-review`       |
| ship / open PR / push       | `/ship`                  |
| test / QA / find bugs       | `/qa`                    |
| browse / screenshot / click | `/browse`                |
| test while logged in        | `/setup-browser-cookies` |
| retro / velocity            | `/retro`                 |

### /qa modes

`/qa` (diff-aware) · `/qa http://localhost:3000` (full) · `/qa --quick` (smoke) · `/qa --regression .gstack/qa-reports/baseline.json`
Reports → `.gstack/qa-reports/`. QA priorities: auth flows, role gating, campaign CRUD, influencer discovery, Supabase errors.

### /browse

Binary: `~/.claude/skills/gstack/browse/dist/browse`
Run setup check first, then: `goto` → `snapshot -i` → action → `snapshot -D` → `console --errors`
Use `/setup-browser-cookies` before any authenticated route.
