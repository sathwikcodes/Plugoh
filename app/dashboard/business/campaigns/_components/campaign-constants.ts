import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export type SortMode = "newest" | "highest_spend" | "recently_updated";

export type StatusFilter =
  | "All"
  | "requested"
  | "in_escrow"
  | "completed"
  | "closed";

export type EnrichedCampaign = {
  campaign: Campaign;
  influencer: Pick<
    InfluencerProfile,
    | "id"
    | "display_name"
    | "ig_profile_picture_url"
    | "ig_username"
    | "category"
  > | null;
};

export const STATUS_FILTER_GROUPS: Record<StatusFilter, string[]> = {
  All: [],
  requested: ["requested", "pending", "pre_authorized", "payment_pending"],
  in_escrow: ["in_escrow", "accepted", "delivery_submitted"],
  completed: ["completed"],
  closed: ["declined", "rejected", "expired", "cancelled", "refunded"],
};

export const STATUS_PILL_LABELS: Record<StatusFilter, string> = {
  All: "All",
  requested: "Pending",
  in_escrow: "Active",
  completed: "Done",
  closed: "Closed",
};

export const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "requested",
  "in_escrow",
  "completed",
  "closed",
];

export const SORT_OPTIONS: Array<{
  value: SortMode;
  label: string;
  description: string;
}> = [
  {
    value: "newest",
    label: "Newest first",
    description: "Most recently booked campaigns",
  },
  {
    value: "recently_updated",
    label: "Recently updated",
    description: "Last activity or status change",
  },
  {
    value: "highest_spend",
    label: "Highest spend",
    description: "Highest creator fee at the top",
  },
];
