"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useMyBusinessProfile } from "@/hooks/queries/use-business-profiles";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfiles } from "@/hooks/queries/use-influencer-profiles";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  Film,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { m } from "framer-motion";
import { timeAgo } from "@/lib/format";
import {
  getBusinessDisplayName,
  isBusinessProfileComplete,
} from "@/lib/business-profile";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  stagger,
  fadeUp,
} from "@/lib/animations";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

import { SpendStats, type SpendStatsData } from "./_components/spend-stats";
import {
  ActiveCampaignsOverview,
  type ActiveCampaignCard,
} from "./_components/active-campaigns-overview";
import {
  BrandInsights,
  type BrandInsightItem,
} from "./_components/brand-insights";
import {
  RecentActivity,
  type BusinessActivityItem,
} from "./_components/recent-activity";
import {
  QuickActions,
  type QuickActionItem,
} from "./_components/quick-actions";

export default function BusinessDashboard() {
  const { user, profile, isProfileComplete, loading } = useAuth();
  const { data: identity } = useMyBusinessProfile(user?.id);

  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "business",
  );
  const { data: influencerProfiles = [], isLoading: profilesLoading } =
    useInfluencerProfiles();

  const isLoading = loading || campaignsLoading || profilesLoading;
  const displayName = getBusinessDisplayName(
    identity ?? { basicProfile: profile, businessProfile: null },
  );
  const profileComplete =
    identity ? isBusinessProfileComplete(identity) : isProfileComplete;

  // Build a Map<influencerProfileId, influencer> for O(1) lookups
  const influencerMap = useMemo(
    () => new Map(influencerProfiles.map((ip) => [ip.id, ip])),
    [influencerProfiles],
  );

  // ── Spend Stats (single reduce pass) ─────────────────────────────────────
  const spendStats = useMemo<SpendStatsData>(() => {
    let totalSpent = 0;
    let activeCampaigns = 0;
    let acceptedOrCompleted = 0;
    let total = 0;
    let completedCount = 0;

    for (const c of campaigns) {
      if (c.status === "rejected") continue;
      total++;
      if (c.status === "accepted") {
        activeCampaigns++;
        acceptedOrCompleted++;
      } else if (c.status === "completed") {
        totalSpent += c.price_offered || 0;
        completedCount++;
        acceptedOrCompleted++;
      } else if (c.status === "pending") {
        // not yet accepted
      }
    }

    const acceptanceRate =
      total > 0 ? Math.round((acceptedOrCompleted / total) * 100) : 0;
    const avgCampaignValue =
      completedCount > 0 ? Math.round(totalSpent / completedCount) : 0;

    const acceptanceColor =
      acceptanceRate >= 70
        ? "text-green-400"
        : acceptanceRate >= 40
          ? "text-yellow-400"
          : "text-red-400";
    const acceptanceBg =
      acceptanceRate >= 70
        ? "from-green-500/20 to-emerald-500/20"
        : acceptanceRate >= 40
          ? "from-yellow-500/20 to-orange-500/20"
          : "from-red-500/20 to-rose-500/20";

    return {
      totalSpent,
      activeCampaigns,
      acceptanceRate,
      avgCampaignValue,
      acceptanceColor,
      acceptanceBg,
    };
  }, [campaigns]);

  // ── Active Campaign Cards (pending + accepted, max 8 for horizontal scroll)
  const activeCampaignCards = useMemo<ActiveCampaignCard[]>(() => {
    return campaigns
      .filter((c) => c.status === "pending" || c.status === "accepted")
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 8)
      .map((c) => ({
        campaign: c,
        influencer: c.influencer_profile_id
          ? (influencerMap.get(c.influencer_profile_id) ?? null)
          : null,
      }));
  }, [campaigns, influencerMap]);

  // ── Brand Insights (computed from campaign data) ───────────────────────────
  const insights = useMemo<BrandInsightItem[]>(() => {
    const result: BrandInsightItem[] = [];
    const completed = campaigns.filter((c) => c.status === "completed");
    if (completed.length === 0) return result;

    // 1. Best package type
    const packageCounts: Record<string, { count: number; total: number }> = {};
    for (const c of completed) {
      const pkg = c.package_type || "other";
      if (!packageCounts[pkg]) packageCounts[pkg] = { count: 0, total: 0 };
      packageCounts[pkg].count++;
      packageCounts[pkg].total += c.price_offered || 0;
    }
    const entries = Object.entries(packageCounts).sort(
      (a, b) => b[1].count - a[1].count,
    );
    if (entries.length > 0) {
      const [topPkg, { count }] = entries[0];
      result.push({
        icon: Film,
        title: `${capitalize(topPkg)} is your top format`,
        detail: `${count} completed ${topPkg} campaign${count > 1 ? "s" : ""} — your best performing content type`,
        color: "from-purple-500/20 to-pink-500/20",
      });
    }

    // 2. Spend trend: this month vs last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const thisMonthSpend = completed
      .filter((c) => new Date(c.created_at) >= thisMonthStart)
      .reduce((s, c) => s + (c.price_offered || 0), 0);
    const lastMonthSpend = completed
      .filter(
        (c) =>
          new Date(c.created_at) >= lastMonthStart &&
          new Date(c.created_at) < thisMonthStart,
      )
      .reduce((s, c) => s + (c.price_offered || 0), 0);

    if (lastMonthSpend > 0) {
      const trendPct = Math.round(
        ((thisMonthSpend - lastMonthSpend) / lastMonthSpend) * 100,
      );
      if (Math.abs(trendPct) > 5) {
        result.push({
          icon: trendPct > 0 ? TrendingUp : TrendingDown,
          title: `Spend ${trendPct > 0 ? "up" : "down"} ${Math.abs(trendPct)}% this month`,
          detail:
            trendPct > 0
              ? "You're investing more in influencer marketing this month"
              : "Lower spend this month — good time to book new campaigns",
          color:
            trendPct > 0
              ? "from-blue-500/20 to-indigo-500/20"
              : "from-amber-500/20 to-orange-500/20",
        });
      }
    }

    // 3. Influencer tier insight
    const microInfluencers = completed.filter((c) => {
      const ip = c.influencer_profile_id
        ? influencerMap.get(c.influencer_profile_id)
        : null;
      return ip && (ip.ig_followers_count || ip.follower_count || 0) < 100_000;
    }).length;
    const macroInfluencers = completed.length - microInfluencers;

    if (microInfluencers > 0 || macroInfluencers > 0) {
      const topTier = microInfluencers >= macroInfluencers ? "micro" : "macro";
      result.push({
        icon: ImageIcon,
        title: `${capitalize(topTier)}-influencers drive your results`,
        detail:
          topTier === "micro"
            ? "Creators under 100K followers tend to have higher engagement rates"
            : "Larger influencers give you broader reach and brand visibility",
        color: "from-green-500/20 to-emerald-500/20",
      });
    }

    return result.slice(0, 3);
  }, [campaigns, influencerMap]);

  // ── Recent Activity (last 4, non-rejected) ────────────────────────────────
  const recentActivity = useMemo<BusinessActivityItem[]>(() => {
    return campaigns
      .filter((c) => c.status !== "rejected")
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 4)
      .map((c) => {
        const ip = c.influencer_profile_id
          ? influencerMap.get(c.influencer_profile_id)
          : null;
        return {
          id: c.id,
          title: c.title || "Untitled Campaign",
          status: c.status,
          time: timeAgo(c.updated_at),
          price: c.price_offered,
          influencerName: ip?.display_name ?? null,
        };
      });
  }, [campaigns, influencerMap]);

  // ── Smart Subtitle ────────────────────────────────────────────────────────
  const pendingCount = campaigns.filter((c) => c.status === "pending").length;
  const subtitle =
    pendingCount > 0
      ? `${pendingCount} campaign${pendingCount > 1 ? "s" : ""} awaiting influencer response`
      : spendStats.activeCampaigns > 0
        ? `${spendStats.activeCampaigns} active campaign${spendStats.activeCampaigns > 1 ? "s" : ""} in progress`
        : "Your brand command center";

  // ── Quick Actions ─────────────────────────────────────────────────────────
  const quickActions: QuickActionItem[] = [];
  if (pendingCount > 0) {
    quickActions.push({
      label: `${pendingCount} awaiting response`,
      href: "/dashboard/business/campaigns",
      highlight: true,
    });
  }
  if (!isProfileComplete) {
    quickActions.push({
      label: "Complete your profile",
      href: "/dashboard/business/profile",
    });
  }
  quickActions.push({
    label: "Discover influencers",
    href: "/dashboard/business/discover",
  });

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="relative">
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
          {!profileComplete && (
            <m.div variants={fadeUp}>
              <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-linear-to-r from-amber-500/5 via-orange-500/5 to-yellow-500/5 backdrop-blur-sm p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-orange-600">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        Complete your business profile
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Add your brand details to start booking influencers
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="shrink-0 rounded-xl bg-linear-to-r from-amber-500 to-orange-600 hover:brightness-110 border-0"
                    asChild
                  >
                    <Link href="/dashboard/business/profile">
                      Set Up Profile
                    </Link>
                  </Button>
                </div>
              </div>
            </m.div>
          )}

          {/* ── Greeting + Smart Subtitle ── */}
          <m.div variants={fadeUp}>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Hey, {displayName || "there"}{" "}
              <span className="inline-block animate-[float_3s_ease-in-out_infinite]">
                👋
              </span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </m.div>

          {/* ── Spend Stats Strip ── */}
          <m.div variants={fadeUp}>
            <SpendStats
              stats={spendStats}
              hasCampaigns={campaigns.length > 0}
            />
          </m.div>

          {/* ── Active Campaigns Overview ── */}
          <m.div variants={fadeUp}>
            <ActiveCampaignsOverview items={activeCampaignCards} />
          </m.div>

          {/* ── Brand Insights ── */}
          <m.div variants={fadeUp}>
            <BrandInsights insights={insights} />
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

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
