# Plugoh — Codebase Reference

> **Purpose of this file:** A complete, agent-readable reference covering product behavior, user flows, file structure, and data layer. Use this before exploring the codebase — it answers most "what does X do" questions without additional file reads.

---

## 1. What is Plugoh?

Plugoh is an **influencer marketplace for India** that connects brand owners with Instagram creators. Brands discover influencers, book them for content deliverables (Reels, Posts, Stories), pay via escrow, and release funds after approving the delivered work. Influencers receive earnings, track them on a gamified earnings page, and progress through creator tiers.

**Two primary user roles:**

- **Brand Owner (business)** — discovers and books influencers, manages campaigns, tracks spend
- **Influencer (influencer)** — receives booking offers, delivers content, earns money

---

## 2. User Flows

### 2.1 Entry & Authentication

```
Landing Page (/)
  └── "Get Started" CTA
        └── /login
              ├── Email + OTP (6-digit, 60s resend timer)
              └── Google OAuth (Supabase)
```

New users → `/onboarding` (role not yet assigned)
Returning users → redirected to their role dashboard

### 2.2 Onboarding & Profile Creation

Both brand owners and influencers go through the same onboarding form at `/onboarding`, then diverge:

**Step 1 — Common fields (both roles):**

- Full name
- Phone number
- Location (city/region)

**Step 2 — Instagram connection:**

- User is prompted to connect their Instagram account via OAuth
- OAuth callback: `/api/auth/callback/instagram`
- After OAuth, Instagram data is synced via `/api/instagram/sync`

**Step 3 — AI profile generation:**

- **Influencer path:** Instagram data (handle, followers, engagement rate, media) + manual fields → POST `/api/ai/generate-profile` → Claude API builds a complete influencer profile (bio, categories, content types, languages, pricing skeleton)
- **Brand owner path:** If Instagram is connected, same flow → POST `/api/ai/generate-business-profile`. If no Instagram, user manually fills in brand name, business type, and brief — then AI still generates the profile description.

After onboarding completes:

- `user_roles` row is created with the selected role
- `influencer_profiles` or `business_profiles` row is upserted with AI-generated data
- User is redirected to their role dashboard

### 2.3 Discover & Book (Brand Owner Flow)

```
/dashboard/business/discover
  └── Browse influencer cards (filters: category, language, follower range, price)
        └── Click influencer card
              └── /dashboard/business/discover/[id]
                    └── Full influencer profile (stats, packages, portfolio, Instagram)
                          └── "Book Now" button
                                └── /dashboard/business/discover/[id]/book
                                      └── Booking form (package type, brief, dates)
                                            └── Razorpay pre-authorisation
```

**Booking form fields:**

- Package type (Reel / Post / Story / Reel+Story / Reel+Post)
- Campaign brief / requirements
- Turnaround expectation

**Payment — Razorpay pre-authorisation:**

- A Razorpay order is created via `/api/payment/create-booking-order`
- The brand's card is **pre-authorised** (tokenised/logged) — money is NOT charged yet
- On successful pre-auth, the campaign record is created with `status: "requested"`
- The brand sees the booking as "Pending influencer acceptance"

### 2.4 Accept / Reject Window (Influencer Flow)

- Influencer receives the booking offer in their campaigns list
- **24-hour window** to accept or reject
- If no action within 24h → campaign auto-expires (`status: "expired"`)
- A cron job at `/api/cron/auto-release` handles automatic expiry

**On Acceptance:**

1. Influencer clicks Accept → `campaign.acceptBooking()` TRPC mutation
2. The pre-authorised card is **captured** (charged) via `/api/payment/capture-booking-payment`
3. Funds are placed in **escrow** (`status: "in_escrow"`, `payment_status: "paid"`)
4. Messaging (Inbox) between brand and influencer is **unlocked**

**On Rejection:**

- Campaign moves to `status: "declined"`
- Pre-auth is released/voided — brand is not charged

### 2.5 Campaign Execution & Delivery

Once accepted and paid:

1. Chat is open — brand and influencer coordinate via `/dashboard/*/inbox`
2. Influencer submits deliverable (URL/file) via campaign detail page
3. Campaign moves to `status: "delivery_submitted"`
4. Brand reviews the work and approves it

**On Approval:**

- `/api/payment/release-escrow` is called
- Escrow funds are released to the influencer's account
- Campaign moves to `status: "completed"`
- Earnings record is created in the `earnings` table

**Auto-release safety net:**

- If brand does not approve within 7 days of delivery, `/api/cron/auto-release` automatically releases escrow to the influencer

### 2.6 Campaign Status State Machine

```
requested
  ├── (influencer accepts + payment captured) → in_escrow
  │     ├── (influencer submits delivery) → delivery_submitted
  │     │     ├── (brand approves) → completed
  │     │     └── (dispute raised) → disputed
  │     └── (cancelled) → cancelled / refunded
  ├── (influencer declines) → declined
  └── (24h passes) → expired
```

**Platform fee:** 12% on the influencer's quoted price, charged to the brand on top.

```
total_charged = influencer_price + (influencer_price × 0.12)
```

### 2.7 Spending Page (Brand Owner)

- Route: `/dashboard/business/profile` → Spending tab
- Shows all completed campaigns, amounts spent, date breakdowns
- `SpendStats` component on dashboard home shows quick summary

### 2.8 Earnings Page (Influencer)

- Route: `/dashboard/influencer/earnings`
- Gamified experience with tiers, milestones, and achievements

**Tiers (by total lifetime earnings):**

| Tier          | Threshold  |
| ------------- | ---------- |
| Rising Star   | ₹0         |
| Creator       | ₹25,000    |
| Pro Creator   | ₹1,00,000  |
| Elite Creator | ₹5,00,000  |
| Top Creator   | ₹15,00,000 |

**Components:**

- `TierHeroCard` — current tier badge and progress bar
- `EarningsChart` — earnings over time (Recharts)
- `StatsRow` — quick stats (followers, engagement)
- `MilestoneCard` — next milestone target
- `AchievementsStrip` — unlocked achievement badges

---

## 3. Future Roadmap (Not Yet Built)

- **Brand-created campaigns:** Brand owners post a campaign brief, influencers apply with a bid price, brand selects the best fit.

---

## 4. Tech Stack

| Layer          | Technology                                         |
| -------------- | -------------------------------------------------- |
| Framework      | Next.js 16 (App Router)                            |
| Auth & DB      | Supabase (email OTP + Google OAuth + PostgreSQL)   |
| Mutations      | tRPC v11                                           |
| Server state   | TanStack React Query v5                            |
| Styling        | Tailwind CSS v4 + CSS variables (dark mode forced) |
| Components     | shadcn/ui                                          |
| Animations     | Framer Motion                                      |
| Payments       | Razorpay (pre-auth + escrow)                       |
| AI             | Anthropic Claude API (`@anthropic-ai/sdk`)         |
| Error tracking | Sentry                                             |
| Analytics      | Vercel Analytics                                   |
| Forms          | React Hook Form + Zod                              |
| Charts         | Recharts                                           |
| Toasts         | Sonner                                             |
| Icons          | Lucide React                                       |
| Phone input    | react-phone-number-input                           |

---

## 5. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

INSTAGRAM_CLIENT_ID=
INSTAGRAM_CLIENT_SECRET=

ANTHROPIC_API_KEY=
GOOGLE_GENERATIVE_AI_KEY=      # Gemini (fallback)

SENTRY_AUTH_TOKEN=
```

---

## 6. Directory Structure

```
plugoh/
├── app/                          Next.js App Router
│   ├── (auth)/                   Auth route group (no dashboard shell)
│   │   ├── login/page.tsx        Email OTP login page
│   │   ├── onboarding/page.tsx   Role selection + profile creation
│   │   └── layout.tsx
│   ├── (landing)/                Landing page group
│   │   ├── page.tsx              Homepage (hero, features, FAQ, CTA, footer)
│   │   └── _components/          Landing section components (see §7.1)
│   ├── api/                      API route handlers
│   │   ├── auth/callback/instagram/route.ts   Instagram OAuth callback
│   │   ├── ai/
│   │   │   ├── generate-profile/route.ts       Influencer AI profile gen
│   │   │   └── generate-business-profile/route.ts  Brand AI profile gen
│   │   ├── instagram/
│   │   │   ├── connect/route.ts               Initiate Instagram OAuth
│   │   │   └── sync/route.ts                  Sync IG media after OAuth
│   │   ├── payment/
│   │   │   ├── create-booking-order/route.ts  Create Razorpay order
│   │   │   ├── verify-booking-payment/route.ts
│   │   │   ├── capture-booking-payment/route.ts  Capture pre-auth
│   │   │   ├── create-escrow-order/route.ts
│   │   │   ├── verify-escrow/route.ts
│   │   │   └── release-escrow/route.ts        Release funds to influencer
│   │   ├── cron/auto-release/route.ts         Auto-release after 7 days
│   │   └── trpc/[trpc]/route.ts               tRPC handler
│   ├── dashboard/
│   │   ├── layout.tsx            Dashboard shell (ProtectedRoute + docks)
│   │   ├── business/             Brand owner dashboard (see §7.2)
│   │   └── influencer/           Influencer dashboard (see §7.3)
│   ├── layout.tsx                Root layout (providers, theme, fonts)
│   └── globals.css
│
├── components/
│   ├── ui/                       shadcn/ui + custom UI components (do not edit generated)
│   ├── shared/                   App-level shared components (see §7.4)
│   ├── auth/                     Auth page layout components
│   ├── inbox/                    Shared inbox/chat components
│   ├── campaign/                 Campaign chat components
│   └── landing/                  (mirrors app/(landing)/_components)
│
├── contexts/
│   └── auth-context.tsx          Global auth state — user, role, profile, onboarding flags
│
├── hooks/
│   ├── queries/                  React Query data-fetching hooks (see §8.2)
│   ├── use-campaign-counts.ts
│   ├── use-dock-auto-hide.ts
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts             Browser Supabase singleton
│   │   ├── server.ts             Server-side auth helpers
│   │   └── types.ts              Auto-generated DB types (DO NOT EDIT)
│   ├── trpc/
│   │   ├── init.ts               tRPC context, procedures
│   │   ├── client.ts             React Query integration
│   │   └── routers/              campaign.ts, profile.ts, campaign-file.ts, _app.ts
│   ├── instagram/api.ts          Instagram Graph API helpers
│   ├── ai/generate-profile.ts    Claude API profile generation
│   ├── utils.ts                  cn() — class merging utility
│   ├── constants.ts              Enums, status configs, tiers, fee rate (see §9)
│   ├── format.ts                 formatCurrency(), timeAgo(), formatDate()
│   ├── animations.ts             Framer Motion presets (stagger, fadeUp, slideIn)
│   ├── profile-utils.ts          Profile completeness / strength helpers
│   ├── business-profile.ts       isBusinessProfileComplete(), getBusinessDisplayName()
│   ├── booking.ts                buildCampaignTitle(), BookingFormState
│   └── file-upload.ts            uploadFile(), deleteFile() (Supabase Storage)
│
├── supabase/
│   └── migrations/               Database migration SQL files
│
├── CLAUDE.md                     Claude Code + gstack skills guide
├── CODEBASE.md                   This file
└── README.md                     Stock Next.js template (ignore)
```

---

## 7. Key Pages & Components

### 7.1 Landing Page (`app/(landing)/`)

| Component                                           | Purpose                                 |
| --------------------------------------------------- | --------------------------------------- |
| `_components/hero-section.tsx`                      | Main headline, subtext, Get Started CTA |
| `_components/features-primary-section.tsx`          | Primary feature grid                    |
| `_components/features-alt-section.tsx`              | Alternate layout feature section        |
| `_components/feature-carousel-section.tsx`          | Animated feature carousel               |
| `_components/clients-section.tsx`                   | Logo cloud / social proof               |
| `_components/faq-section.tsx` + `faq-accordion.tsx` | FAQ with accordion                      |
| `_components/cta-section.tsx`                       | Bottom call-to-action                   |
| `_components/footer.tsx`                            | Footer with links                       |

### 7.2 Business Dashboard (`app/dashboard/business/`)

| Route / File                                   | Purpose                                                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `page.tsx`                                     | Dashboard home: SpendStats, ActiveCampaignsOverview, BrandInsights, RecentActivity, QuickActions |
| `discover/page.tsx`                            | Influencer discovery with search/filter (category, language, price, followers)                   |
| `discover/[id]/page.tsx`                       | Full influencer profile: stats, packages, portfolio, Instagram tab                               |
| `discover/[id]/book/page.tsx`                  | Booking form + Razorpay pre-auth flow                                                            |
| `discover/[id]/_components/booking-drawer.tsx` | Mobile booking drawer variant                                                                    |
| `campaigns/page.tsx`                           | All campaigns (paginated, filterable by status)                                                  |
| `campaigns/[id]/page.tsx`                      | Campaign detail: brief, status, delivery, chat                                                   |
| `profile/page.tsx`                             | Brand profile with tabs: Overview, Analytics, Instagram, Spending, Settings                      |
| `inbox/page.tsx`                               | Messaging with influencers (only unlocked campaigns)                                             |
| `settings/page.tsx`                            | Account settings                                                                                 |

### 7.3 Influencer Dashboard (`app/dashboard/influencer/`)

| Route / File                | Purpose                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `page.tsx`                  | Dashboard home: PulseStats, TopContent, CreatorInsights, RecentActivity, QuickActions |
| `earnings/page.tsx`         | Gamified earnings: TierHeroCard, EarningsChart, MilestoneCard, AchievementsStrip      |
| `profile/page.tsx`          | Creator profile with tabs: Overview, Career, Portfolio, Instagram, Pricing, Settings  |
| `complete-profile/page.tsx` | Multi-step profile wizard: StepProfile → StepPackages → StepPortfolio → StepPreview   |
| `campaigns/page.tsx`        | All received booking offers and active campaigns                                      |
| `campaigns/[id]/page.tsx`   | Campaign detail: accept/reject, submit delivery, view chat                            |
| `inbox/page.tsx`            | Messaging with brands                                                                 |
| `onboarding/page.tsx`       | Influencer-specific onboarding step                                                   |

### 7.4 Shared Components (`components/shared/`)

| File                         | Purpose                                                                |
| ---------------------------- | ---------------------------------------------------------------------- |
| `providers.tsx`              | Wraps app: QueryClient + tRPC + AuthProvider + ThemeProvider + Toaster |
| `protected-route.tsx`        | Auth guard — redirects unauthenticated users to /login                 |
| `navbar.tsx`                 | Top navigation bar (landing + auth pages)                              |
| `business-sidebar.tsx`       | Left sidebar for business dashboard (desktop)                          |
| `business-dock.tsx`          | Bottom dock for business dashboard (mobile, macOS style)               |
| `influencer-sidebar.tsx`     | Left sidebar for influencer dashboard (desktop)                        |
| `influencer-dock.tsx`        | Bottom dock for influencer dashboard (mobile)                          |
| `dashboard-top-bar.tsx`      | Top bar inside dashboard (breadcrumbs, user menu, notifications)       |
| `dock-auto-hide-wrapper.tsx` | Hides dock on scroll down, shows on scroll up                          |
| `notification-drawer.tsx`    | Slide-out notification panel                                           |
| `campaign-cards.tsx`         | Reusable campaign card grid                                            |

---

## 8. Data Layer

### 8.1 Auth Context (`contexts/auth-context.tsx`)

```typescript
interface AuthContextType {
  user: User | null; // Supabase User object
  session: Session | null; // Active auth session
  role: "business" | "influencer" | null; // From user_roles table
  profile: Profile | null; // From profiles table
  loading: boolean; // True until auth initialized
  needsOnboarding: boolean; // No role assigned yet
  isProfileComplete: boolean; // Profile fields filled
  signInWithOtp(email: string): Promise<void>;
  verifyOtp(email: string, token: string): Promise<void>;
  signOut(): Promise<void>;
  refreshUserData(): Promise<void>;
}
```

Usage: `const { user, role, profile, loading } = useAuth()`

### 8.2 Query Hooks (`hooks/queries/`)

| Hook                                    | Returns              | Purpose                           |
| --------------------------------------- | -------------------- | --------------------------------- |
| `useCampaigns(userId, role)`            | Campaign[]           | All campaigns for user            |
| `useInfluencerProfiles()`               | InfluencerProfile[]  | All influencers (for Discover)    |
| `useMyInfluencerProfile(userId)`        | InfluencerProfile    | Current influencer's profile      |
| `useMyBusinessProfile(userId)`          | BusinessProfile      | Current brand's profile           |
| `useInstagramMedia(userId)`             | InstagramMedia[]     | User's synced IG media            |
| `useInboxConversations(userId)`         | Conversation[]       | Influencer inbox threads          |
| `useBusinessInboxConversations(userId)` | Conversation[]       | Brand inbox threads               |
| `useCampaignMessages(campaignId)`       | Message[]            | Messages in a campaign (realtime) |
| `useEarningsSummary(userId)`            | EarningsSummary      | Total + monthly earnings          |
| `useUnreadCounts(role)`                 | { inbox, campaigns } | Badge counts                      |

### 8.3 tRPC Procedures (`lib/trpc/routers/`)

**Campaign mutations (`campaign.ts`):**

- `submitBookingRequest()` — Create campaign record (pre-payment)
- `acceptBooking()` — Influencer accepts; triggers payment capture
- `rejectBooking()` — Influencer rejects; voids pre-auth
- `submitDelivery()` — Influencer submits delivery URL/proof
- `approveDelivery()` — Brand approves; triggers escrow release
- `createPaymentOrder()` — Initiate Razorpay order

**Profile mutations (`profile.ts`):**

- `updateProfile()` — Update profiles table
- `updateInfluencerProfile()` — Update influencer_profiles table
- `updateBusinessProfile()` — Update business_profiles table
- `getMyProfile()` — Fetch current user profile

### 8.4 Database Tables

| Table                 | Key Columns                                                                                                                                                                          | Purpose                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `profiles`            | id, email, full_name, phone, location, avatar_url, bio                                                                                                                               | Base user data (all roles)             |
| `user_roles`          | user_id, role (enum)                                                                                                                                                                 | Role assignment; also gates onboarding |
| `influencer_profiles` | user_id, ig_handle, ig_followers_count, avg_likes_per_reel, engagement_rate, categories[], languages[], content_types[], portfolio_items[], pricing{reel,post,story}, tier, verified | Full influencer profile                |
| `business_profiles`   | user_id, brand_name, brand_type, location, ig_handle, bio                                                                                                                            | Brand profile                          |
| `campaigns`           | business_id, influencer_id, package_type, price_offered, platform_fee_amount, total_charged_amount, status, payment_status, delivery_url, expires_at                                 | Core booking/campaign record           |
| `campaign_messages`   | campaign_id, sender_id, content, attachments[]                                                                                                                                       | In-campaign chat messages              |
| `inbox_conversations` | participant_1_id, participant_2_id, last_message_at                                                                                                                                  | Conversation thread metadata           |
| `earnings`            | influencer_id, campaign_id, amount, status (pending/released/withdrawn)                                                                                                              | Influencer earnings ledger             |

---

## 9. Key Constants (`lib/constants.ts`)

```typescript
PLATFORM_FEE_RATE = 0.12  // 12% charged to brand on top of influencer price

CAMPAIGN_STATUS_CONFIG keys:
  requested | payment_pending | in_escrow | delivery_submitted |
  completed | disputed | declined | expired | cancelled | refunded

PACKAGE_TYPES = ["reel", "post", "story", "reel+story", "reel+post"]

BUSINESS_TYPES = ["Restaurant / Cafe", "D2C Brand", "Local Business",
  "E-commerce", "SaaS / Tech", "Agency", "Personal Brand", "Other"]

TIERS = [
  { name: "Rising Star",   threshold: 0,        next: 25_000 },
  { name: "Creator",       threshold: 25_000,   next: 1_00_000 },
  { name: "Pro Creator",   threshold: 1_00_000, next: 5_00_000 },
  { name: "Elite Creator", threshold: 5_00_000, next: 15_00_000 },
  { name: "Top Creator",   threshold: 15_00_000, next: null },
]

MILESTONES = [10_000, 25_000, 50_000, 1_00_000, 2_50_000, 5_00_000, 10_00_000]
```

---

## 10. Conventions & Patterns

### Routing & Auth

- `ProtectedRoute` (`components/shared/protected-route.tsx`) wraps all `/dashboard/*` routes
- After login, redirect logic reads `role` from AuthContext:
  - `business` → `/dashboard/business`
  - `influencer` → `/dashboard/influencer`
  - No role → `/onboarding`
- `needsOnboarding` flag in AuthContext = `user_roles` row does not exist yet

### Styling

- `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for all conditional classes
- Dark mode is forced globally via ThemeProvider in `app/layout.tsx`
- CSS variables used for all color tokens (defined in `app/globals.css`)
- Animations: use presets from `lib/animations.ts` — `fadeUp`, `stagger`, `slideIn`

### Data Fetching

- **Reads:** React Query hooks in `hooks/queries/`
- **Writes/Mutations:** tRPC procedures via `trpcClient` (returns React Query mutation hooks)
- Do not call Supabase directly from components — go through hooks or tRPC

### Forms

- React Hook Form + Zod for all forms
- Phone number field: always use `PhoneInput` from `components/ui/phone-input.tsx`
- Toasts: `toast.success()` / `toast.error()` from Sonner via `useToast()`

### Mobile Navigation

- Desktop: sidebar (`business-sidebar.tsx` / `influencer-sidebar.tsx`)
- Mobile: macOS-style bottom dock (`business-dock.tsx` / `influencer-dock.tsx`)
- `dock-auto-hide-wrapper.tsx` hides dock on scroll for more content space

### File Uploads

- Use `lib/file-upload.ts` → `uploadFile()` / `deleteFile()` (Supabase Storage)
- Campaign deliverables uploaded via `lib/trpc/routers/campaign-file.ts`

### Error Handling

- Sentry configured in `sentry.server.config.ts` and `sentry.edge.config.ts`
- `app/error.tsx` and `app/global-error.tsx` for route-level error boundaries
- Each dashboard has its own `error.tsx` boundary

---

## 11. Development Commands

```bash
npm run dev           # Start dev server → localhost:3000
npm run build         # Production build
npm run lint          # ESLint
npm run style:format  # Prettier format
```

No test suite is configured.
