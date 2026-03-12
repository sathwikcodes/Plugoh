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
