import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignMessage = Database["public"]["Tables"]["campaign_messages"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface BusinessConversation {
  campaign: Campaign;
  influencerProfile: Profile | null;
  lastMessage: CampaignMessage | null;
}

async function fetchBusinessConversations(
  userId: string,
): Promise<BusinessConversation[]> {
  const { data: campaigns, error: campError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("business_id", userId)
    .neq("status", "rejected")
    .order("updated_at", { ascending: false });

  if (campError) throw campError;
  if (!campaigns || campaigns.length === 0) return [];

  const influencerIds = [...new Set(campaigns.map((c) => c.influencer_id))];
  const campaignIds = campaigns.map((c) => c.id);

  const [{ data: profiles }, { data: allMessages }] = await Promise.all([
    supabase.from("profiles").select("*").in("id", influencerIds),
    supabase
      .from("campaign_messages")
      .select("*")
      .in("campaign_id", campaignIds)
      .neq("message_type", "system")
      .order("created_at", { ascending: false }),
  ]);

  const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

  const messageMap = new Map<string, CampaignMessage>();
  for (const msg of allMessages || []) {
    if (!messageMap.has(msg.campaign_id)) {
      messageMap.set(msg.campaign_id, msg);
    }
  }

  const convos: BusinessConversation[] = campaigns.map((c) => ({
    campaign: c,
    influencerProfile: profileMap.get(c.influencer_id) || null,
    lastMessage: messageMap.get(c.id) || null,
  }));

  convos.sort((a, b) => {
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

  return convos;
}

export function useBusinessInboxConversations(userId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["business-inbox-conversations", userId],
    queryFn: () => fetchBusinessConversations(userId!),
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
        () => {
          queryClient.invalidateQueries({
            queryKey: ["business-inbox-conversations", userId],
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return query;
}
