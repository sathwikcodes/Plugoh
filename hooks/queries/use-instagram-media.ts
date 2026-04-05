import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

export function useInstagramMedia(userId: string | undefined) {
  return useQuery({
    queryKey: ["instagram-media", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_media")
        .select("*")
        .eq("user_id", userId!)
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return data as InstagramMedia[];
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useTopMedia(userId: string | undefined, limit = 6) {
  return useQuery({
    queryKey: ["top-media", userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_media")
        .select("*")
        .eq("user_id", userId!)
        .not("permalink", "is", null)
        .order("like_count", { ascending: false, nullsFirst: false })
        .limit(limit);
      if (error) throw error;
      return data as InstagramMedia[];
    },
    enabled: !!userId,
    staleTime: 60_000,
  });
}

export function usePortfolioMedia(
  userId: string | undefined,
  mediaIds: string[] | null | undefined,
) {
  return useQuery({
    queryKey: ["portfolio-media", userId, mediaIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instagram_media")
        .select("*")
        .eq("user_id", userId!)
        .in("ig_media_id", mediaIds!);
      if (error) throw error;
      return data as InstagramMedia[];
    },
    enabled: !!userId && !!mediaIds && mediaIds.length > 0,
  });
}
