"use client";

import { useMemo } from "react";
import { TIERS, MILESTONES } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import type { PillPreset } from "@/components/ui/3d-pill";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];

// ── Types ────────────────────────────────────────────────────────────────────
export interface EarningsSummary {
  totalEarned: number;
  pendingEarnings: number;
  avgPerCampaign: number;
  completed: Campaign[];
  active: Campaign[];
}

export interface MonthlyDataPoint {
  month: string;
  amount: number;
}

export interface MonthlyResult {
  monthlyData: MonthlyDataPoint[];
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  monthChange: number;
  maxMonthlyAmount: number;
  peakMonthIdx: number;
}

export interface TierInfo {
  tier: (typeof TIERS)[number];
  nextTier: (typeof TIERS)[number] | null;
  tierProgress: number;
  tierGap: number;
}

export interface MilestoneInfo {
  nextMilestone: number | null;
  milestoneProgress: number;
  bestMonth: MonthlyDataPoint;
}

export type BadgePillPreset = PillPreset;

export interface BadgeDef {
  id: string;
  label: string;
  desc: string;
  emoji: string;
  earned: boolean;
  earnedGradient: string;
  earnedBorder: string;
  pillPreset: PillPreset;
}

// ── Hooks ────────────────────────────────────────────────────────────────────

export function useEarningsSummary(allCampaigns: Campaign[]): EarningsSummary {
  return useMemo(() => {
    const completed = allCampaigns.filter((c) => c.status === "completed");
    const active = allCampaigns.filter((c) => c.status === "accepted");
    const totalEarned = completed.reduce(
      (s, c) => s + (c.price_offered || 0),
      0,
    );
    const pendingEarnings = active.reduce(
      (s, c) => s + (c.price_offered || 0),
      0,
    );
    const avgPerCampaign =
      completed.length > 0 ? Math.round(totalEarned / completed.length) : 0;
    return { totalEarned, pendingEarnings, avgPerCampaign, completed, active };
  }, [allCampaigns]);
}

export function useMonthlyData(completed: Campaign[]): MonthlyResult {
  return useMemo(() => {
    const now = new Date();
    const curMonth = now.getMonth();
    const curYear = now.getFullYear();

    const monthly: MonthlyDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(curYear, curMonth - i, 1);
      const monthName = d.toLocaleDateString("en", { month: "short" });
      const me = completed
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

    const thisMe = monthly[5].amount;
    const lastMe = monthly[4].amount;
    const change =
      lastMe > 0
        ? Math.round(((thisMe - lastMe) / lastMe) * 100)
        : thisMe > 0
          ? 100
          : 0;

    const max = Math.max(...monthly.map((m) => m.amount), 1);
    const peak = monthly.reduce(
      (best, m, i) => (m.amount > monthly[best].amount ? i : best),
      0,
    );

    return {
      monthlyData: monthly,
      thisMonthEarnings: thisMe,
      lastMonthEarnings: lastMe,
      monthChange: change,
      maxMonthlyAmount: max,
      peakMonthIdx: peak,
    };
  }, [completed]);
}

export function useTierInfo(totalEarned: number): TierInfo {
  return useMemo(() => {
    let tierIdx = 0;
    for (let i = 0; i < TIERS.length; i++) {
      if (totalEarned >= TIERS[i].threshold) tierIdx = i;
    }
    const t = TIERS[tierIdx];
    const nt = tierIdx < TIERS.length - 1 ? TIERS[tierIdx + 1] : null;
    const progress = nt
      ? ((totalEarned - t.threshold) / (nt.threshold - t.threshold)) * 100
      : 100;
    const gap = nt ? nt.threshold - totalEarned : 0;
    return { tier: t, nextTier: nt, tierProgress: progress, tierGap: gap };
  }, [totalEarned]);
}

export function useMilestoneInfo(
  totalEarned: number,
  monthlyData: MonthlyDataPoint[],
): MilestoneInfo {
  return useMemo(() => {
    const nm = MILESTONES.find((m) => m > totalEarned) ?? null;
    const mp = nm ? (totalEarned / nm) * 100 : 100;
    const bm = monthlyData.reduce(
      (best, m) => (m.amount > best.amount ? m : best),
      { month: "", amount: 0 },
    );
    return { nextMilestone: nm, milestoneProgress: mp, bestMonth: bm };
  }, [totalEarned, monthlyData]);
}

export function useBadges(
  completed: Campaign[],
  totalEarned: number,
  monthlyData: MonthlyDataPoint[],
): BadgeDef[] {
  return useMemo(() => {
    const uniqueBrands = new Set(completed.map((c) => c.business_id)).size;
    const maxSingle = completed.reduce(
      (m, c) => Math.max(m, c.price_offered || 0),
      0,
    );
    const activeMonths = monthlyData.filter((m) => m.amount > 0).length;
    const hasHotStreak =
      monthlyData.length >= 2 &&
      monthlyData[monthlyData.length - 1].amount > 0 &&
      monthlyData[monthlyData.length - 2].amount > 0 &&
      monthlyData[monthlyData.length - 1].amount >
        monthlyData[monthlyData.length - 2].amount;

    return [
      {
        id: "first_step",
        label: "First Step",
        desc: "Complete your first campaign",
        emoji: "🎯",
        earned: completed.length >= 1,
        earnedGradient: "from-sky-500/20 to-blue-500/20",
        earnedBorder: "border-sky-500/30",
        pillPreset: "sky" as const,
      },
      {
        id: "10k_club",
        label: "₹10K Club",
        desc: "Earn ₹10,000 total",
        emoji: "💰",
        earned: totalEarned >= 10000,
        earnedGradient: "from-green-500/20 to-emerald-500/20",
        earnedBorder: "border-green-500/30",
        pillPreset: "emerald" as const,
      },
      {
        id: "1l_club",
        label: "₹1L Club",
        desc: "Earn ₹1,00,000 total",
        emoji: "🏆",
        earned: totalEarned >= 100000,
        earnedGradient: "from-amber-500/20 to-yellow-500/20",
        earnedBorder: "border-amber-500/30",
        pillPreset: "amber" as const,
      },
      {
        id: "brand_collector",
        label: "Brand Collector",
        desc: "Work with 5+ unique brands",
        emoji: "🤝",
        earned: uniqueBrands >= 5,
        earnedGradient: "from-[#FF7A59]/20 to-[#FF7A59]/10",
        earnedBorder: "border-[#FF7A59]/30",
        pillPreset: "rose" as const,
      },
      {
        id: "high_roller",
        label: "High Roller",
        desc: "Single campaign ₹15K+",
        emoji: "🎰",
        earned: maxSingle >= 15000,
        earnedGradient: "from-violet-500/20 to-purple-500/20",
        earnedBorder: "border-violet-500/30",
        pillPreset: "violet" as const,
      },
      {
        id: "consistent",
        label: "Consistent",
        desc: "Active 3+ months in last 6",
        emoji: "🔁",
        earned: activeMonths >= 3,
        earnedGradient: "from-teal-500/20 to-cyan-500/20",
        earnedBorder: "border-teal-500/30",
        pillPreset: "sky" as const,
      },
      {
        id: "veteran",
        label: "Veteran",
        desc: "Complete 10 campaigns",
        emoji: "⭐",
        earned: completed.length >= 10,
        earnedGradient: "from-orange-500/20 to-red-500/20",
        earnedBorder: "border-orange-500/30",
        pillPreset: "amber" as const,
      },
      {
        id: "hot_streak",
        label: "Hot Streak",
        desc: "2 months consecutive growth",
        emoji: "🔥",
        earned: hasHotStreak,
        earnedGradient: "from-red-500/20 to-orange-500/20",
        earnedBorder: "border-red-500/30",
        pillPreset: "rose" as const,
      },
    ];
  }, [completed, totalEarned, monthlyData]);
}
