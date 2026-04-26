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

export function useCampaign(id: string | undefined, opts: UseCampaignOptions = {}) {
  const { userId, role = "business" } = opts;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const filterBusinessId = !!userId;

  const queryOptions = useMemo(
    () =>
      trpc.campaign.getCampaign.queryOptions({
        id: id!,
        filterBusinessId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, filterBusinessId],
  );

  return useQuery({
    ...queryOptions,
    // If userId was provided, wait for it to be defined before firing (stable key, no double-fetch).
    // If no userId provided (e.g. influencer page), fire as soon as id is available.
    enabled: userId !== undefined ? !!id && !!userId : !!id,
    staleTime: 30_000,
    initialData: () => {
      if (!id) return undefined;
      const list = queryClient.getQueryData<Campaign[]>(
        trpc.campaign.getCampaigns.queryOptions({ role }).queryKey,
      );
      return list?.find((c) => c.id === id) ?? undefined;
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(
        trpc.campaign.getCampaigns.queryOptions({ role }).queryKey,
      )?.dataUpdatedAt,
  });
}
