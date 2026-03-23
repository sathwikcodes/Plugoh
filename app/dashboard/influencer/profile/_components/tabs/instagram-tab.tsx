"use client";

import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Instagram, Users, Eye, Heart, BarChart2, Link } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface InstagramTabProps {
  profile: InfluencerProfile;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function InstagramTab({ profile }: InstagramTabProps) {
  const handle = profile.instagram_handle || profile.ig_username;
  const isConnected = !!(handle || profile.ig_user_id);

  const engagementRate =
    profile.follower_count &&
    (profile.avg_likes_per_reel || profile.avg_views_per_reel)
      ? (
          (((profile.avg_likes_per_reel || 0) +
            (profile.avg_views_per_reel || 0) * 0.1) /
            profile.follower_count) *
          100
        ).toFixed(1)
      : null;

  const stats = [
    {
      icon: Users,
      label: "Followers",
      value: profile.follower_count
        ? formatCompact(profile.follower_count)
        : null,
      gradient: "from-pink-500/20 to-rose-500/20",
      iconColor: "text-pink-400",
    },
    {
      icon: Eye,
      label: "Avg Views / Reel",
      value: profile.avg_views_per_reel
        ? formatCompact(profile.avg_views_per_reel)
        : null,
      gradient: "from-purple-500/20 to-violet-500/20",
      iconColor: "text-purple-400",
    },
    {
      icon: Heart,
      label: "Avg Likes / Reel",
      value: profile.avg_likes_per_reel
        ? formatCompact(profile.avg_likes_per_reel)
        : null,
      gradient: "from-red-500/20 to-orange-500/20",
      iconColor: "text-red-400",
    },
    {
      icon: BarChart2,
      label: "Engagement Rate",
      value: engagementRate ? `${engagementRate}%` : null,
      gradient: "from-blue-500/20 to-indigo-500/20",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      {/* Connection status */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Connected Account
          </p>
          {isConnected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                  <Instagram className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">@{handle}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-xs text-green-400">Connected</span>
                  </div>
                </div>
              </div>
              {profile.instagram_url && (
                <a
                  href={profile.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Link className="h-4 w-4" />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
                <Instagram className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  No account connected
                </p>
                <p className="text-xs text-muted-foreground/60 mt-0.5">
                  Connect via the onboarding flow
                </p>
              </div>
            </div>
          )}
        </div>
      </m.div>

      {/* Stats grid */}
      {isConnected && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Account Stats
            </p>
            <div className="grid grid-cols-2 gap-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/5 p-3 transition-all hover:border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <div
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br",
                        stat.gradient,
                      )}
                    >
                      <stat.icon
                        className={cn("h-3.5 w-3.5", stat.iconColor)}
                      />
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
          </div>
        </m.div>
      )}

      {/* Media count info */}
      {profile.ig_media_count && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total posts</span>
              <span className="font-semibold">{profile.ig_media_count}</span>
            </div>
          </div>
        </m.div>
      )}

      <m.div variants={fadeUp}>
        <p className="text-xs text-muted-foreground text-center px-4">
          Stats are synced automatically from your connected Instagram account.
        </p>
      </m.div>
    </m.div>
  );
}
