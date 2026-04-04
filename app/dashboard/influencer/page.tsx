"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useMyInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useInstagramMedia } from "@/hooks/queries/use-instagram-media";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import {
  Instagram,
  Film,
  ImageIcon,
  TrendingUp,
  TrendingDown,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "framer-motion";
import { timeAgo } from "@/lib/format";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  stagger,
  fadeUp,
} from "@/lib/animations";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

import { PulseStats, type PulseStatsData } from "./_components/pulse-stats";
import { TopContent, type TopContentItem } from "./_components/top-content";
import {
  CreatorInsights,
  type InsightItem,
} from "./_components/creator-insights";
import {
  RecentActivity,
  type RecentActivityItem,
} from "./_components/recent-activity";
import {
  QuickActions,
  type QuickActionItem,
} from "./_components/quick-actions";

export default function InfluencerDashboard() {
  const { user, profile } = useAuth();

  const { data: ip, isLoading: ipLoading } = useMyInfluencerProfile(user?.id);
  const { data: media = [], isLoading: mediaLoading } = useInstagramMedia(
    user?.id,
  );
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "influencer",
  );

  const loading = ipLoading || mediaLoading || campaignsLoading;

  // ── Quick Pulse Stats (single reduce pass) ───────────────────────────────
  const pulseStats = useMemo<PulseStatsData>(() => {
    const followers = ip?.ig_followers_count || 0;
    const avgLikes = ip?.avg_likes_per_reel || 0;

    const engagementRate = followers > 0 ? (avgLikes / followers) * 100 : 0;
    const engagementColor =
      engagementRate >= 3
        ? "text-green-400"
        : engagementRate >= 1
          ? "text-yellow-400"
          : "text-red-400";
    const engagementBg =
      engagementRate >= 3
        ? "from-green-500/20 to-emerald-500/20"
        : engagementRate >= 1
          ? "from-yellow-500/20 to-orange-500/20"
          : "from-red-500/20 to-rose-500/20";

    // Single reduce pass for all media aggregates
    const agg = media.reduce(
      (acc, m) => {
        acc.reach += m.reach || 0;
        acc.likes += m.like_count || 0;
        acc.comments += m.comments_count || 0;
        acc.saves += m.saves || 0;
        acc.impressions += m.impressions || 0;
        return acc;
      },
      { reach: 0, likes: 0, comments: 0, saves: 0, impressions: 0 },
    );

    let contentScore = 0;
    if (agg.impressions > 0) {
      const interactionRate =
        ((agg.likes + agg.comments * 2 + agg.saves * 3) / agg.impressions) *
        100;
      contentScore = Math.min(100, Math.round(interactionRate * 10));
    } else if (media.length > 0) {
      contentScore = Math.min(100, Math.round(engagementRate * 15));
    }

    return {
      engagementRate,
      engagementColor,
      engagementBg,
      totalReach: agg.reach,
      contentScore,
      // Extra fields consumed by insights (not part of PulseStatsData UI)
      _totalSaves: agg.saves,
    } as PulseStatsData & { _totalSaves: number };
  }, [ip, media]);

  // ── Top Performing Content ────────────────────────────────────────────────
  const topContent = useMemo<TopContentItem[]>(() => {
    if (media.length === 0) return [];
    return media
      .toSorted(
        (a, b) =>
          (b.like_count || 0) +
          (b.comments_count || 0) * 2 +
          (b.saves || 0) * 3 -
          ((a.like_count || 0) +
            (a.comments_count || 0) * 2 +
            (a.saves || 0) * 3),
      )
      .slice(0, 5)
      .map((m) => ({
        ...m,
        performanceScore:
          (m.like_count || 0) +
          (m.comments_count || 0) * 2 +
          (m.saves || 0) * 3,
      }));
  }, [media]);

  // ── Creator Insights (single partition pass for videos/images) ────────────
  const insights = useMemo<InsightItem[]>(() => {
    const result: InsightItem[] = [];
    if (media.length === 0) return result;

    // Single pass to partition videos and images
    const videos: typeof media = [];
    const images: typeof media = [];
    for (const m of media) {
      if (m.media_type === "VIDEO") videos.push(m);
      else if (m.media_type === "IMAGE") images.push(m);
    }

    // 1. Content Type Performance: VIDEO vs IMAGE
    if (videos.length >= 3 && images.length >= 3) {
      const avgVideoEng =
        videos.reduce((s, m) => s + (m.like_count || 0), 0) / videos.length;
      const avgImageEng =
        images.reduce((s, m) => s + (m.like_count || 0), 0) / images.length;
      if (avgVideoEng > avgImageEng) {
        const pct = Math.round(
          ((avgVideoEng - avgImageEng) / avgImageEng) * 100,
        );
        if (pct > 5) {
          result.push({
            icon: Film,
            title: `Reels get ${pct}% more likes`,
            detail: "Your video content consistently outperforms static posts",
            color: "from-purple-500/20 to-pink-500/20",
          });
        }
      } else if (avgImageEng > avgVideoEng && avgVideoEng > 0) {
        const pct = Math.round(
          ((avgImageEng - avgVideoEng) / avgVideoEng) * 100,
        );
        if (pct > 5) {
          result.push({
            icon: ImageIcon,
            title: `Photos get ${pct}% more likes`,
            detail: "Your audience engages more with image content",
            color: "from-blue-500/20 to-cyan-500/20",
          });
        }
      }
    }

    // 2. Engagement Trend: recent 10 vs older 10
    if (media.length >= 20) {
      const recent = media.slice(0, 10);
      const older = media.slice(10, 20);
      const recentAvg =
        recent.reduce((s, m) => s + (m.like_count || 0), 0) / recent.length;
      const olderAvg =
        older.reduce((s, m) => s + (m.like_count || 0), 0) / older.length;
      if (olderAvg > 0) {
        const trendPct = Math.round(((recentAvg - olderAvg) / olderAvg) * 100);
        if (Math.abs(trendPct) > 5) {
          result.push({
            icon: trendPct > 0 ? TrendingUp : TrendingDown,
            title: `Engagement ${trendPct > 0 ? "up" : "down"} ${Math.abs(trendPct)}%`,
            detail:
              trendPct > 0
                ? "Your recent content is resonating better with your audience"
                : "Consider experimenting with new content formats",
            color:
              trendPct > 0
                ? "from-green-500/20 to-emerald-500/20"
                : "from-orange-500/20 to-red-500/20",
          });
        }
      }
    }

    // 3. Saves Rate — reuse totalSaves and totalReach from pulseStats
    const totalSaves = (pulseStats as PulseStatsData & { _totalSaves: number })
      ._totalSaves;
    const totalReach = pulseStats.totalReach;
    if (totalSaves > 0 && totalReach > 0) {
      const saveRate = ((totalSaves / totalReach) * 100).toFixed(1);
      result.push({
        icon: Bookmark,
        title: `${saveRate}% save rate`,
        detail: "Top creators average 2-3% — saves signal high-value content",
        color: "from-amber-500/20 to-yellow-500/20",
      });
    }

    return result.slice(0, 3);
  }, [media, pulseStats]);

  // ── Recent Activity ──────────────────────────────────────────────────────
  const recentActivity = useMemo<RecentActivityItem[]>(() => {
    return campaigns
      .filter((c) => c.status !== "rejected")
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 4)
      .map((c) => ({
        id: c.id,
        title: c.title || "Untitled Campaign",
        status: c.status,
        time: timeAgo(c.updated_at),
        price: c.price_offered,
      }));
  }, [campaigns]);

  // ── Smart Subtitle (computed inline — trivial string) ─────────────────────
  const pendingCount = campaigns.filter((c) => c.status === "pending").length;
  const subtitle =
    pendingCount > 0
      ? `You have ${pendingCount} new offer${pendingCount > 1 ? "s" : ""} waiting`
      : pulseStats.engagementRate >= 3
        ? "Your content is performing great"
        : media.length > 0
          ? "Here's how your content is doing"
          : "Your creator command center";

  // ── Quick Actions (computed inline — trivial array) ───────────────────────
  const quickActions: QuickActionItem[] = [];
  if (pendingCount > 0) {
    quickActions.push({
      label: `${pendingCount} offer${pendingCount > 1 ? "s" : ""} waiting`,
      href: "/dashboard/influencer/campaigns",
      highlight: true,
    });
  }
  if (ip && !ip.is_active) {
    quickActions.push({
      label: "Complete your profile",
      href: "/dashboard/influencer/profile",
    });
  }
  quickActions.push({
    label: "Check earnings",
    href: "/dashboard/influencer/earnings",
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return <PageLoadingSpinner />;
  }

  // ── No Influencer Profile → Connect Instagram ────────────────────────────
  if (!ip) {
    return (
      <div className="container max-w-2xl py-12 space-y-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-card/60 backdrop-blur-md p-8 text-center space-y-4">
          <Instagram className="mx-auto h-12 w-12 text-pink-500" />
          <h1 className="text-2xl font-bold">Welcome to Plugoh!</h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Connect your Instagram to unlock your dashboard, get discovered by
            brands, and start earning.
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/onboarding">Connect Instagram</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={180}
          breathingRange={8}
          animationSpeed={0.015}
          containerStyle={GRADIENT_STYLE}
        />
      </div>

      <div className="relative z-10 container max-w-3xl py-6 pb-32 space-y-6">
        <m.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ── Profile Incomplete Banner ── */}
          {!ip.is_active && (
            <m.div variants={fadeUp}>
              <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-blue-500/5 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-purple-600">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Your profile isn&apos;t visible to brands yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Complete your profile to start receiving bookings
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 border-0"
                    asChild
                  >
                    <Link href="/dashboard/influencer/complete-profile">
                      Complete Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </m.div>
          )}

          {/* ── Greeting + Smart Subtitle ── */}
          <m.div variants={fadeUp}>
            <h1 className="heading-mix text-2xl font-semibold tracking-tight sm:text-3xl">
              Hey,{" "}
              <span className="heading-mix-accent">
                {ip.display_name || profile?.full_name || "Creator"}
              </span>{" "}
              <span className="inline-block animate-[float_3s_ease-in-out_infinite]">
                ✨
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </m.div>

          {/* ── Quick Pulse Strip ── */}
          <m.div variants={fadeUp}>
            <PulseStats stats={pulseStats} hasMedia={media.length > 0} />
          </m.div>

          {/* ── Top Performing Content ── */}
          <m.div variants={fadeUp}>
            <TopContent items={topContent} totalMediaCount={media.length} />
          </m.div>

          {/* ── Creator Insights ── */}
          <m.div variants={fadeUp}>
            <CreatorInsights insights={insights} />
          </m.div>

          {/* ── Recent Activity ── */}
          <m.div variants={fadeUp}>
            <RecentActivity items={recentActivity} />
          </m.div>

          {/* ── Quick Actions ── */}
          <m.div variants={fadeUp}>
            <QuickActions actions={quickActions} />
          </m.div>
        </m.div>
      </div>
    </div>
  );
}
