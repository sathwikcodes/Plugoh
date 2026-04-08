import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC, trpcClient } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export function useInfluencerProfiles() {
  const trpc = useTRPC();
  return useQuery(trpc.profile.getInfluencerProfiles.queryOptions());
}

export function useInfluencerProfile(id: string | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.profile.getInfluencerProfile.queryOptions({ id: id! }),
    enabled: !!id,
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

  return useMutation({
    mutationFn: async ({
      data,
    }: {
      userId: string;
      data: Partial<
        Database["public"]["Tables"]["influencer_profiles"]["Update"]
      >;
    }) => {
      const updateData: Record<string, unknown> = {};
      if (data.display_name !== undefined)
        updateData.displayName = data.display_name;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.languages !== undefined) updateData.languages = data.languages;
      if (data.price_per_reel !== undefined)
        updateData.pricePerReel = data.price_per_reel;
      if (data.price_per_post !== undefined)
        updateData.pricePerPost = data.price_per_post;
      if (data.price_per_story !== undefined)
        updateData.pricePerStory = data.price_per_story;
      if (data.content_types !== undefined)
        updateData.contentTypes = data.content_types;
      if (data.turnaround_time !== undefined)
        updateData.turnaroundTime = data.turnaround_time;
      if (data.portfolio_media_ids !== undefined)
        updateData.portfolioMediaIds = data.portfolio_media_ids;
      if (data.previous_brands !== undefined)
        updateData.previousBrands = data.previous_brands;
      if (data.is_active !== undefined) updateData.isActive = data.is_active;
      await trpcClient.profile.updateInfluencerProfile.mutate(
        updateData as Parameters<
          typeof trpcClient.profile.updateInfluencerProfile.mutate
        >[0],
      );
    },
    onMutate: async ({ data }) => {
      const qk = trpc.profile.getMyInfluencerProfile.queryKey();
      await queryClient.cancelQueries({ queryKey: qk });
      const prev = queryClient.getQueryData<InfluencerProfile | null>(qk);
      queryClient.setQueryData<InfluencerProfile | null | undefined>(
        qk,
        (old) => (old ? { ...old, ...data } : old),
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
  });
}
