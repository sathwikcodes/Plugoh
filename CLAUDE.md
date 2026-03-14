# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run style:format # Format code with Prettier
```

No test suite is configured.

## Architecture

**ReelReach** is a Next.js App Router application connecting brands with Instagram influencers. It uses Supabase for auth and database, with a multi-role system (business, influencer, admin, creator).

### Key Directories

- `app/` — Next.js App Router pages. Routes split by role: `dashboard/business/`, `dashboard/influencer/`, `dashboard/admin/`, `dashboard/creator/`
- `components/ui/` — shadcn/ui component library (do not edit generated files)
- `components/landing/` — Landing page section components
- `components/` — App-level components (Navbar, ProtectedRoute, providers, etc.)
- `contexts/AuthContext.tsx` — Central auth state: user, role, profile, loading, onboarding flags
- `lib/supabase/client.ts` — Supabase client initialization
- `lib/supabase/types.ts` — Auto-generated TypeScript types from Supabase schema (do not edit manually)

### Auth & Routing Flow

1. `AuthContext` (via `components/providers.tsx`) wraps the entire app and exposes user/role/profile
2. `ProtectedRoute` guards dashboard routes and redirects unauthenticated users
3. `app/dashboard/layout.tsx` includes the `Navbar` for all dashboard pages
4. After login, users are routed based on their `app_role` enum: `business | influencer | admin | creator`
5. New users go through `/onboarding` before accessing their dashboard

### Data Layer

- **Supabase** handles auth (email/password) and PostgreSQL database
- Main tables: `profiles`, `user_roles`, `campaigns`
- React Query (`@tanstack/react-query`) manages server state/caching
- Forms use React Hook Form + Zod validation

### Styling

- Tailwind CSS v4 with CSS variables for theming
- Dark mode forced globally (set in `app/layout.tsx` via `ThemeProvider`)
- `cn()` utility in `lib/utils.ts` for conditional class merging (clsx + tailwind-merge)
- Framer Motion for animations

### Environment Variables

Required in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Path Aliases

`@/*` maps to the project root (e.g., `@/lib/utils`, `@/components/ui/button`).

---

## gstack Skills

gstack is installed at `~/.claude/skills/gstack` and provides eight cognitive specialist skills. **Use the right skill for each phase of work — do not default to the generic assistant when a specialist applies.**

### When to use each skill

| Trigger                                             | Skill                    | What it does                                                                                                                    |
| --------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| "review this", "check for bugs", code complete      | `/review`                | Paranoid engineer — hunts for production-breaking bugs CI won't catch (race conditions, N+1 queries, trust boundary violations) |
| "plan this feature", "how should we build X"        | `/plan-eng-review`       | Tech lead — locks in architecture, system boundaries, data flow diagrams, and test matrix before any code is written            |
| "is this the right thing to build", "rethink this"  | `/plan-ceo-review`       | Founder mode — questions the problem from first principles, finds the 10-star product within a feature request                  |
| "ship this", "open a PR", "push this"               | `/ship`                  | Release engineer — syncs branch, runs lint/build, updates changelog, opens PR with zero friction                                |
| "test this", "QA this", "find bugs on the site"     | `/qa`                    | QA lead — systematically tests the running app in four modes (see below), produces a health-scored report with screenshots      |
| "browse to X", "check if Y renders", "screenshot Z" | `/browse`                | Headless Chromium — navigate, click, fill forms, assert element states, take annotated screenshots (~100ms/cmd)                 |
| "import my cookies", "test while logged in"         | `/setup-browser-cookies` | Imports live cookies from Comet/Chrome/Arc/Brave/Edge into the headless session so authenticated pages can be tested            |
| "retro", "how's the team shipping"                  | `/retro`                 | EM mode — analyzes commit history, per-person velocity, and writes structured retrospective feedback                            |
| gstack is outdated                                  | `/gstack-upgrade`        | Pulls latest gstack and rebuilds binaries                                                                                       |

---

### `/qa` — QA Testing (four modes)

Run against `localhost:3000` (the dev server). The skill auto-detects the port.

| Mode                                       | When to use                                         | How to invoke                                       |
| ------------------------------------------ | --------------------------------------------------- | --------------------------------------------------- |
| **Diff-aware** (default on feature branch) | Just finished a feature — test only what changed    | `/qa` (no URL needed; reads `git diff main...HEAD`) |
| **Full**                                   | Comprehensive sweep of the whole app                | `/qa http://localhost:3000`                         |
| **Quick**                                  | 30-second smoke test (homepage + top 5 nav targets) | `/qa --quick`                                       |
| **Regression**                             | Compare current state against a saved baseline      | `/qa --regression .gstack/qa-reports/baseline.json` |

Reports and screenshots are saved to `.gstack/qa-reports/`. Each report includes a health score (0–100) weighted across Console, Links, Visual, Functional, UX, Performance, Content, and Accessibility.

**ReelReach-specific QA priorities:**

- Auth flows: signup → onboarding → role-based dashboard redirect
- Role gating: business vs influencer vs admin vs creator pages
- Campaign CRUD (business dashboard)
- Influencer profile and discovery pages
- Supabase real-time or data-fetch errors (check console after every navigation)

---

### `/browse` — Headless Browser

The browse binary is at `~/.claude/skills/gstack/browse/dist/browse`. First run starts Chromium (~3s); subsequent commands are ~100ms. State (cookies, tabs, login session) persists between commands.

**Always run the setup check before the first browse command in a session:**

```bash
_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)
B=""
[ -n "$_ROOT" ] && [ -x "$_ROOT/.claude/skills/gstack/browse/dist/browse" ] && B="$_ROOT/.claude/skills/gstack/browse/dist/browse"
[ -z "$B" ] && B=~/.claude/skills/gstack/browse/dist/browse
[ -x "$B" ] && echo "READY: $B" || echo "NEEDS_SETUP"
```

**Core pattern for verifying a UI change:**

```bash
$B goto http://localhost:3000/<route>
$B snapshot -i                        # see all interactive elements with @e refs
$B snapshot -i -a -o /tmp/before.png  # annotated screenshot
# ... perform action ...
$B snapshot -D                        # unified diff showing exactly what changed
$B console --errors                   # catch JS errors that don't surface visually
```

**Use `/setup-browser-cookies` first** when testing any authenticated route (dashboard, onboarding, etc.) so the headless session inherits the logged-in state from your real browser.
