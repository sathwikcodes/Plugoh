import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export function useInfluencerProfiles() {
  return useQuery({
    queryKey: ["influencer-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("is_active", true)
        .order("follower_count", { ascending: false });
      if (error) throw error;
      return data as InfluencerProfile[];
    },
    staleTime: 30_000,
  });
}

export function useInfluencerProfile(id: string | undefined) {
  return useQuery({
    queryKey: ["influencer-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as InfluencerProfile | null;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}

export function useMyInfluencerProfile(
  userId: string | undefined,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ["my-influencer-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data as InfluencerProfile | null;
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval,
  });
}

export function useUpdateInfluencerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: Partial<
        Database["public"]["Tables"]["influencer_profiles"]["Update"]
      >;
    }) => {
      const { data: rows, error } = await supabase
        .from("influencer_profiles")
        .update(data)
        .eq("user_id", userId)
        .select("id");
      if (error) throw error;
      if (!rows?.length) throw new Error("Update failed — no matching record");
    },
    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries({
        queryKey: ["my-influencer-profile", userId],
      });
      const prev = queryClient.getQueryData(["my-influencer-profile", userId]);
      queryClient.setQueryData(
        ["my-influencer-profile", userId],
        (old: InfluencerProfile | null) => (old ? { ...old, ...data } : old),
      );
      return { prev, userId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(
          ["my-influencer-profile", ctx.userId],
          ctx.prev,
        );
      }
    },
    onSettled: (_data, _err, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ["my-influencer-profile", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["influencer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["influencer-profiles"] });
    },
  });
}
