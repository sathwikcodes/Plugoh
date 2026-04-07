import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { trpcClient } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";
import type { BusinessIdentity } from "@/lib/business-profile";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignMessage = Database["public"]["Tables"]["campaign_messages"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];

export interface Conversation {
  campaign: Campaign;
  businessProfile: BusinessIdentity | null;
  lastMessage: CampaignMessage | null;
}

async function fetchConversations(userId: string): Promise<Conversation[]> {
  const { data: campaigns, error: campError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("influencer_id", userId)
    .neq("status", "rejected")
    .order("updated_at", { ascending: false });

  if (campError) throw campError;
  if (!campaigns || campaigns.length === 0) return [];

  const businessIds = [...new Set(campaigns.map((c) => c.business_id))];
  const campaignIds = campaigns.map((c) => c.id);

  const [{ profiles, businessProfiles }, { data: allMessages }] =
    await Promise.all([
      trpcClient.profile.getBusinessProfiles.query({ businessIds }),
      supabase
        .from("campaign_messages")
        .select("*")
        .in("campaign_id", campaignIds)
        .neq("message_type", "system")
        .order("created_at", { ascending: false }),
    ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p as Profile]));
  const businessMap = new Map(
    (businessProfiles || []).map((bp) => [bp.user_id, bp as BusinessProfile]),
  );

  const messageMap = new Map<string, CampaignMessage>();
  for (const msg of allMessages || []) {
    if (!messageMap.has(msg.campaign_id)) {
      messageMap.set(msg.campaign_id, msg);
    }
  }

  const convos: Conversation[] = campaigns.map((c) => ({
    campaign: c,
    businessProfile: {
      basicProfile: profileMap.get(c.business_id) || null,
      businessProfile: businessMap.get(c.business_id) || null,
    },
    lastMessage: messageMap.get(c.id) || null,
  }));

  return convos.toSorted((a, b) => {
    const aTime =
      a.lastMessage?.created_at ||
      a.campaign.updated_at ||
      a.campaign.created_at;
    const bTime =
      b.lastMessage?.created_at ||
      b.campaign.updated_at ||
      b.campaign.created_at;
    return new Date(bTime).getTime() - new Date(aTime).getTime();
  });
}

export function useInboxConversations(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inbox-conversations", userId],
    queryFn: () => fetchConversations(userId!),
    enabled: !!userId,
  });

  // Realtime: invalidate only when a new message arrives for one of this user's campaigns
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
          const cached = queryClient.getQueryData<Conversation[]>([
            "inbox-conversations",
            userId,
          ]);
          // Only invalidate if the message belongs to a campaign this user is part of
          if (
            !cached ||
            cached.some((c) => c.campaign.id === newMsg.campaign_id)
          ) {
            queryClient.invalidateQueries({
              queryKey: ["inbox-conversations", userId],
            });
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
}
