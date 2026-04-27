"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

interface UseInfluencerCampaignActionsOptions {
  acceptRedirectTo?: (campaignId: string) => string | null;
  acceptSuccessDescription?: string;
  onAcceptSuccess?: (campaignId: string) => void;
  onDeclineSuccess?: (campaignId: string) => void;
  onDeliverySuccess?: (campaignId: string) => void;
  deliverySuccessDescription?: string;
}

export function useInfluencerCampaignActions(
  options: UseInfluencerCampaignActionsOptions = {},
) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const listKey = trpc.campaign.getCampaigns.queryOptions({
    role: "influencer",
  }).queryKey;

  const patchList = useCallback(
    (campaignId: string, patch: Partial<Campaign>) => {
      queryClient.setQueryData<Campaign[]>(listKey, (old) =>
        old?.map((c) => (c.id === campaignId ? { ...c, ...patch } : c)),
      );
    },
    [queryClient, listKey],
  );

  const invalidateCampaignQueries = useCallback(
    (campaignId?: string) => {
      queryClient.invalidateQueries({
        queryKey: trpc.campaign.getCampaigns.queryKey(),
      });
      if (campaignId) {
        queryClient.invalidateQueries({
          queryKey: trpc.campaign.getCampaign.queryKey({
            id: campaignId,
            filterBusinessId: false,
          }),
          exact: false,
        });
      } else {
        queryClient.invalidateQueries({
          queryKey: trpc.campaign.getCampaign.queryKey(),
        });
      }
      queryClient.invalidateQueries({
        queryKey: trpc.inbox.getInboxConversations.queryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: trpc.inbox.getBusinessInboxConversations.queryKey(),
      });
    },
    [queryClient, trpc],
  );

  const acceptMutation = useMutation(
    trpc.campaign.acceptBooking.mutationOptions({
      onMutate: async ({ campaignId }) => {
        await queryClient.cancelQueries({ queryKey: listKey });
        const previous = queryClient.getQueryData<Campaign[]>(listKey);
        const current = previous?.find((c) => c.id === campaignId);
        const optimisticStatus =
          current?.status === "pre_authorized"
            ? "in_escrow"
            : "payment_pending";
        patchList(campaignId, { status: optimisticStatus });
        return { previous };
      },
      onSuccess: (_data, variables) => {
        invalidateCampaignQueries(variables.campaignId);
        options.onAcceptSuccess?.(variables.campaignId);
        toast({
          title: "Booking accepted!",
          description:
            options.acceptSuccessDescription ?? "Opening the next step.",
        });
        const href = options.acceptRedirectTo?.(variables.campaignId);
        if (href) router.push(href);
      },
      onError: (err, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(listKey, context.previous);
        }
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const declineMutation = useMutation(
    trpc.campaign.declineBooking.mutationOptions({
      onMutate: async ({ campaignId }) => {
        await queryClient.cancelQueries({ queryKey: listKey });
        const previous = queryClient.getQueryData<Campaign[]>(listKey);
        patchList(campaignId, { status: "declined" });
        return { previous };
      },
      onSuccess: (_data, variables) => {
        invalidateCampaignQueries(variables.campaignId);
        options.onDeclineSuccess?.(variables.campaignId);
        toast({ title: "Offer declined" });
      },
      onError: (err, _variables, context) => {
        if (context?.previous) {
          queryClient.setQueryData(listKey, context.previous);
        }
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const deliveryMutation = useMutation(
    trpc.campaign.submitDelivery.mutationOptions({
      onSuccess: (_data, variables) => {
        invalidateCampaignQueries(variables.campaignId);
        options.onDeliverySuccess?.(variables.campaignId);
        toast({
          title: "Delivery submitted!",
          description:
            options.deliverySuccessDescription ??
            "The brand has 7 days to review before auto-release.",
        });
      },
      onError: (err) => {
        toast({
          title: "Submission failed",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  return {
    acceptCampaign: (campaignId: string) =>
      acceptMutation.mutate({ campaignId }),
    declineCampaign: (campaignId: string) =>
      declineMutation.mutate({ campaignId }),
    submitDelivery: (input: {
      campaignId: string;
      storagePath: string;
      notes?: string;
    }) => deliveryMutation.mutateAsync(input),
    acceptingId: acceptMutation.variables?.campaignId ?? null,
    decliningId: declineMutation.variables?.campaignId ?? null,
    isSubmittingDelivery: deliveryMutation.isPending,
    invalidateCampaignQueries,
  };
}
