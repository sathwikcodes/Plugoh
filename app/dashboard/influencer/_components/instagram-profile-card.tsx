"use client";

import { useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Heart,
  Image as ImageIcon,
  Lock,
  MessageCircle,
  RefreshCw,
  Video,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];
type ProfileWithOptionalIg = InfluencerProfile & {
  ig_account_type?: string | null;
  ig_website?: string | null;
};

interface InstagramProfileCardProps {
  profile: InfluencerProfile;
  media: InstagramMedia[];
  onSync: () => void;
  isSyncing?: boolean;
}

function formatNumber(value: number | null | undefined) {
  if (!value && value !== 0) return "—";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function mediaIcon(mediaType: string | null) {
  if (mediaType === "VIDEO" || mediaType === "REELS") {
    return <Video className="h-3.5 w-3.5" />;
  }
  return <ImageIcon className="h-3.5 w-3.5" />;
}

export function InstagramProfileCard({
  profile,
  media,
  onSync,
  isSyncing = false,
}: InstagramProfileCardProps) {
  const igProfile = profile as ProfileWithOptionalIg;
  const [avatarFailed, setAvatarFailed] = useState(false);

  const engagementRate = useMemo(() => {
    const totalEngagement = media.reduce(
      (sum, item) => sum + (item.like_count ?? 0) + (item.comments_count ?? 0),
      0,
    );
    const avgEngagement = media.length ? totalEngagement / media.length : 0;
    if (!profile.ig_followers_count) return null;
    return ((avgEngagement / profile.ig_followers_count) * 100).toFixed(2);
  }, [media, profile.ig_followers_count]);

  const displayName =
    profile.display_name?.trim() || profile.ig_username || "Creator";
  const avatarInitials = initialsFromName(displayName || "Creator");
  const website = igProfile.ig_website?.trim() || null;
  const accountType = igProfile.ig_account_type?.trim() || null;
  const previewMedia = media.slice(0, 9);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="h-14 w-14">
            {!avatarFailed && profile.ig_profile_picture_url && (
              <AvatarImage
                src={profile.ig_profile_picture_url}
                alt={displayName}
                onError={() => setAvatarFailed(true)}
              />
            )}
            <AvatarFallback>{avatarInitials || "CR"}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-xl">{displayName}</CardTitle>
            <div className="flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                @{profile.ig_username || "instagram"}
              </p>
              {accountType && (
                <Badge variant="secondary" className="capitalize">
                  {accountType.toLowerCase()}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button onClick={onSync} disabled={isSyncing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
          />
          Sync Instagram
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold">
              {formatNumber(profile.ig_followers_count)}
            </p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold">
              {formatNumber(profile.ig_follows_count)}
            </p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold">
              {formatNumber(profile.ig_media_count)}
            </p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-lg font-semibold">
              {engagementRate ? `${engagementRate}%` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
        </div>

        {profile.ig_biography && (
          <div className="space-y-1">
            <p className="text-xs uppercase text-muted-foreground">Bio</p>
            <p className="text-sm">{profile.ig_biography}</p>
          </div>
        )}

        {website && (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            {website}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Recent Media</p>
          {previewMedia.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No posts synced yet.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {previewMedia.map((item) => {
                const previewSrc = item.thumbnail_url || item.media_url || "";
                return (
                  <a
                    key={item.id}
                    href={item.permalink || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
                  >
                    {previewSrc ? (
                      <div
                        className="h-full w-full bg-cover bg-center transition-transform duration-200 group-hover:scale-105"
                        style={{ backgroundImage: `url("${previewSrc}")` }}
                        role="img"
                        aria-label={item.caption || "Instagram media"}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="absolute left-2 top-2 rounded-full bg-black/60 p-1 text-white">
                      {mediaIcon(item.media_type)}
                    </div>
                    <div className="absolute inset-0 hidden items-center justify-center gap-3 bg-black/55 text-xs text-white group-hover:flex">
                      <span className="inline-flex items-center gap-1">
                        <Heart className="h-3.5 w-3.5" />
                        {formatNumber(item.like_count)}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {formatNumber(item.comments_count)}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Price/Reel</p>
            <p className="font-medium">
              ₹{profile.price_per_reel?.toLocaleString() || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price/Post</p>
            <p className="font-medium">
              ₹{profile.price_per_post?.toLocaleString() || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Price/Story</p>
            <p className="font-medium">
              ₹{profile.price_per_story?.toLocaleString() || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Languages</p>
            <p className="font-medium">
              {profile.languages?.join(", ") || "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="font-medium">{profile.category || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">City</p>
            <p className="font-medium">{profile.city || "—"}</p>
          </div>
        </div>

        <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
          <p className="inline-flex items-center gap-1">
            <Lock className="h-3.5 w-3.5" />
            Instagram metrics are auto-synced from your connected account.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
