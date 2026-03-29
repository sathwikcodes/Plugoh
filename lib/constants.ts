export const CATEGORIES = [
  "Food",
  "Fitness",
  "Beauty",
  "Lifestyle",
  "Travel",
  "Education",
  "Tech",
  "Fashion",
  "Other",
] as const;

export const CATEGORIES_WITH_ALL = ["All", ...CATEGORIES] as const;

export const LANGUAGES = [
  "English",
  "Hindi",
  "Telugu",
  "Tamil",
  "Kannada",
  "Malayalam",
  "Marathi",
  "Bengali",
  "Gujarati",
  "Punjabi",
  "Urdu",
  "Other",
] as const;

export const CONTENT_TYPES = [
  "Product Reviews",
  "Tutorials",
  "Vlogs",
  "Reels/Shorts",
  "Stories",
  "Unboxing",
  "Recipe",
  "Before/After",
  "Day in Life",
  "Brand Integration",
] as const;

export const TURNAROUND_OPTIONS = [
  "24_hours",
  "2_3_days",
  "1_week",
  "2_weeks",
] as const;

export const TURNAROUND_LABELS: Record<string, string> = {
  "24_hours": "24 hours",
  "2_3_days": "2-3 days",
  "1_week": "1 week",
  "2_weeks": "2 weeks",
};

export const PACKAGE_TYPES = [
  "reel",
  "post",
  "story",
  "reel+story",
  "reel+post",
] as const;

export const BUSINESS_TYPES = [
  "Restaurant / Cafe",
  "D2C Brand",
  "Local Business",
  "E-commerce",
  "SaaS / Tech",
  "Agency",
  "Personal Brand",
  "Other",
] as const;

// ─── Campaign Status Config ─────────────────────────────────────────────────
// State machine: requested → payment_pending → in_escrow → delivery_submitted → completed
// Also: requested → declined | expired | cancelled
//       delivery_submitted → disputed → completed | refunded
export const CAMPAIGN_STATUS_CONFIG = {
  // Brand submitted booking request, awaiting influencer response (no payment taken)
  requested: {
    label: "New Offer",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    border: "border-l-amber-400",
    cardBg: "from-amber-500/8 to-yellow-500/5",
  },
  // Influencer accepted, waiting for brand to complete payment
  payment_pending: {
    label: "Awaiting Payment",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    border: "border-l-yellow-400",
    cardBg: "from-yellow-500/8 to-amber-500/5",
  },
  // Brand paid, funds locked in escrow, influencer is working
  in_escrow: {
    label: "In Progress",
    badge: "bg-green-500/15 text-green-400 border-green-500/20",
    border: "border-l-green-400",
    cardBg: "from-green-500/8 to-emerald-500/5",
  },
  // Influencer submitted delivery proof, brand needs to approve (7-day auto-release)
  delivery_submitted: {
    label: "Review Delivery",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    border: "border-l-blue-400",
    cardBg: "from-blue-500/8 to-cyan-500/5",
  },
  // Brand approved (or auto-released), payout sent to influencer
  completed: {
    label: "Completed",
    badge: "bg-violet-500/15 text-violet-400 border-violet-500/20",
    border: "border-l-violet-400",
    cardBg: "from-violet-500/8 to-purple-500/5",
  },
  // Brand raised dispute on delivery, admin reviewing
  disputed: {
    label: "Disputed",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    border: "border-l-red-400",
    cardBg: "from-red-500/8 to-rose-500/5",
  },
  // Influencer declined the booking request
  declined: {
    label: "Declined",
    badge: "bg-white/5 text-muted-foreground border-white/10",
    border: "border-l-white/10",
    cardBg: "from-transparent to-transparent",
  },
  // No response within 48h (influencer) or 24h (brand after acceptance)
  expired: {
    label: "Expired",
    badge: "bg-white/5 text-muted-foreground border-white/10",
    border: "border-l-white/10",
    cardBg: "from-transparent to-transparent",
  },
  // Brand cancelled before any response
  cancelled: {
    label: "Cancelled",
    badge: "bg-white/5 text-muted-foreground border-white/10",
    border: "border-l-white/10",
    cardBg: "from-transparent to-transparent",
  },
  // Admin resolved dispute in brand's favour, refund sent
  refunded: {
    label: "Refunded",
    badge: "bg-white/5 text-muted-foreground border-white/10",
    border: "border-l-white/10",
    cardBg: "from-transparent to-transparent",
  },
  // Legacy aliases kept for backward compatibility with migrated data
  pending: {
    label: "New Offer",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    border: "border-l-amber-400",
    cardBg: "from-amber-500/8 to-yellow-500/5",
  },
  accepted: {
    label: "In Progress",
    badge: "bg-green-500/15 text-green-400 border-green-500/20",
    border: "border-l-green-400",
    cardBg: "from-green-500/8 to-emerald-500/5",
  },
  rejected: {
    label: "Declined",
    badge: "bg-white/5 text-muted-foreground border-white/10",
    border: "border-l-white/10",
    cardBg: "from-transparent to-transparent",
  },
} as const;

export type CampaignStatus = keyof typeof CAMPAIGN_STATUS_CONFIG;

// Platform commission rate (12% charged to brand on top of influencer price)
export const PLATFORM_FEE_RATE = 0.12;

// ─── Earnings Tier Config ────────────────────────────────────────────────────
export const TIERS = [
  {
    name: "Rising Star",
    threshold: 0,
    next: 25000,
    emoji: "/star.png",
    fromClass: "from-emerald-500",
    toClass: "to-teal-500",
    borderClass: "border-emerald-500/30",
    bgClass: "from-emerald-500/10 to-teal-500/10",
    textClass: "text-emerald-400",
    barClass: "from-emerald-500 to-teal-400",
  },
  {
    name: "Creator",
    threshold: 25000,
    next: 100000,
    emoji: "/star.png",
    fromClass: "from-blue-500",
    toClass: "to-indigo-500",
    borderClass: "border-blue-500/30",
    bgClass: "from-blue-500/10 to-indigo-500/10",
    textClass: "text-blue-400",
    barClass: "from-blue-500 to-indigo-400",
  },
  {
    name: "Pro Creator",
    threshold: 100000,
    next: 500000,
    emoji: "/star.png",
    fromClass: "from-amber-500",
    toClass: "to-orange-500",
    borderClass: "border-amber-500/30",
    bgClass: "from-amber-500/10 to-orange-500/10",
    textClass: "text-amber-400",
    barClass: "from-amber-500 to-orange-400",
  },
  {
    name: "Elite Creator",
    threshold: 500000,
    next: 1500000,
    emoji: "/star.png",
    fromClass: "from-violet-500",
    toClass: "to-purple-500",
    borderClass: "border-violet-500/30",
    bgClass: "from-violet-500/10 to-purple-500/10",
    textClass: "text-violet-400",
    barClass: "from-violet-500 to-purple-400",
  },
  {
    name: "Top Creator",
    threshold: 1500000,
    next: null,
    emoji: "/star.png",
    fromClass: "from-yellow-400",
    toClass: "to-amber-300",
    borderClass: "border-yellow-400/30",
    bgClass: "from-yellow-400/10 to-amber-300/10",
    textClass: "text-yellow-400",
    barClass: "from-yellow-400 to-amber-300",
  },
] as const;

export const MILESTONES = [
  10000, 25000, 50000, 100000, 250000, 500000, 1000000,
];

// ─── Complete Profile Content Types ──────────────────────────────────────────
export const INFLUENCER_CONTENT_TYPES = [
  "Reels",
  "Stories",
  "Static Posts",
  "UGC",
  "Product Reviews",
  "Tutorials",
  "Unboxing",
  "Behind the Scenes",
  "Event Coverage",
] as const;
