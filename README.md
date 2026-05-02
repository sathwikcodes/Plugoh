# Plugoh

Plugoh is the influencer marketplace for brands and creators who want the campaign to move faster than the group chat.

It gives businesses one place to discover Instagram influencers, understand their fit, book reels/posts/stories, manage campaign delivery, and track payments. It gives influencers one place to build a sellable profile, receive campaign offers, upload deliverables, talk to brands, and see earnings.

The product is built for the messy middle of influencer marketing in India: the place where brands are ready to spend, creators are ready to collaborate, and the workflow is still trapped across DMs, screenshots, spreadsheets, unclear rates, and delayed follow-ups.

## What Plugoh Solves

Influencer campaigns usually fail in the handoff, not the idea.

A brand finds a creator on Instagram, sends a DM, waits, asks for rates, sends a brief, negotiates deliverables, loses the file link, follows up again, and then tracks payment somewhere else. The creator is doing the same thing from the other side, except across many brands at once.

Plugoh turns that into a structured marketplace flow:

```text
Create profile -> discover creator -> book campaign -> chat -> deliver content -> approve -> release payment
```

That means less guessing, less chasing, and less admin work for both sides.

## Who It Is For

### Businesses

Plugoh helps brands move from "we should work with influencers" to an actual campaign. Businesses can browse creator profiles, filter by fit, review packages, book campaigns, manage delivery, and keep communication tied to the campaign itself.

It is useful for:

- Local brands that want reels, posts, and stories without hiring an agency.
- D2C teams that need creator content quickly.
- Founders and marketers who want transparent campaign status instead of scattered DMs.
- Teams that care about creator discovery, delivery tracking, and payment clarity in one workflow.

### Influencers

Plugoh helps creators turn their Instagram presence into a clearer collaboration profile. Influencers can set up profile details, connect Instagram, show their niche and pricing, receive campaign offers, upload delivery files, track status, and see earnings over time.

It is useful for:

- Creators who want inbound brand deals without manually explaining the same details every time.
- Micro and nano influencers who need a professional storefront for collaborations.
- Creators who want campaign status, deliverables, conversations, and earnings in one dashboard.
- Influencers who want to spend more time creating and less time managing admin.

## Core Features

### Influencer Discovery

Businesses can search and filter active influencer profiles by place, category, pricing, followers, and engagement-oriented profile data. Discovery is designed to make shortlisting faster than scrolling Instagram manually.

### Creator Profiles

Influencers can maintain public-facing collaboration details like display name, bio, category, city, languages, content types, turnaround time, portfolio media, previous brands, and package pricing for reels, posts, and stories.

### Business Profiles

Brands can create business profiles with identity, type, location, Instagram connection state, and brand details. The goal is to make every offer feel like it comes from a real business, not a random message request.

### Campaign Booking

Businesses can start campaigns from an influencer profile, choose the package type, build a campaign brief, and move the collaboration into a structured campaign record.

### Campaign Management

Both sides get campaign dashboards. Businesses can track payment, delivery, progress, brief details, and chat. Influencers can review offers, accept or decline campaigns, see brand context, submit deliverables, and monitor campaign status.

### Delivery Uploads

Influencers can upload campaign deliverables directly through Plugoh. Brands can review the delivery from the campaign page instead of hunting through drive links or chat attachments.

### Inbox And Campaign Chat

Plugoh keeps communication close to the campaign. Messaging and call-request flows help brands and influencers coordinate without losing context.

### Payments And Escrow Flow

The app includes Razorpay-backed payment routes for booking orders, escrow orders, verification, capture, release, and automated release checks. Payment state is tied to campaign state so money movement is visible inside the product flow.

### Earnings Dashboard

Influencers get an earnings page with total earned, pending earnings, average per campaign, monthly data, milestones, tier progress, badges, and transaction history.

### Instagram Integration

Plugoh supports Instagram connection and media sync flows. This helps creator profiles become more useful and keeps Instagram as part of the collaboration loop without making Instagram DMs the operating system.

### AI-Assisted Profile Generation

The app includes AI endpoints for generating influencer and business profile text. Used well, this helps users get from blank profile to usable profile faster.

### Notifications And Automation

The backend includes email notification paths for delivery and call requests, plus cron-style auto-release routes for campaign/payment automation.

## What Plugoh Makes Faster

- Finding relevant creators.
- Comparing creators by niche, place, audience, and price.
- Turning a creator profile into a campaign offer.
- Moving from brief to delivery.
- Reviewing submitted content.
- Tracking campaign status.
- Understanding influencer earnings.
- Releasing payment after delivery.

## What Plugoh Avoids

- Cold DMs as the main workflow.
- Repeated "send your rates" conversations.
- Campaign briefs buried in chat.
- Deliverables scattered across links and attachments.
- Brands forgetting what stage a campaign is in.
- Creators waiting without visibility.
- Payment status living outside the campaign.
- Manual spreadsheets for basic collaboration tracking.

## Product Flow

```text
Business
  -> Onboard as brand
  -> Complete business profile
  -> Discover influencers
  -> Review influencer details
  -> Book reel/post/story campaign
  -> Pay through Razorpay flow
  -> Chat with influencer
  -> Review delivery
  -> Approve and release payment

Influencer
  -> Onboard as influencer
  -> Connect Instagram
  -> Complete creator profile
  -> Receive campaign offer
  -> Accept or decline
  -> Chat with brand
  -> Upload deliverable
  -> Track payout and earnings
```

## Application Areas

- `app/(landing)/` - public marketing site.
- `app/(auth)/login/` - email OTP login.
- `app/(auth)/onboarding/` - role selection and first profile setup.
- `app/dashboard/business/` - business dashboard, discovery, campaigns, inbox, and profile.
- `app/dashboard/influencer/` - influencer dashboard, campaigns, inbox, earnings, and profile.
- `app/api/instagram/` - Instagram connection and sync.
- `app/api/payment/` - Razorpay payment and escrow routes.
- `app/api/delivery/` - delivery upload API.
- `app/api/inbox/` - call request and inbox support APIs.
- `app/api/ai/` - AI profile generation endpoints.
- `app/api/cron/` - scheduled automation routes.
- `lib/trpc/routers/` - typed application API routers.
- `lib/supabase/` - Supabase clients and generated database types.

## Tech Stack

- Next.js App Router
- React
- TypeScript
- Supabase Auth and Postgres
- tRPC
- TanStack React Query
- React Hook Form
- Zod
- Tailwind CSS v4
- Framer Motion
- Razorpay
- Resend
- Google Gemini
- Sentry
- Vercel Analytics

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

Build for production:

```bash
npm run build
```

Run the production server:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

Format the codebase:

```bash
npm run style:format
```

## Environment Variables

The app expects environment variables for the services it integrates with. Values depend on your Supabase, Razorpay, Instagram, Resend, Sentry, and AI provider setup.

```bash
NEXT_PUBLIC_APP_URL=

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

NEXT_PUBLIC_INSTAGRAM_APP_ID=
INSTAGRAM_APP_ID=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

GEMINI_API_KEY=
NEXT_PUBLIC_SENTRY_DSN=

CRON_SECRET=
```

## Data Model

The generated Supabase types show the app is built around these main tables:

- `profiles`
- `user_roles`
- `business_profiles`
- `influencer_profiles`
- `campaigns`
- `campaign_messages`
- `campaign_files`
- `deliveries`
- `escrow_transactions`
- `influencer_payout_details`
- `instagram_media`
- `notifications`

The active app roles are:

- `business`
- `influencer`

## Important Notes

- `lib/supabase/types.ts` is generated from Supabase. Do not edit it manually.
- `components/ui/` contains shadcn/ui primitives. Treat them as shared UI building blocks.
- Dashboard access is role-aware and protected through the app auth context and protected route wrapper.
- The README describes the implemented product surface in this repository. Future roadmap ideas should stay separate from this file unless they are already shipped.

## Why This Matters

The influencer economy is growing, but the workflow is still too manual. Brands need speed and clarity. Creators need trust and predictable execution. Plugoh sits between them and makes the collaboration feel like a product instead of a negotiation thread.

That is the whole game: make the right collaboration easier to start, easier to manage, and easier to finish.
