import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTRPC } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";
import type { BusinessIdentity } from "@/lib/business-profile";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignMessage = Database["public"]["Tables"]["campaign_messages"]["Row"];

export interface Conversation {
  campaign: Campaign;
  businessProfile: BusinessIdentity | null;
  lastMessage: CampaignMessage | null;
}

export function useInboxConversations(userId: string | undefined) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const queryOpts = trpc.inbox.getInboxConversations.queryOptions();
  const queryKey = queryOpts.queryKey;

  const query = useQuery({
    ...queryOpts,
    enabled: !!userId,
  });

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`inbox-updates-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "campaign_messages",
        },
        (payload) => {
          const newMsg = payload.new as { campaign_id: string };
          const cached = queryClient.getQueryData<Conversation[]>(queryKey);
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
