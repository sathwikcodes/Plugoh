"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import {
  Instagram,
  Users,
  Eye,
  Heart,
  BarChart2,
  Grid3x3,
  Play,
  ExternalLink,
  Images,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

interface InstagramTabProps {
  profile: InfluencerProfile;
  media: InstagramMedia[];
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

function mediaBadgeLabel(type: string | null) {
  if (type === "VIDEO") return "Reel";
  if (type === "CAROUSEL_ALBUM") return "Carousel";
  return "Post";
}

export default function InstagramTab({ profile, media }: InstagramTabProps) {
  const [showAll, setShowAll] = useState(false);

  const handle = profile.instagram_handle ?? profile.ig_username;
  const isConnected = !!(handle ?? profile.ig_user_id);

  const engagementRate =
    profile.ig_followers_count && profile.avg_likes_per_reel
      ? (
          (profile.avg_likes_per_reel / profile.ig_followers_count) *
          100
        ).toFixed(1)
      : null;

  const stats = [
    {
      icon: Users,
      label: "Followers",
      value: profile.ig_followers_count
        ? formatCompact(profile.ig_followers_count)
        : null,
      gradient: "from-primary/20 to-primary/5",
      iconColor: "text-primary",
    },
    {
      icon: BarChart2,
      label: "Engagement",
      value: engagementRate ? `${engagementRate}%` : null,
      gradient: "from-purple-500/20 to-violet-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: Heart,
      label: "Avg Likes",
      value: profile.avg_likes_per_reel
        ? formatCompact(Math.round(profile.avg_likes_per_reel))
        : null,
      gradient: "from-red-500/20 to-orange-500/20",
      iconColor: "text-red-400",
    },
    {
      icon: Eye,
      label: "Avg Views",
      value: profile.avg_views_per_reel
        ? formatCompact(Math.round(profile.avg_views_per_reel))
        : null,
      gradient: "from-blue-500/20 to-cyan-500/20",
      iconColor: "text-blue-400",
    },
    {
      icon: Grid3x3,
      label: "Total Posts",
      value: profile.ig_media_count ? profile.ig_media_count.toString() : null,
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-400",
    },
  ];

  const visibleMedia = showAll ? media : media.slice(0, 12);

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-2"
    >
      {/* Account header */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5">
          {isConnected ? (
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                {profile.ig_profile_picture_url ? (
                  <div
                    className="h-16 w-16 rounded-full p-[2px]"
                    style={{
                      background:
                        "linear-gradient(135deg, #f9a8d4, #c084fc, #818cf8)",
                    }}
                  >
                    <img
                      src={profile.ig_profile_picture_url}
                      alt={handle ?? ""}
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <Instagram className="h-7 w-7 text-primary" />
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-base truncate">@{handle}</p>
                {profile.ig_biography && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {profile.ig_biography}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  {profile.ig_followers_count && (
                    <span className="text-xs">
                      <span className="font-bold">
                        {formatCompact(profile.ig_followers_count)}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        followers
                      </span>
                    </span>
                  )}
                  {profile.ig_follows_count && (
                    <span className="text-xs">
                      <span className="font-bold">
                        {formatCompact(profile.ig_follows_count)}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        following
                      </span>
                    </span>
                  )}
                </div>
              </div>

              {/* External link */}
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label="View on Instagram"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                <Instagram className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  No account connected
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Connect Instagram to unlock your profile
                </p>
              </div>
            </div>
          )}
        </div>
      </m.div>

      {/* Stats grid */}
      {isConnected && (
        <m.div variants={fadeUp}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "rounded-xl border border-white/5 bg-card/60 backdrop-blur-md p-3 transition-all hover:border-white/10",
                  i === 4 ? "col-span-2 sm:col-span-1" : "",
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br",
                      stat.gradient,
                    )}
                  >
                    <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
                <p className="text-lg font-extrabold tracking-tight">
                  {stat.value ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </m.div>
      )}

      {/* Posts / Reels grid */}
      {isConnected && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Posts &amp; Reels
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <RefreshCw className="h-3 w-3" />
                <span>synced from Instagram</span>
              </div>
            </div>

            {media.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                  <Images className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No posts synced yet
                </p>
              </div>
            ) : (
              <div className="p-3">
                <div className="grid grid-cols-3 gap-2">
                  {visibleMedia.map((item) => (
                    <PostCard key={item.id} item={item} />
                  ))}
                </div>

                {media.length > 12 && (
                  <button
                    onClick={() => setShowAll((v) => !v)}
                    className="w-full mt-3 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                  >
                    {showAll ? "Show less" : `Show all ${media.length} posts`}
                  </button>
                )}
              </div>
            )}
          </div>
        </m.div>
      )}
    </m.div>
  );
}

function PostCard({ item }: { item: InstagramMedia }) {
  const isVideo = item.media_type === "VIDEO";
  const thumbnail = item.thumbnail_url ?? item.media_url;
  const metric = isVideo ? item.video_views : item.like_count;

  return (
    <button
      onClick={() => item.permalink && window.open(item.permalink, "_blank")}
      className="relative aspect-square rounded-xl overflow-hidden bg-white/5 group cursor-pointer"
    >
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={item.caption?.slice(0, 60) ?? "Post"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center">
          <Instagram className="h-6 w-6 text-muted-foreground/40" />
        </div>
      )}

      {/* Dark overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />

      {/* Media type badge */}
      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-semibold text-white/90 uppercase tracking-wide">
        {mediaBadgeLabel(item.media_type)}
      </span>

      {/* Play icon for videos */}
      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-7 w-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <Play className="h-3.5 w-3.5 text-white fill-white" />
          </div>
        </div>
      )}

      {/* Metric overlay */}
      {metric != null && metric > 0 && (
        <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm">
          {isVideo ? (
            <Eye className="h-2.5 w-2.5 text-white/80" />
          ) : (
            <Heart className="h-2.5 w-2.5 text-white/80" />
          )}
          <span className="text-[9px] font-semibold text-white/90">
            {formatCompact(metric)}
          </span>
        </div>
      )}
    </button>
  );
}
