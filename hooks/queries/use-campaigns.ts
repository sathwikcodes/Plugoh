import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

export function useCampaigns(
  userId: string | undefined,
  role: "business" | "influencer",
) {
  return useQuery({
    queryKey: ["campaigns", userId, role],
    queryFn: async () => {
      const column = role === "business" ? "business_id" : "influencer_id";
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq(column, userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useCampaign(id: string | undefined, userId?: string) {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async () => {
      let query = supabase.from("campaigns").select("*").eq("id", id!);
      if (userId) {
        query = query.eq("business_id", userId);
      }
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      return data as Campaign | null;
    },
    enabled: !!id,
    staleTime: 30_000,
  });
}
