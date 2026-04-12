import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
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
  influencerAuthAvatarUrl: string | null;
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
    staleTime: 30_000,
  });

  const invalidateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    const scheduleInvalidate = () => {
      if (invalidateTimerRef.current) return;
      invalidateTimerRef.current = setTimeout(() => {
        invalidateTimerRef.current = null;
        queryClient.invalidateQueries({ queryKey });
      }, 500);
    };

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
          const newMsg = payload.new as CampaignMessage;
          const cached =
            queryClient.getQueryData<BusinessConversation[]>(queryKey);
          if (!cached) return;

          const hasConversation = cached.some(
            (c) => c.campaign.id === newMsg.campaign_id,
          );

          if (hasConversation) {
            queryClient.setQueryData<BusinessConversation[]>(
              queryKey,
              (prev) => {
                if (!prev) return prev;
                return prev.map((conv) =>
                  conv.campaign.id === newMsg.campaign_id
                    ? { ...conv, lastMessage: newMsg }
                    : conv,
                );
              },
            );
          } else {
            scheduleInvalidate();
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      if (invalidateTimerRef.current) {
        clearTimeout(invalidateTimerRef.current);
        invalidateTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, queryClient]);

  return query;
}
