"use client";

import { useState } from "react";
import Image from "next/image";
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
      gradient: "from-amber-400/20 to-orange-400/20",
      iconColor: "text-amber-400",
    }
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
              {/* Platform icon */}
              <div className="shrink-0">
                <Image
                  src="/instagram_icon.png"
                  alt="Instagram"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base truncate">@{handle}</p>
                  {profile.instagram_url && (
                    <a
                      href={profile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="View on Instagram"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {profile.ig_biography && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {profile.ig_biography}
                  </p>
                )}
              </div>
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
    </m.div>
  );
}
