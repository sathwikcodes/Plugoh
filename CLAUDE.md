# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Application Reference

@CODEBASE.md

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run style:format # Format code with Prettier
```

No test suite is configured.

## Architecture

**Plugoh** is a Next.js App Router application connecting brands with Instagram influencers. It uses Supabase for auth and database, with a multi-role system (business, influencer, admin, creator).

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

**Plugoh-specific QA priorities:**

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

<!-- dgc-policy-v11 -->

# Dual-Graph Context Policy

This project uses a local dual-graph MCP server for efficient context retrieval.

## MANDATORY: Always follow this order

1. **Call `graph_continue` first** — before any file exploration, grep, or code reading.

2. **If `graph_continue` returns `needs_project=true`**: call `graph_scan` with the
   current project directory (`pwd`). Do NOT ask the user.

3. **If `graph_continue` returns `skip=true`**: project has fewer than 5 files.
   Do NOT do broad or recursive exploration. Read only specific files if their names
   are mentioned, or ask the user what to work on.

4. **Read `recommended_files`** using `graph_read` — **one call per file**.
   - `graph_read` accepts a single `file` parameter (string). Call it separately for each
     recommended file. Do NOT pass an array or batch multiple files into one call.
   - `recommended_files` may contain `file::symbol` entries (e.g. `src/auth.ts::handleLogin`).
     Pass them verbatim to `graph_read(file: "src/auth.ts::handleLogin")` — it reads only
     that symbol's lines, not the full file.
   - Example: if `recommended_files` is `["src/auth.ts::handleLogin", "src/db.ts"]`,
     call `graph_read(file: "src/auth.ts::handleLogin")` and `graph_read(file: "src/db.ts")`
     as two separate calls (they can be parallel).

5. **Check `confidence` and obey the caps strictly:**
   - `confidence=high` -> Stop. Do NOT grep or explore further.
   - `confidence=medium` -> If recommended files are insufficient, call `fallback_rg`
     at most `max_supplementary_greps` time(s) with specific terms, then `graph_read`
     at most `max_supplementary_files` additional file(s). Then stop.
   - `confidence=low` -> Call `fallback_rg` at most `max_supplementary_greps` time(s),
     then `graph_read` at most `max_supplementary_files` file(s). Then stop.

## Token Usage

A `token-counter` MCP is available for tracking live token usage.

- To check how many tokens a large file or text will cost **before** reading it:
  `count_tokens({text: "<content>"})`
- To log actual usage after a task completes (if the user asks):
  `log_usage({input_tokens: <est>, output_tokens: <est>, description: "<task>"})`
- To show the user their running session cost:
  `get_session_stats()`

Live dashboard URL is printed at startup next to "Token usage".

## Rules

- Do NOT use `rg`, `grep`, or bash file exploration before calling `graph_continue`.
- Do NOT do broad/recursive exploration at any confidence level.
- `max_supplementary_greps` and `max_supplementary_files` are hard caps - never exceed them.
- Do NOT dump full chat history.
- Do NOT call `graph_retrieve` more than once per turn.
- After edits, call `graph_register_edit` with the changed files. Use `file::symbol` notation (e.g. `src/auth.ts::handleLogin`) when the edit targets a specific function, class, or hook.

## Context Store

Whenever you make a decision, identify a task, note a next step, fact, or blocker during a conversation, call `graph_add_memory`.

**To add an entry:**

```
graph_add_memory(type="decision|task|next|fact|blocker", content="one sentence max 15 words", tags=["topic"], files=["relevant/file.ts"])
```

**Do NOT write context-store.json directly** — always use `graph_add_memory`. It applies pruning and keeps the store healthy.

**Rules:**

- Only log things worth remembering across sessions (not every minor detail)
- `content` must be under 15 words
- `files` lists the files this decision/task relates to (can be empty)
- Log immediately when the item arises — not at session end

## Session End

When the user signals they are done (e.g. "bye", "done", "wrap up", "end session"), proactively update `CONTEXT.md` in the project root with:

- **Current Task**: one sentence on what was being worked on
- **Key Decisions**: bullet list, max 3 items
- **Next Steps**: bullet list, max 3 items

Keep `CONTEXT.md` under 20 lines total. Do NOT summarize the full conversation — only what's needed to resume next session.
