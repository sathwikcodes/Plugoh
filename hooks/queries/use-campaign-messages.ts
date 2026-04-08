import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTRPC } from "@/lib/trpc/client";
import type { Database, Json } from "@/lib/supabase/types";

export type CampaignMessage =
  Database["public"]["Tables"]["campaign_messages"]["Row"];

export function useCampaignMessages(campaignId: string | undefined) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryOpts = trpc.campaign.getCampaignMessages.queryOptions({
    campaignId: campaignId!,
  });

  const queryKey = queryOpts.queryKey;

  const query = useQuery({
    ...queryOpts,
    enabled: !!campaignId,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (!campaignId) return;

    const channel = supabase
      .channel(`campaign-messages-${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "campaign_messages",
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            queryKey,
            (old: CampaignMessage[] | undefined) =>
              old
                ? [...old, payload.new as CampaignMessage]
                : [payload.new as CampaignMessage],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "campaign_messages",
          filter: `campaign_id=eq.${campaignId}`,
        },
        (payload) => {
          queryClient.setQueryData(
            queryKey,
            (old: CampaignMessage[] | undefined) => {
              if (!old) return old;
              const updated = payload.new as CampaignMessage;
              return old.map((msg) => (msg.id === updated.id ? updated : msg));
            },
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // queryKey is stable for the same campaignId via tRPC's internal memoization
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId, queryClient]);

  return query;
}

export function useSendMessage() {
  return useMutation({
    mutationFn: async ({
      campaignId,
      senderId,
      recipientId,
      content,
      messageType = "text",
      metadata = {},
    }: {
      campaignId: string;
      senderId: string;
      recipientId: string;
      content: string;
      messageType?: string;
      metadata?: Json;
    }) => {
      const { data, error } = await supabase
        .from("campaign_messages")
        .insert({
          campaign_id: campaignId,
          sender_id: senderId,
          content,
          message_type: messageType,
          metadata,
        })
        .select()
        .single();
      if (error) throw error;

      supabase
        .from("notifications")
        .insert({
          user_id: recipientId,
          type: "new_message",
          data: { campaign_id: campaignId },
        })
        .then(({ error: notifError }) => {
          if (notifError)
            console.error("Notification insert failed:", notifError);
        });

      return data as CampaignMessage;
    },
  });
}

export function useMarkNotificationsReadForCampaign() {
  return useMutation({
    mutationFn: async ({
      campaignId,
      userId,
    }: {
      campaignId: string;
      userId: string;
    }) => {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("type", "new_message")
        .eq("read", false)
        .contains("data", { campaign_id: campaignId });
    },
  });
}
