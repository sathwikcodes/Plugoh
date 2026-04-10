import type { BusinessIdentity } from "@/lib/business-profile";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

export type SortMode = "newest" | "highest_offer" | "recently_updated";

export type StatusFilter =
  | "All"
  | "requested"
  | "payment_pending"
  | "in_escrow"
  | "completed"
  | "closed";

export type EnrichedCampaign = {
  campaign: Campaign;
  business: BusinessIdentity | null;
};

export const STATUS_FILTER_GROUPS: Record<StatusFilter, string[]> = {
  All: [],
  requested: ["requested", "pending", "pre_authorized"],
  payment_pending: ["payment_pending"],
  in_escrow: ["in_escrow", "accepted", "delivery_submitted"],
  completed: ["completed"],
  closed: ["declined", "rejected", "expired", "cancelled", "refunded"],
};

export const STATUS_PILL_LABELS: Record<StatusFilter, string> = {
  All: "All",
  requested: "Offers",
  payment_pending: "Awaiting pay",
  in_escrow: "Active",
  completed: "Done",
  closed: "Closed",
};

export const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "requested",
  "payment_pending",
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
    description: "Most recently received offers",
  },
  {
    value: "recently_updated",
    label: "Recently updated",
    description: "Last activity or status change",
  },
  {
    value: "highest_offer",
    label: "Highest offer",
    description: "Highest earning offer at the top",
  },
];
