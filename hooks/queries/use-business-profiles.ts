import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useBusinessProfiles(businessIds: string[]) {
  return useQuery({
    queryKey: ["business-profiles-batch", businessIds],
    queryFn: async () => {
      if (businessIds.length === 0) return new Map<string, Profile>();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", businessIds);
      if (error) throw error;
      return new Map((data || []).map((p) => [p.id, p]));
    },
    enabled: businessIds.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}
