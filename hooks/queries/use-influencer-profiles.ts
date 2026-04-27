import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";
import { useMemo } from "react";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export function useInfluencerProfiles() {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.profile.getInfluencerProfiles.queryOptions(),
    staleTime: 60_000,
  });
}

export function useInfluencerProfile(id: string | undefined) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const queryOptions = useMemo(
    () => trpc.profile.getInfluencerProfile.queryOptions({ id: id! }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  );

  return useQuery({
    ...queryOptions,
    enabled: !!id,
    staleTime: 60_000,
    initialData: () => {
      if (!id) return undefined;
      const list = queryClient.getQueryData<InfluencerProfile[]>(
        trpc.profile.getInfluencerProfiles.queryKey(),
      );
      return list?.find((p) => p.id === id) ?? undefined;
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(trpc.profile.getInfluencerProfiles.queryKey())
        ?.dataUpdatedAt,
  });
}

export function useMyInfluencerProfile(
  userId: string | undefined,
  options?: { refetchInterval?: number | false },
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.profile.getMyInfluencerProfile.queryOptions(),
    enabled: !!userId,
    refetchInterval: options?.refetchInterval,
  });
}

export function useUpdateInfluencerProfile() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.profile.updateInfluencerProfile.mutationOptions({
      onMutate: async (input) => {
        const qk = trpc.profile.getMyInfluencerProfile.queryKey();
        await queryClient.cancelQueries({ queryKey: qk });
        const prev = queryClient.getQueryData<InfluencerProfile | null>(qk);
        // The router translates camelCase input back to snake_case columns.
        // Mirror that mapping for the optimistic patch on the cached row.
        const patch: Partial<InfluencerProfile> = {};
        if (input.displayName !== undefined)
          patch.display_name = input.displayName;
        if (input.bio !== undefined) patch.bio = input.bio;
        if (input.category !== undefined) patch.category = input.category;
        if (input.city !== undefined) patch.city = input.city;
        if (input.languages !== undefined) patch.languages = input.languages;
        if (input.pricePerReel !== undefined)
          patch.price_per_reel = input.pricePerReel;
        if (input.pricePerPost !== undefined)
          patch.price_per_post = input.pricePerPost;
        if (input.pricePerStory !== undefined)
          patch.price_per_story = input.pricePerStory;
        if (input.contentTypes !== undefined)
          patch.content_types = input.contentTypes;
        if (input.turnaroundTime !== undefined)
          patch.turnaround_time = input.turnaroundTime;
        if (input.portfolioMediaIds !== undefined)
          patch.portfolio_media_ids = input.portfolioMediaIds;
        if (input.previousBrands !== undefined)
          patch.previous_brands = input.previousBrands;
        if (input.isActive !== undefined) patch.is_active = input.isActive;
        queryClient.setQueryData<InfluencerProfile | null | undefined>(
          qk,
          (old) => (old ? { ...old, ...patch } : old),
        );
        return { prev };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.prev !== undefined) {
          queryClient.setQueryData<InfluencerProfile | null | undefined>(
            trpc.profile.getMyInfluencerProfile.queryKey(),
            ctx.prev,
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getMyInfluencerProfile.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.profile.getInfluencerProfiles.queryKey(),
        });
      },
    }),
  );
}
