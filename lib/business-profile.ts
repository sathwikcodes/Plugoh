import type { Database } from "@/lib/supabase/types";

export type BasicProfile = Database["public"]["Tables"]["profiles"]["Row"];
export type BusinessProfile =
  Database["public"]["Tables"]["business_profiles"]["Row"];

export interface BusinessIdentity {
  basicProfile: BasicProfile | null;
  businessProfile: BusinessProfile | null;
}

export function getBusinessDisplayName(identity: BusinessIdentity | null) {
  return (
    identity?.businessProfile?.brand_name?.trim() ||
    identity?.basicProfile?.business_name?.trim() ||
    identity?.basicProfile?.full_name?.trim() ||
    "Brand"
  );
}

export function getBusinessLocation(identity: BusinessIdentity | null) {
  return (
    identity?.businessProfile?.brand_location?.trim() ||
    identity?.basicProfile?.location?.trim() ||
    null
  );
}

export function isBusinessProfileComplete(identity: BusinessIdentity | null) {
  return Boolean(
    identity?.businessProfile?.brand_name?.trim() ||
      identity?.basicProfile?.business_name?.trim(),
  );
}
