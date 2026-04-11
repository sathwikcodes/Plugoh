"use client";

import Image from "next/image";
import { Instagram, MapPin, Users, Grid3X3, ExternalLink } from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

interface InstagramTabProps {
  businessProfile: BusinessProfile;
  authAvatarUrl?: string | null;
  media: InstagramMedia[];
}

export default function BusinessInstagramTab({
  businessProfile,
  authAvatarUrl,
  media,
}: InstagramTabProps) {
  const handle = businessProfile.ig_username;
  const avatar = businessProfile.ig_profile_picture_url || authAvatarUrl;
  const recentMedia = media.slice(0, 9);

  if (!handle) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5">
        <p className="text-sm text-muted-foreground">
          Connect Instagram to showcase your brand profile and synced content.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5">
        <div className="flex items-center gap-4">
          <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5">
            {avatar ? (
              <Image
                src={avatar}
                alt={handle}
                fill
                className="object-cover"
                sizes="72px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Instagram className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold truncate">@{handle}</p>
              {businessProfile.instagram_url && (
                <a
                  href={businessProfile.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary/80 hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {businessProfile.ig_biography && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {businessProfile.ig_biography}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-white/10 bg-card/60 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span className="text-xs">Followers</span>
          </div>
          <p className="mt-2 text-xl font-bold">
            {businessProfile.ig_followers_count?.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-card/60 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Instagram className="h-4 w-4" />
            <span className="text-xs">Following</span>
          </div>
          <p className="mt-2 text-xl font-bold">
            {businessProfile.ig_follows_count?.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-card/60 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Grid3X3 className="h-4 w-4" />
            <span className="text-xs">Posts</span>
          </div>
          <p className="mt-2 text-xl font-bold">
            {businessProfile.ig_media_count?.toLocaleString() ?? "—"}
          </p>
        </div>
      </div>

      {recentMedia.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Media
            </p>
            {businessProfile.brand_location && (
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {businessProfile.brand_location}
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {recentMedia.map((item) => {
              const src = item.thumbnail_url || item.media_url;
              return (
                <a
                  key={item.id}
                  href={item.permalink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="relative aspect-square overflow-hidden rounded-xl border border-white/10 bg-white/5"
                >
                  {src ? (
                    <Image
                      src={src}
                      alt={item.caption || "Instagram media"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 180px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Instagram className="h-5 w-5" />
                    </div>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
