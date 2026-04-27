import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

export function useCampaigns(
  userId: string | undefined,
  role: "business" | "influencer",
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.campaign.getCampaigns.queryOptions({ role }),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

interface UseCampaignOptions {
  userId?: string;
  role?: "business" | "influencer";
}

export function useCampaign(
  id: string | undefined,
  opts: UseCampaignOptions = {},
) {
  const { userId, role = "business" } = opts;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const filterBusinessId = role === "business";

  const queryOptions = useMemo(
    () =>
      trpc.campaign.getCampaign.queryOptions({
        id: id!,
        filterBusinessId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, filterBusinessId],
  );

  const enabled = role === "business" ? !!id && !!userId : !!id;

  return useQuery({
    ...queryOptions,
    enabled,
    staleTime: 30_000,
    refetchOnMount: true,
    initialData: () => {
      if (!id) return undefined;
      const listKey = trpc.campaign.getCampaigns.queryOptions({
        role,
      }).queryKey;
      const list = queryClient.getQueryData<Campaign[]>(listKey);
      return list?.find((c) => c.id === id);
    },
    initialDataUpdatedAt: () => {
      if (!id) return undefined;
      const listKey = trpc.campaign.getCampaigns.queryOptions({
        role,
      }).queryKey;
      const list = queryClient.getQueryData<Campaign[]>(listKey);
      if (!list?.some((c) => c.id === id)) return undefined;
      return queryClient.getQueryState(listKey)?.dataUpdatedAt;
    },
  });
}
