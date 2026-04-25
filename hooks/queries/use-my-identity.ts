"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/client";
import { useAuth } from "@/contexts/auth-context";
import { getPreferredAvatarUrl } from "@/lib/avatar-utils";
import { isBusinessProfileComplete } from "@/lib/business-profile";

export function useMyProfile() {
  const trpc = useTRPC();
  const { user } = useAuth();
  return useQuery({
    ...trpc.profile.getMyProfile.queryOptions(),
    enabled: !!user,
  });
}

export function useMyBusinessIdentity() {
  const trpc = useTRPC();
  const { user, role } = useAuth();
  return useQuery({
    ...trpc.profile.getMyBusinessProfile.queryOptions(),
    enabled: !!user && role === "business",
  });
}

export function useMyInfluencerIdentity() {
  const trpc = useTRPC();
  const { user, role } = useAuth();
  return useQuery({
    ...trpc.profile.getMyInfluencerProfile.queryOptions(),
    enabled: !!user && role === "influencer",
  });
}

export function useMyAvatar(): string | null {
  const { user, role } = useAuth();
  const businessQ = useMyBusinessIdentity();
  const influencerQ = useMyInfluencerIdentity();

  const igAvatar =
    role === "business"
      ? (businessQ.data?.businessProfile?.ig_profile_picture_url ?? null)
      : role === "influencer"
        ? ((influencerQ.data?.ig_profile_picture_url as
            | string
            | null
            | undefined) ?? null)
        : null;

  return getPreferredAvatarUrl({ instagramAvatarUrl: igAvatar, user });
}

export function useIsProfileComplete(): boolean {
  const { role } = useAuth();
  const businessQ = useMyBusinessIdentity();
  if (role !== "business") return true;
  return isBusinessProfileComplete({
    basicProfile: businessQ.data?.basicProfile ?? null,
    businessProfile: businessQ.data?.businessProfile ?? null,
  });
}
