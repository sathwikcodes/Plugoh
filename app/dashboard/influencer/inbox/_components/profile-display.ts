import type { BusinessIdentity } from "@/lib/business-profile";
import { getBusinessDisplayName } from "@/lib/business-profile";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

export function getBrandDisplayName(identity: BusinessIdentity | null) {
  return getBusinessDisplayName(identity);
}

export function getBrandAvatarUrl(identity: BusinessIdentity | null) {
  return (
    identity?.businessProfile?.ig_profile_picture_url?.trim() ||
    identity?.authAvatarUrl?.trim() ||
    null
  );
}

export function getInfluencerDisplayName(
  profile: InfluencerProfile | null,
): string {
  return (
    profile?.display_name?.trim() ||
    profile?.instagram_handle?.trim() ||
    profile?.ig_username?.trim() ||
    "Influencer"
  );
}
