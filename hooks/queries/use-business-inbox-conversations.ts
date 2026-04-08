import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTRPC } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignMessage = Database["public"]["Tables"]["campaign_messages"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export interface BusinessConversation {
  campaign: Campaign;
  influencerProfile: InfluencerProfile | null;
  lastMessage: CampaignMessage | null;
}

export function useBusinessInboxConversations(userId: string | undefined) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryOpts = trpc.inbox.getBusinessInboxConversations.queryOptions();
  const queryKey = queryOpts.queryKey;

  const query = useQuery({
    ...queryOpts,
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`business-inbox-updates-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "campaign_messages",
        },
        (payload) => {
          const newMsg = payload.new as { campaign_id: string };
          const cached =
            queryClient.getQueryData<BusinessConversation[]>(queryKey);
          if (
            !cached ||
            cached.some((c) => c.campaign.id === newMsg.campaign_id)
          ) {
            queryClient.invalidateQueries({ queryKey });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, queryClient]);

  return query;
}
