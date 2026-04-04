"use client";

import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["influencer_profiles"]["Row"];

export function getInfluencerDisplayName(profile: Profile | null): string {
  return (
    profile?.display_name?.trim() ||
    profile?.instagram_handle?.trim() ||
    profile?.ig_username?.trim() ||
    "Creator"
  );
}

export function getInfluencerHandle(profile: Profile | null): string | null {
  const rawHandle =
    profile?.instagram_handle?.trim() || profile?.ig_username?.trim();

  if (!rawHandle) return null;
  return rawHandle.startsWith("@") ? rawHandle : `@${rawHandle}`;
}

export function getInfluencerAvatarUrl(profile: Profile | null): string | null {
  return profile?.ig_profile_picture_url?.trim() || null;
}
