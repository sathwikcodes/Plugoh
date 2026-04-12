import type { User } from "@supabase/supabase-js";

function cleanUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getAuthUserAvatarUrl(
  user: User | null | undefined,
): string | null {
  if (!user) return null;

  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  const metadataAvatar =
    cleanUrl(metadata?.avatar_url) ||
    cleanUrl(metadata?.picture) ||
    cleanUrl(metadata?.photoURL) ||
    cleanUrl(metadata?.profile_image_url);

  if (metadataAvatar) return metadataAvatar;

  const identities =
    (user.identities as Array<{
      identity_data?: Record<string, unknown>;
    }> | null) || [];

  for (const identity of identities) {
    const identityData = identity.identity_data;
    const identityAvatar =
      cleanUrl(identityData?.avatar_url) ||
      cleanUrl(identityData?.picture) ||
      cleanUrl(identityData?.photoURL);
    if (identityAvatar) return identityAvatar;
  }

  return null;
}

export function getPreferredAvatarUrl(options: {
  instagramAvatarUrl?: string | null;
  user?: User | null;
}): string | null {
  return (
    cleanUrl(options.instagramAvatarUrl) ||
    getAuthUserAvatarUrl(options.user) ||
    null
  );
}
