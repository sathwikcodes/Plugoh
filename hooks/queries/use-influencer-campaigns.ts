import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { trpcClient } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";
import type { BusinessIdentity } from "@/lib/business-profile";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];

export interface InfluencerCampaignRecord {
  campaign: Campaign;
  business: BusinessIdentity | null;
}

export function useInfluencerCampaigns(userId: string | undefined) {
  return useQuery({
    queryKey: ["influencer-campaigns", userId],
    queryFn: async () => {
      const { data: campaigns, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("influencer_id", userId!)
        .order("created_at", { ascending: false });

      if (campaignError) throw campaignError;
      if (!campaigns || campaigns.length === 0) {
        return [] as InfluencerCampaignRecord[];
      }

      const businessIds = [
        ...new Set(campaigns.map((campaign) => campaign.business_id)),
      ];

      const { profiles, businessProfiles } =
        await trpcClient.profile.getBusinessProfiles.query({ businessIds });

      const profileMap = new Map(
        (profiles || []).map((profile) => [profile.id, profile as Profile]),
      );
      const businessMap = new Map(
        (businessProfiles || []).map((profile) => [
          profile.user_id,
          profile as BusinessProfile,
        ]),
      );

      return campaigns.map((campaign) => ({
        campaign,
        business: {
          basicProfile: profileMap.get(campaign.business_id) ?? null,
          businessProfile: businessMap.get(campaign.business_id) ?? null,
        },
      })) satisfies InfluencerCampaignRecord[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}
