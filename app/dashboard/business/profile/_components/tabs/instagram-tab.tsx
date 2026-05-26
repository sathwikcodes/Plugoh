"use client";

import Image from "next/image";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { Instagram, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectInstagramButton } from "@/components/instagram/connect-instagram-button";
import type { Database } from "@/lib/supabase/types";

type BusinessProfile = Database["public"]["Tables"]["business_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

interface InstagramTabProps {
  businessProfile: BusinessProfile;
  media: InstagramMedia[];
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export default function BusinessInstagramTab({
  businessProfile,
  media,
}: InstagramTabProps) {
  const handle = businessProfile.ig_username;
  const isConnected = !!(handle ?? businessProfile.ig_user_id);

  const likes = media
    .map((item) => item.like_count)
    .filter((n): n is number => typeof n === "number");
  const viewLikeValues = media
    .map((item) => item.video_views ?? item.reach)
    .filter((n): n is number => typeof n === "number");

  const avgLikes =
    likes.length > 0
      ? Math.round(likes.reduce((sum, n) => sum + n, 0) / likes.length)
      : null;
  const avgViews =
    viewLikeValues.length > 0
      ? Math.round(
          viewLikeValues.reduce((sum, n) => sum + n, 0) / viewLikeValues.length,
        )
      : null;

  const engagementRate =
    businessProfile.ig_followers_count && avgLikes
      ? ((avgLikes / businessProfile.ig_followers_count) * 100).toFixed(1)
      : null;

  const stats = [
    {
      iconSrc: "/people_insta.png",
      label: "Followers",
      value: businessProfile.ig_followers_count
        ? formatCompact(businessProfile.ig_followers_count)
        : null,
    },
    {
      iconSrc: "/flash-insta.png",
      label: "Engagement",
      value: engagementRate ? `${engagementRate}%` : null,
    },
    {
      iconSrc: "/heart.png",
      label: "Avg Likes",
      value: avgLikes ? formatCompact(avgLikes) : null,
    },
    {
      iconSrc: "/megaphone.png",
      label: "Avg Views",
      value: avgViews ? formatCompact(avgViews) : null,
    },
  ];

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
                  src="/instagram_3d.png"
                  alt="Instagram"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-base truncate">{handle}</p>
                  {businessProfile.instagram_url && (
                    <a
                      href={businessProfile.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="View on Instagram"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                {businessProfile.ig_biography && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                    {businessProfile.ig_biography}
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
                <ConnectInstagramButton role="business" />
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
                  <Image
                    src={stat.iconSrc}
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 object-contain"
                  />
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
