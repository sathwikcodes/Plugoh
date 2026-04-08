import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";

export function useCampaigns(
  userId: string | undefined,
  role: "business" | "influencer",
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaign.getCampaigns.queryOptions({ role }),
    enabled: !!userId,
  });
}

export function useCampaign(id: string | undefined, userId?: string) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaign.getCampaign.queryOptions({
      id: id!,
      filterBusinessId: !!userId,
    }),
    enabled: !!id,
  });
}
