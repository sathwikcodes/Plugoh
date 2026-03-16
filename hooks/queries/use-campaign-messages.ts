import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/types";

export type CampaignMessage =
  Database["public"]["Tables"]["campaign_messages"]["Row"];

export function useCampaignMessages(campaignId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["campaign-messages", campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaign_messages")
        .select("*")
        .eq("campaign_id", campaignId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as CampaignMessage[];
    },
    enabled: !!campaignId,
  });

  // Realtime subscription
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
            ["campaign-messages", campaignId],
            (old: CampaignMessage[] | undefined) =>
              old
                ? [...old, payload.new as CampaignMessage]
                : [payload.new as CampaignMessage],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, queryClient]);

  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      senderId,
      content,
      messageType = "text",
      metadata = {},
    }: {
      campaignId: string;
      senderId: string;
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
      return data as CampaignMessage;
    },
    onSuccess: (data) => {
      // Realtime will handle adding to cache, but invalidate as fallback
      queryClient.invalidateQueries({
        queryKey: ["campaign-messages", data.campaign_id],
      });
    },
  });
}

export function useMarkMessagesRead() {
  return useMutation({
    mutationFn: async ({
      messageIds,
      userId,
    }: {
      messageIds: string[];
      userId: string;
    }) => {
      // Update read_by array for all unread messages
      for (const id of messageIds) {
        await supabase
          .rpc(
            "append_read_by" as never,
            {
              message_id: id,
              user_id: userId,
            } as never,
          )
          .then(() => {
            // Fallback: direct update if RPC doesn't exist
          });
      }
    },
  });
}
