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
  pre_authorized: {
    label: "Offer Expires Soon",
    shortLabel: "Pending",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    dot: "bg-amber-400",
    border: "border-l-amber-300",
    cardBg: "from-amber-500/10 to-orange-500/5",
  },
  requested: {
    label: "New Offer",
    shortLabel: "Pending",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    border: "border-l-amber-400",
    cardBg: "from-amber-500/8 to-yellow-500/5",
  },
  payment_pending: {
    label: "Awaiting Payment",
    shortLabel: "Pay now",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-400",
    border: "border-l-yellow-400",
    cardBg: "from-yellow-500/8 to-amber-500/5",
  },
  in_escrow: {
    label: "In Progress",
    shortLabel: "Active",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-400",
    border: "border-l-yellow-400",
    cardBg: "from-yellow-500/8 to-amber-500/5",
  },
  delivery_submitted: {
    label: "Review Delivery",
    shortLabel: "Active",
    badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-400",
    border: "border-l-yellow-400",
    cardBg: "from-yellow-500/8 to-amber-500/5",
  },
  completed: {
    label: "Completed",
    shortLabel: "Done",
    badge: "bg-green-500/15 text-green-400 border-green-500/20",
    dot: "bg-green-400",
    border: "border-l-green-400",
    cardBg: "from-green-500/8 to-emerald-500/5",
  },
  disputed: {
    label: "Disputed",
    shortLabel: "Disputed",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    border: "border-l-red-400",
    cardBg: "from-red-500/8 to-rose-500/5",
  },
  declined: {
    label: "Declined",
    shortLabel: "Declined",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    border: "border-l-red-400",
    cardBg: "from-red-500/8 to-rose-500/5",
  },
  expired: {
    label: "Expired",
    shortLabel: "Expired",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    border: "border-l-red-400",
    cardBg: "from-red-500/8 to-rose-500/5",
  },
  cancelled: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    border: "border-l-red-400",
    cardBg: "from-red-500/8 to-rose-500/5",
  },
  refunded: {
    label: "Refunded",
    shortLabel: "Refunded",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    border: "border-l-red-400",
    cardBg: "from-red-500/8 to-rose-500/5",
  },
  // Legacy aliases for backward compatibility with migrated data
  pending: {
    label: "New Offer",
    shortLabel: "Pending",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    dot: "bg-amber-400",
    border: "border-l-amber-400",
    cardBg: "from-amber-500/8 to-yellow-500/5",
  },
  accepted: {
    label: "In Progress",
    shortLabel: "Active",
    badge: "bg-green-500/15 text-green-400 border-green-500/20",
    dot: "bg-emerald-400",
    border: "border-l-green-400",
    cardBg: "from-green-500/8 to-emerald-500/5",
  },
  rejected: {
    label: "Declined",
    shortLabel: "Declined",
    badge: "bg-red-500/15 text-red-400 border-red-500/20",
    dot: "bg-red-400",
    border: "border-l-red-400",
    cardBg: "from-red-500/8 to-rose-500/5",
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
    fromClass: "from-rose-400",
    toClass: "to-pink-500",
    borderClass: "border-rose-400/30",
    bgClass: "from-rose-400/10 to-pink-500/10",
    textClass: "text-rose-400",
    barClass: "from-rose-400 to-pink-400",
  },
  {
    name: "Creator",
    threshold: 25000,
    next: 100000,
    emoji: "/star.png",
    fromClass: "from-amber-400",
    toClass: "to-orange-500",
    borderClass: "border-amber-400/30",
    bgClass: "from-amber-400/10 to-orange-500/10",
    textClass: "text-amber-400",
    barClass: "from-amber-400 to-orange-400",
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
