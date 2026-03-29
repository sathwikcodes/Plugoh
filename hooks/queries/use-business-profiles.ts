import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import type { BusinessIdentity } from "@/lib/business-profile";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];

export function useBusinessProfiles(businessIds: string[]) {
  return useQuery({
    queryKey: ["business-profiles-batch", businessIds],
    queryFn: async () => {
      if (businessIds.length === 0) return new Map<string, BusinessIdentity>();

      const [{ data: profiles, error: profileError }, { data: businessProfiles, error: businessError }] =
        await Promise.all([
          supabase.from("profiles").select("*").in("id", businessIds),
          supabase.from("business_profiles").select("*").in("user_id", businessIds),
        ]);

      if (profileError) throw profileError;
      if (businessError) throw businessError;

      const profileMap = new Map((profiles || []).map((p) => [p.id, p as Profile]));
      const businessMap = new Map(
        (businessProfiles || []).map((bp) => [bp.user_id, bp as BusinessProfile]),
      );

      return new Map(
        businessIds.map((id) => [
          id,
          {
            basicProfile: profileMap.get(id) ?? null,
            businessProfile: businessMap.get(id) ?? null,
          },
        ]),
      );
    },
    enabled: businessIds.length > 0,
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });
}

export function useMyBusinessProfile(
  userId: string | undefined,
  options?: { refetchInterval?: number | false },
) {
  return useQuery({
    queryKey: ["my-business-profile", userId],
    queryFn: async () => {
      const [{ data: basicProfile, error: profileError }, { data: businessProfile, error: businessError }] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", userId!).maybeSingle(),
          supabase
            .from("business_profiles")
            .select("*")
            .eq("user_id", userId!)
            .maybeSingle(),
        ]);

      if (profileError) throw profileError;
      if (businessError) throw businessError;

      return {
        basicProfile: basicProfile as Profile | null,
        businessProfile: businessProfile as BusinessProfile | null,
      } satisfies BusinessIdentity;
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: options?.refetchInterval,
  });
}
