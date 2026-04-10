import type { BusinessIdentity } from "@/lib/business-profile";
import type { Database } from "@/lib/supabase/types";

export type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  payment_method?: string | null;
  delivery_url?: string | null;
};

export interface CampaignBrandSectionProps {
  businessIdentity: BusinessIdentity | null;
  businessName: string;
  businessLocation: string | null;
  businessSummary: string | null;
  igUsername: string | null;
  profilesLoading: boolean;
}
