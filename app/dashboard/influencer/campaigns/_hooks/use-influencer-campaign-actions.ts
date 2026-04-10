"use client";

import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";

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

  const invalidateCampaignQueries = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: trpc.campaign.getCampaigns.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.campaign.getCampaign.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.inbox.getInboxConversations.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.inbox.getBusinessInboxConversations.queryKey(),
    });
  }, [queryClient, trpc]);

  const acceptMutation = useMutation(
    trpc.campaign.acceptBooking.mutationOptions({
      onSuccess: (_data, variables) => {
        invalidateCampaignQueries();
        options.onAcceptSuccess?.(variables.campaignId);
        toast({
          title: "Booking accepted!",
          description:
            options.acceptSuccessDescription ?? "Opening the next step.",
        });
        const href = options.acceptRedirectTo?.(variables.campaignId);
        if (href) router.push(href);
      },
      onError: (err) => {
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
      onSuccess: (_data, variables) => {
        invalidateCampaignQueries();
        options.onDeclineSuccess?.(variables.campaignId);
        toast({ title: "Offer declined" });
      },
      onError: (err) => {
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
        invalidateCampaignQueries();
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
      contentUrl: string;
      notes?: string;
    }) => deliveryMutation.mutateAsync(input),
    acceptingId: acceptMutation.variables?.campaignId ?? null,
    decliningId: declineMutation.variables?.campaignId ?? null,
    isSubmittingDelivery: deliveryMutation.isPending,
    invalidateCampaignQueries,
  };
}
