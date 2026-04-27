import type { Database } from "@/lib/supabase/types";

export type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export type BookingObjective =
  | "visit_place"
  | "feature_product"
  | "showcase_service"
  | "promote_offer"
  | "brand_shoutout";

export type BookingTimingMode = "asap" | "choose_date";

export type BookablePackage = "reel" | "post" | "story";

export type ContentStyle =
  | "honest_review"
  | "aesthetic"
  | "fun_quirky"
  | "tutorial"
  | "day_in_life"
  | "unboxing";

const LEGACY_CONTENT_STYLE_LABELS: Record<string, string> = {
  honest_review: "Honest review",
  aesthetic: "Aesthetic",
  fun_quirky: "Fun & quirky",
  tutorial: "Tutorial-style",
  day_in_life: "Day-in-life",
  unboxing: "Unboxing",
};

export function getContentStyleLabel(style: ContentStyle): string {
  return LEGACY_CONTENT_STYLE_LABELS[style] ?? style;
}

export interface BookingFormState {
  objective: BookingObjective;
  packageType: BookablePackage;
  timingMode: BookingTimingMode;
  dueDate: string;
  venueAddress: string;
  contactEmail: string;
  contactPhone: string;
}

export const BOOKING_OBJECTIVES: Array<{
  value: BookingObjective;
  label: string;
  shortLabel: string;
  needsEventName?: boolean;
  description: string;
}> = [
  {
    value: "visit_place",
    label: "Visit my place",
    shortLabel: "Visit",
    needsEventName: true,
    description:
      "Drive footfall to a physical venue — restaurant, gym, salon, studio, or store.",
  },
  {
    value: "feature_product",
    label: "Feature my product",
    shortLabel: "Product",
    description: "Show off a specific product — D2C, fashion, jewellery, tech.",
  },
  {
    value: "showcase_service",
    label: "Showcase my service",
    shortLabel: "Service",
    description:
      "Highlight a service — salon treatment, training session, class, or consult.",
  },
  {
    value: "promote_offer",
    label: "Promote an offer / launch",
    shortLabel: "Offer",
    description: "Sale, new opening, limited-time deal, or launch moment.",
  },
  {
    value: "brand_shoutout",
    label: "Brand shout-out",
    shortLabel: "Shout-out",
    description: "Pure awareness — tag, mention, vibe-match content.",
  },
];

const LEGACY_OBJECTIVE_LABELS: Record<string, string> = {
  product_launch: "Feature my product",
  restaurant_visit: "Visit my place",
  brand_awareness: "Brand shout-out",
  ugc: "Feature my product",
  event_coverage: "Visit my place",
};

export const BOOKING_TIMING_OPTIONS: Array<{
  value: BookingTimingMode;
  label: string;
  description: string;
}> = [
  {
    value: "asap",
    label: "Instant",
    description: "Fastest possible turnaround",
  },
  {
    value: "choose_date",
    label: "Choose date",
    description: "Set an exact deadline",
  },
];

export function getEngagementRate(
  likes: number | null,
  followers: number | null,
): number {
  if (!likes || !followers || followers <= 0) return 0;
  return (likes / followers) * 100;
}

export function getCreatorTier(followers: number | null): string {
  if (!followers || followers < 10_000) return "Nano";
  if (followers < 100_000) return "Micro";
  if (followers < 500_000) return "Mid";
  return "Macro";
}

export function getProfileInitials(name: string | null): string {
  return (name?.trim() || "Influencer")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getStartsAtPrice(profile: InfluencerProfile): number | null {
  const prices = [
    profile.price_per_reel,
    profile.price_per_post,
    profile.price_per_story,
  ].filter((value): value is number => typeof value === "number" && value > 0);

  return prices.length > 0 ? Math.min(...prices) : null;
}

export function getObjectiveMeta(objective: BookingObjective) {
  return BOOKING_OBJECTIVES.find((item) => item.value === objective);
}

export function getObjectiveLabel(objective: string): string {
  return (
    BOOKING_OBJECTIVES.find((item) => item.value === objective)?.label ??
    LEGACY_OBJECTIVE_LABELS[objective] ??
    "Campaign"
  );
}

export function shouldShowEventName(objective: BookingObjective) {
  return Boolean(getObjectiveMeta(objective)?.needsEventName);
}

export function getPackageLabel(packageType: BookablePackage) {
  if (packageType === "reel") return "Reel";
  if (packageType === "post") return "Post";
  return "Story";
}

export function getAvailablePackages(profile: InfluencerProfile) {
  const packages: Array<{
    key: BookablePackage;
    label: string;
    description: string;
    price: number;
  }> = [];

  if (profile.price_per_reel) {
    packages.push({
      key: "reel",
      label: "Reel",
      description: "Short-form video for feed and discovery.",
      price: profile.price_per_reel,
    });
  }

  if (profile.price_per_post) {
    packages.push({
      key: "post",
      label: "Post",
      description: "Static image or carousel for durable feed presence.",
      price: profile.price_per_post,
    });
  }

  if (profile.price_per_story) {
    packages.push({
      key: "story",
      label: "Story",
      description: "Quick, high-attention content with direct response energy.",
      price: profile.price_per_story,
    });
  }

  return packages;
}

export function buildCampaignTitle(
  formState: BookingFormState,
  profile: Pick<InfluencerProfile, "display_name"> | null,
) {
  const objectiveLabel =
    getObjectiveLabel(formState.objective) ||
    profile?.display_name?.trim() ||
    "Campaign";
  return `${objectiveLabel} • ${getPackageLabel(formState.packageType)}`;
}

export function buildCampaignBrief(formState: BookingFormState) {
  const objectiveLabel = getObjectiveLabel(formState.objective);
  const timingLabel =
    BOOKING_TIMING_OPTIONS.find((item) => item.value === formState.timingMode)
      ?.label ?? formState.timingMode;

  const lines = [
    `Objective: ${objectiveLabel}`,
    `Package: ${getPackageLabel(formState.packageType)}`,
  ];

  if (
    shouldShowEventName(formState.objective) &&
    formState.venueAddress.trim()
  ) {
    lines.push(`Venue: ${formState.venueAddress.trim()}`);
  }

  lines.push(
    `Timeline: ${
      formState.timingMode === "choose_date" && formState.dueDate
        ? `${timingLabel} (${formState.dueDate})`
        : timingLabel
    }`,
  );

  return lines.join("\n");
}
