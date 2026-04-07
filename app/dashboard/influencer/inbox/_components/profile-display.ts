import type { BusinessIdentity } from "@/lib/business-profile";
import { getBusinessDisplayName } from "@/lib/business-profile";

export function getBrandDisplayName(identity: BusinessIdentity | null) {
  return getBusinessDisplayName(identity);
}

export function getBrandAvatarUrl(identity: BusinessIdentity | null) {
  return identity?.businessProfile?.ig_profile_picture_url || null;
}
