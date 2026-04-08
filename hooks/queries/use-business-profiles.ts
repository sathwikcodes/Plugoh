import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";
import type { BusinessIdentity } from "@/lib/business-profile";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];

export function useBusinessProfiles(businessIds: string[]) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.profile.getBusinessProfiles.queryOptions({ businessIds }),
    enabled: businessIds.length > 0,
    placeholderData: keepPreviousData,
    select: (raw) => {
      const profileMap = new Map(
        (raw.profiles || []).map((p) => [p.id, p as Profile]),
      );
      const businessMap = new Map(
        (raw.businessProfiles || []).map((bp) => [
          bp.user_id,
          bp as BusinessProfile,
        ]),
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
  });
}

export function useMyBusinessProfile(
  userId: string | undefined,
  options?: { refetchInterval?: number | false },
) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.profile.getMyBusinessProfile.queryOptions(),
    enabled: !!userId,
    refetchInterval: options?.refetchInterval,
    select: (raw): BusinessIdentity => ({
      basicProfile: raw.basicProfile as Profile | null,
      businessProfile: raw.businessProfile as BusinessProfile | null,
    }),
  });
}
