"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTRPC } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";

export function useCampaignCardActions() {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["influencer-campaigns"],
    });
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
  };

  const acceptMutation = useMutation(
    trpc.campaign.acceptBooking.mutationOptions({
      onSuccess: (_data, variables) => {
        invalidate();
        toast({
          title: "Booking accepted!",
          description: "Opening the campaign details.",
        });
        router.push(`/dashboard/influencer/campaigns/${variables.campaignId}`);
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
      onSuccess: () => {
        invalidate();
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

  return {
    acceptCampaign: (campaignId: string) =>
      acceptMutation.mutate({ campaignId }),
    declineCampaign: (campaignId: string) =>
      declineMutation.mutate({ campaignId }),
    acceptingId: acceptMutation.variables?.campaignId ?? null,
    decliningId: declineMutation.variables?.campaignId ?? null,
  };
}
