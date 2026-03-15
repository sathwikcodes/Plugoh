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
  });
}

export function useMyInfluencerProfile(userId: string | undefined) {
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
      const { error } = await supabase
        .from("influencer_profiles")
        .update(data)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-influencer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["influencer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["influencer-profiles"] });
    },
  });
}
