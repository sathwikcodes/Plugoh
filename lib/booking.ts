import type { Database } from "@/lib/supabase/types";

export type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export type BookingObjective =
  | "product_launch"
  | "restaurant_visit"
  | "brand_awareness"
  | "ugc"
  | "event_coverage";

export type BookingTimingMode = "asap" | "this_week" | "choose_date";

export type BookablePackage = "reel" | "post" | "story";

export interface BookingFormState {
  objective: BookingObjective;
  packageType: BookablePackage;
  timingMode: BookingTimingMode;
  dueDate: string;
  focusText: string;
  eventName: string;
  notes: string;
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
    value: "product_launch",
    label: "Product launch",
    shortLabel: "Launch",
    description:
      "Introduce a new product or menu item with a clear hero angle.",
  },
  {
    value: "restaurant_visit",
    label: "Restaurant visit",
    shortLabel: "Visit",
    needsEventName: true,
    description:
      "Drive footfall or buzz around a venue, cafe, or in-person experience.",
  },
  {
    value: "brand_awareness",
    label: "Brand awareness",
    shortLabel: "Awareness",
    description:
      "Build recognition with a simple top-of-funnel branded mention.",
  },
  {
    value: "ugc",
    label: "UGC",
    shortLabel: "UGC",
    description: "Commission creator-first content the brand can later reuse.",
  },
  {
    value: "event_coverage",
    label: "Event coverage",
    shortLabel: "Event",
    needsEventName: true,
    description:
      "Capture a launch, meetup, or special activation in real time.",
  },
];

export const BOOKING_TIMING_OPTIONS: Array<{
  value: BookingTimingMode;
  label: string;
  description: string;
}> = [
  {
    value: "asap",
    label: "ASAP",
    description: "Fastest possible turnaround",
  },
  {
    value: "this_week",
    label: "This week",
    description: "Flexible but needed soon",
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
  return (name?.trim() || "Creator")
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
  profile: InfluencerProfile,
) {
  const objectiveLabel =
    getObjectiveMeta(formState.objective)?.label ??
    profile.display_name?.trim() ??
    "Campaign";
  return `${objectiveLabel} • ${getPackageLabel(formState.packageType)}`;
}

export function buildCampaignBrief(formState: BookingFormState) {
  const objectiveLabel =
    getObjectiveMeta(formState.objective)?.label ?? "Campaign";
  const timingLabel =
    BOOKING_TIMING_OPTIONS.find((item) => item.value === formState.timingMode)
      ?.label ?? formState.timingMode;

  const lines = [
    `Objective: ${objectiveLabel}`,
    `Package: ${getPackageLabel(formState.packageType)}`,
    `Timeline: ${
      formState.timingMode === "choose_date" && formState.dueDate
        ? `${timingLabel} (${formState.dueDate})`
        : timingLabel
    }`,
  ];

  if (formState.focusText.trim()) {
    lines.push(`What to feature: ${formState.focusText.trim()}`);
  }

  if (shouldShowEventName(formState.objective) && formState.eventName.trim()) {
    lines.push(`Event/Venue: ${formState.eventName.trim()}`);
  }

  if (formState.notes.trim()) {
    lines.push(`Extra notes: ${formState.notes.trim()}`);
  }

  return lines.join("\n");
}
