"use client";

import { useMemo, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { AwardBadge, type AwardBadgeType } from "@/components/ui/award-badge";
import {
  TrendingUp,
  TrendingDown,
  Briefcase,
  Loader2,
  ArrowUpRight,
  Wallet,
  Lock,
  Star,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { stagger, fadeUp } from "@/lib/animations";
import type { Database } from "@/lib/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// ─── Tier Config ─────────────────────────────────────────────────────────────
const TIERS = [
  {
    name: "Rising Star",
    threshold: 0,
    next: 25000,
    emoji: "/star.png",
    fromClass: "from-emerald-500",
    toClass: "to-teal-500",
    borderClass: "border-emerald-500/30",
    bgClass: "from-emerald-500/10 to-teal-500/10",
    textClass: "text-emerald-400",
    barClass: "from-emerald-500 to-teal-400",
  },
  {
    name: "Creator",
    threshold: 25000,
    next: 100000,
    emoji: "/star.png",
    fromClass: "from-blue-500",
    toClass: "to-indigo-500",
    borderClass: "border-blue-500/30",
    bgClass: "from-blue-500/10 to-indigo-500/10",
    textClass: "text-blue-400",
    barClass: "from-blue-500 to-indigo-400",
  },
  {
    name: "Pro Creator",
    threshold: 100000,
    next: 500000,
    emoji: "/star.png",
    fromClass: "from-amber-500",
    toClass: "to-orange-500",
    borderClass: "border-amber-500/30",
    bgClass: "from-amber-500/10 to-orange-500/10",
    textClass: "text-amber-400",
    barClass: "from-amber-500 to-orange-400",
  },
  {
    name: "Elite Creator",
    threshold: 500000,
    next: 1500000,
    emoji: "/star.png",
    fromClass: "from-violet-500",
    toClass: "to-purple-500",
    borderClass: "border-violet-500/30",
    bgClass: "from-violet-500/10 to-purple-500/10",
    textClass: "text-violet-400",
    barClass: "from-violet-500 to-purple-400",
  },
  {
    name: "Top Creator",
    threshold: 1500000,
    next: null,
    emoji: "/star.png",
    fromClass: "from-yellow-400",
    toClass: "to-amber-300",
    borderClass: "border-yellow-400/30",
    bgClass: "from-yellow-400/10 to-amber-300/10",
    textClass: "text-yellow-400",
    barClass: "from-yellow-400 to-amber-300",
  },
] as const;

// ─── Tier Badge Map ───────────────────────────────────────────────────────────
const TIER_BADGE_MAP: Record<string, { type: AwardBadgeType; place?: number }> =
  {
    "Rising Star": { type: "product-of-the-week", place: 3 },
    Creator: { type: "product-of-the-week", place: 1 },
    "Pro Creator": { type: "product-of-the-month", place: 2 },
    "Elite Creator": { type: "product-of-the-day", place: 1 },
    "Top Creator": { type: "golden-kitty" },
  };

// ─── Milestones ───────────────────────────────────────────────────────────────
const MILESTONES = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value }: { value: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayed(0);
      return;
    }
    const start = Date.now();
    const duration = 1200;
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <>{displayed.toLocaleString("en-IN")}</>;
}

// ─── Badge definition type ────────────────────────────────────────────────────
type BadgeDef = {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  earned: boolean;
  earnedGradient: string;
  earnedBorder: string;
};

export default function EarningsPage() {
  const { user } = useAuth();
  const { data: allCampaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "influencer",
  );

  const campaigns = useMemo(
    () =>
      allCampaigns.filter(
        (c) => c.status === "accepted" || c.status === "completed",
      ),
    [allCampaigns],
  );

  const businessIds = useMemo(
    () => [...new Set(campaigns.map((c) => c.business_id))],
    [campaigns],
  );

  const { data: businessProfiles = new Map<string, Profile>() } = useQuery({
    queryKey: ["business-profiles-batch", businessIds],
    queryFn: async () => {
      if (businessIds.length === 0) return new Map<string, Profile>();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", businessIds);
      if (error) throw error;
      return new Map((data || []).map((p) => [p.id, p]));
    },
    enabled: businessIds.length > 0,
    staleTime: 30_000,
  });

  const stats = useMemo(() => {
    const comp = campaigns.filter((c) => c.status === "completed");
    const act = campaigns.filter((c) => c.status === "accepted");
    const earned = comp.reduce((s, c) => s + (c.price_offered || 0), 0);
    const pending = act.reduce((s, c) => s + (c.price_offered || 0), 0);
    const avg = comp.length > 0 ? Math.round(earned / comp.length) : 0;

    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    const thisMe = comp
      .filter((c) => {
        const d = new Date(c.updated_at || c.created_at);
        return d.getMonth() === curMonth && d.getFullYear() === curYear;
      })
      .reduce((s, c) => s + (c.price_offered || 0), 0);

    const lastDate = new Date(curYear, curMonth - 1, 1);
    const lastMe = comp
      .filter((c) => {
        const d = new Date(c.updated_at || c.created_at);
        return (
          d.getMonth() === lastDate.getMonth() &&
          d.getFullYear() === lastDate.getFullYear()
        );
      })
      .reduce((s, c) => s + (c.price_offered || 0), 0);

    const change =
      lastMe > 0
        ? Math.round(((thisMe - lastMe) / lastMe) * 100)
        : thisMe > 0
          ? 100
          : 0;

    const monthly: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      const monthName = d.toLocaleDateString("en", { month: "short" });
      const me = comp
        .filter((c) => {
          const cd = new Date(c.updated_at || c.created_at);
          return (
            cd.getMonth() === d.getMonth() &&
            cd.getFullYear() === d.getFullYear()
          );
        })
        .reduce((s, c) => s + (c.price_offered || 0), 0);
      monthly.push({ month: monthName, amount: me });
    }
    const maxAmount = Math.max(...monthly.map((m) => m.amount), 1);
    const peakMonthIdx = monthly.reduce(
      (best, m, i) => (m.amount > monthly[best].amount ? i : best),
      0,
    );

    // ── Tier ──────────────────────────────────────────────────────────────────
    let tierIdx = 0;
    for (let i = 0; i < TIERS.length; i++) {
      if (earned >= TIERS[i].threshold) tierIdx = i;
    }
    const tier = TIERS[tierIdx];
    const nextTier = tierIdx < TIERS.length - 1 ? TIERS[tierIdx + 1] : null;
    const tierProgress = nextTier
      ? ((earned - tier.threshold) / (nextTier.threshold - tier.threshold)) *
        100
      : 100;
    const tierGap = nextTier ? nextTier.threshold - earned : 0;

    // ── Next Milestone ────────────────────────────────────────────────────────
    const nextMilestone = MILESTONES.find((m) => m > earned) ?? null;
    const milestoneProgress = nextMilestone
      ? (earned / nextMilestone) * 100
      : 100;

    // ── Best Month ────────────────────────────────────────────────────────────
    const bestMonth = monthly.reduce(
      (best, m) => (m.amount > best.amount ? m : best),
      { month: "", amount: 0 },
    );

    // ── Badges ────────────────────────────────────────────────────────────────
    const uniqueBrands = new Set(comp.map((c) => c.business_id)).size;
    const maxSingle = comp.reduce(
      (m, c) => Math.max(m, c.price_offered || 0),
      0,
    );
    const activeMonths = monthly.filter((m) => m.amount > 0).length;
    const hasHotStreak =
      monthly.length >= 2 &&
      monthly[monthly.length - 1].amount > 0 &&
      monthly[monthly.length - 2].amount > 0 &&
      monthly[monthly.length - 1].amount > monthly[monthly.length - 2].amount;

    const badges: BadgeDef[] = [
      {
        id: "first_step",
        label: "First Step",
        desc: "Complete your first campaign",
        emoji: "🎯",
        earned: comp.length >= 1,
        earnedGradient: "from-sky-500/20 to-blue-500/20",
        earnedBorder: "border-sky-500/30",
      },
      {
        id: "10k_club",
        label: "₹10K Club",
        desc: "Earn ₹10,000 total",
        emoji: "💰",
        earned: earned >= 10000,
        earnedGradient: "from-green-500/20 to-emerald-500/20",
        earnedBorder: "border-green-500/30",
      },
      {
        id: "1l_club",
        label: "₹1L Club",
        desc: "Earn ₹1,00,000 total",
        emoji: "🏆",
        earned: earned >= 100000,
        earnedGradient: "from-amber-500/20 to-yellow-500/20",
        earnedBorder: "border-amber-500/30",
      },
      {
        id: "brand_collector",
        label: "Brand Collector",
        desc: "Work with 5+ unique brands",
        emoji: "🤝",
        earned: uniqueBrands >= 5,
        earnedGradient: "from-pink-500/20 to-rose-500/20",
        earnedBorder: "border-pink-500/30",
      },
      {
        id: "high_roller",
        label: "High Roller",
        desc: "Single campaign ₹15K+",
        emoji: "🎰",
        earned: maxSingle >= 15000,
        earnedGradient: "from-violet-500/20 to-purple-500/20",
        earnedBorder: "border-violet-500/30",
      },
      {
        id: "consistent",
        label: "Consistent",
        desc: "Active 3+ months in last 6",
        emoji: "🔁",
        earned: activeMonths >= 3,
        earnedGradient: "from-teal-500/20 to-cyan-500/20",
        earnedBorder: "border-teal-500/30",
      },
      {
        id: "veteran",
        label: "Veteran",
        desc: "Complete 10 campaigns",
        emoji: "⭐",
        earned: comp.length >= 10,
        earnedGradient: "from-orange-500/20 to-red-500/20",
        earnedBorder: "border-orange-500/30",
      },
      {
        id: "hot_streak",
        label: "Hot Streak",
        desc: "2 months consecutive growth",
        emoji: "🔥",
        earned: hasHotStreak,
        earnedGradient: "from-red-500/20 to-orange-500/20",
        earnedBorder: "border-red-500/30",
      },
    ];

    return {
      completed: comp,
      active: act,
      totalEarned: earned,
      pendingEarnings: pending,
      avgPerCampaign: avg,
      thisMonthEarnings: thisMe,
      lastMonthEarnings: lastMe,
      monthChange: change,
      monthlyData: monthly,
      maxMonthlyAmount: maxAmount,
      peakMonthIdx,
      tier,
      tierIdx,
      nextTier,
      tierProgress,
      tierGap,
      nextMilestone,
      milestoneProgress,
      bestMonth,
      badges,
    };
  }, [campaigns]);

  if (campaignsLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const {
    completed,
    active,
    totalEarned,
    pendingEarnings,
    thisMonthEarnings,
    lastMonthEarnings,
    monthChange,
    monthlyData,
    maxMonthlyAmount,
    peakMonthIdx,
    tier,
    nextTier,
    tierProgress,
    tierGap,
    nextMilestone,
    milestoneProgress,
    bestMonth,
    badges,
  } = stats;

  const earnedBadgeCount = badges.filter((b) => b.earned).length;

  return (
    <div className="container max-w-3xl py-6 pb-32 space-y-4">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* ── Header ── */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-extrabold tracking-tight">Earnings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your creator journey, tracked.
          </p>
        </motion.div>

        {/* ── Creator Tier Hero Card ── */}
        <motion.div variants={fadeUp}>
          <div
            className={cn(
              "relative rounded-2xl border bg-gradient-to-br p-5 overflow-hidden",
              tier.borderClass,
              tier.bgClass,
            )}
          >
            {/* ambient glow */}
            <div
              className={cn(
                "absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20 blur-3xl bg-gradient-to-br",
                tier.fromClass,
                tier.toClass,
              )}
            />

            <div className="relative flex items-start gap-4">
              <img
                src={tier.emoji}
                alt="tier icon"
                className="flex-shrink-0 w-16 h-16 object-contain drop-shadow-md select-none"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <AwardBadge
                    type={TIER_BADGE_MAP[tier.name].type}
                    place={TIER_BADGE_MAP[tier.name].place}
                  />
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground">
                      Total Earned
                    </p>
                    <p className="text-2xl font-extrabold tracking-tight">
                      ₹<AnimatedNumber value={totalEarned} />
                    </p>
                  </div>
                </div>

                {nextTier ? (
                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>Progress to {nextTier.name}</span>
                      <span>{Math.round(tierProgress)}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          tier.barClass,
                        )}
                        initial={{ width: "0%" }}
                        animate={{ width: `${tierProgress}%` }}
                        transition={{
                          duration: 1.2,
                          ease: "easeOut",
                          delay: 0.4,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      ₹{tierGap.toLocaleString("en-IN")} more to unlock{" "}
                      <span className={cn("font-semibold", nextTier.textClass)}>
                        {nextTier.name}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p
                    className={cn("mt-2 text-sm font-semibold", tier.textClass)}
                  >
                    👑 Legend status. You&apos;ve reached the top.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div variants={fadeUp} className="grid gap-3 grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <img
              src="/coin.png"
              alt="coin"
              className="h-9 w-9 object-contain mb-3"
            />
            <p className="text-xl font-extrabold tracking-tight">
              ₹<AnimatedNumber value={thisMonthEarnings} />
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              This Month
            </p>
            {(thisMonthEarnings > 0 || lastMonthEarnings > 0) && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 text-[10px] font-medium",
                  monthChange >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {monthChange >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {monthChange >= 0 ? "+" : ""}
                {monthChange}%
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 mb-3">
              <ArrowUpRight className="h-4 w-4 text-yellow-400" />
            </div>
            <p className="text-xl font-extrabold tracking-tight">
              ₹<AnimatedNumber value={pendingEarnings} />
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Pending</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 mb-3">
              <Briefcase className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-xl font-extrabold tracking-tight">
              {completed.length}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Completed
            </p>
          </div>
        </motion.div>

        {/* ── Achievements Strip ── */}
        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Achievements
              </p>
              <p className="text-[11px] text-muted-foreground">
                {earnedBadgeCount}/{badges.length} unlocked
              </p>
            </div>

            <div
              className="flex gap-3 overflow-x-auto pb-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    "relative flex-shrink-0 flex flex-col items-center gap-1.5 w-[64px]",
                    !badge.earned && "opacity-40",
                  )}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl border bg-gradient-to-br flex items-center justify-center text-2xl relative",
                      badge.earned
                        ? cn(badge.earnedGradient, badge.earnedBorder)
                        : "from-white/5 to-white/5 border-white/10",
                    )}
                  >
                    {badge.earned ? (
                      <>
                        <span>{badge.emoji}</span>
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center shadow-sm">
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                        </div>
                      </>
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground/50" />
                    )}
                  </div>
                  <p className="text-[9px] text-center text-muted-foreground leading-tight font-medium line-clamp-2">
                    {badge.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Next Milestone ── */}
        {nextMilestone !== null && (
          <motion.div variants={fadeUp}>
            <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Next Milestone
                  </p>
                </div>
                <p className="text-xs font-bold text-amber-400">
                  ₹{nextMilestone.toLocaleString("en-IN")}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                    initial={{ width: "0%" }}
                    animate={{ width: `${milestoneProgress}%` }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.5 }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>₹{totalEarned.toLocaleString("en-IN")} earned</span>
                  <span>
                    ₹{(nextMilestone - totalEarned).toLocaleString("en-IN")} to
                    go
                  </span>
                </div>
              </div>

              {bestMonth.amount > 0 && (
                <p className="text-[11px] text-muted-foreground border-t border-white/5 pt-2.5">
                  🏅 Best month:{" "}
                  <span className="font-semibold text-foreground/80">
                    ₹{bestMonth.amount.toLocaleString("en-IN")}
                  </span>{" "}
                  in {bestMonth.month}
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* ── 6-Month Chart ── */}
        {completed.length > 0 && (
          <motion.div variants={fadeUp}>
            <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Last 6 Months
                </p>
                <p className="text-xs text-muted-foreground">
                  Avg ₹{stats.avgPerCampaign.toLocaleString("en-IN")}/campaign
                </p>
              </div>

              <div className="flex items-end justify-between gap-2 h-32">
                {monthlyData.map((m, i) => {
                  const isPeak = i === peakMonthIdx && m.amount > 0;
                  return (
                    <div
                      key={m.month}
                      className="flex-1 flex flex-col items-center gap-1.5"
                    >
                      {isPeak ? (
                        <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      ) : (
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {m.amount > 0
                            ? `₹${m.amount >= 1000 ? `${(m.amount / 1000).toFixed(1)}K` : m.amount}`
                            : ""}
                        </span>
                      )}
                      <div
                        className={cn(
                          "w-full rounded-t-lg transition-all",
                          m.amount > 0
                            ? isPeak
                              ? "bg-gradient-to-t from-amber-500/80 to-yellow-400/60"
                              : "bg-gradient-to-t from-pink-500/80 to-purple-500/60"
                            : "bg-white/5",
                        )}
                        style={{
                          height: `${Math.max((m.amount / maxMonthlyAmount) * 100, 4)}%`,
                          minHeight: "4px",
                        }}
                      />
                      <span
                        className={cn(
                          "text-[10px]",
                          isPeak
                            ? "text-amber-400 font-semibold"
                            : "text-muted-foreground",
                        )}
                      >
                        {m.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Transaction History ── */}
        <motion.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Transaction History
            </p>

            {completed.length === 0 && active.length === 0 ? (
              <div className="py-8 text-center">
                <Wallet className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  No transactions yet. Complete campaigns to see your earnings
                  here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {[...completed, ...active].map((c) => {
                  const bp = businessProfiles.get(c.business_id);
                  const brandName =
                    bp?.business_name || bp?.full_name || "Brand";
                  const isCompleted = c.status === "completed";
                  return (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/6 transition-colors"
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          isCompleted ? "bg-green-500/10" : "bg-yellow-500/10",
                        )}
                      >
                        <img
                          src="/coin.png"
                          alt="coin"
                          className="h-4 w-4 object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {c.title || "Untitled Campaign"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {brandName} &middot; {c.package_type || "—"}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">
                          ₹{(c.price_offered || 0).toLocaleString()}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] px-1.5 py-0 h-4 rounded-full border",
                            isCompleted
                              ? "bg-green-500/10 text-green-400 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                          )}
                        >
                          {isCompleted ? "earned" : "pending"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
