import { useMemo } from "react";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

export function useCampaignCounts(campaigns: Campaign[]) {
  return useMemo(() => {
    let pending = 0,
      active = 0,
      completed = 0,
      rejected = 0,
      pendingValue = 0;
    for (const c of campaigns) {
      switch (c.status) {
        case "requested":
        case "pending":
        case "pre_authorized":
        case "payment_pending":
          pending++;
          pendingValue += c.price_offered ?? 0;
          break;
        case "accepted":
        case "in_escrow":
        case "delivery_submitted":
        case "disputed":
          active++;
          break;
        case "completed":
          completed++;
          break;
        case "rejected":
        case "declined":
        case "expired":
        case "cancelled":
        case "refunded":
          rejected++;
          break;
      }
    }
    return { pending, active, completed, rejected, pendingValue };
  }, [campaigns]);
}
