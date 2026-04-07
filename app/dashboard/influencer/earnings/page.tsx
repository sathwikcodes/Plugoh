"use client";

import { useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useBusinessProfiles } from "@/hooks/queries/use-business-profiles";
import { TransactionTable } from "@/components/ui/transaction-table";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import {
  useEarningsSummary,
  useMonthlyData,
  useTierInfo,
  useMilestoneInfo,
  useBadges,
} from "@/hooks/queries/use-earnings-summary";
import { getBusinessDisplayName } from "@/lib/business-profile";

import { TierHeroCard } from "./_components/tier-hero-card";
import { StatsRow } from "./_components/stats-row";
import { AchievementsStrip } from "./_components/achievements-strip";
import { MilestoneCard } from "./_components/milestone-card";
import { EarningsChart } from "./_components/earnings-chart";

export default function EarningsPage() {
  const { user } = useAuth();
  const { data: allCampaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "influencer",
  );

  // Filter to accepted/completed campaigns for earnings
  const earningsCampaigns = useMemo(
    () =>
      allCampaigns.filter(
        (c) => c.status === "accepted" || c.status === "completed",
      ),
    [allCampaigns],
  );

  const businessIds = useMemo(
    () => [...new Set(earningsCampaigns.map((c) => c.business_id))],
    [earningsCampaigns],
  );

  const { data: businessProfiles = new Map() } =
    useBusinessProfiles(businessIds);

  // Focused hooks for each computation domain
  const { totalEarned, pendingEarnings, avgPerCampaign, completed, active } =
    useEarningsSummary(earningsCampaigns);
  const {
    monthlyData,
    thisMonthEarnings,
    lastMonthEarnings,
    monthChange,
    maxMonthlyAmount,
    peakMonthIdx,
  } = useMonthlyData(completed);
  const { tier, nextTier, tierProgress, tierGap } = useTierInfo(totalEarned);
  const { nextMilestone, milestoneProgress, bestMonth } = useMilestoneInfo(
    totalEarned,
    monthlyData,
  );
  const badges = useBadges(completed, totalEarned, monthlyData);

  // Transaction rows
  const transactions = useMemo(
    () =>
      [...completed, ...active].map((c) => {
        const bp = businessProfiles.get(c.business_id);
        return {
          id: c.id,
          title: c.title,
          brandName: getBusinessDisplayName(bp ?? null),
          packageType: c.package_type,
          amount: c.price_offered,
          status: c.status as "completed" | "accepted",
          date: c.updated_at || c.created_at,
        };
      }),
    [completed, active, businessProfiles],
  );

  if (campaignsLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="container max-w-3xl py-6 pb-32 space-y-4">
      <m.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {/* ── Header ── */}
        <m.div
          variants={fadeUp}
          className="flex shrink-0 items-center justify-center"
        >
          <div className="min-w-0 text-center">
            <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-3xl">
              <span className="heading-mix-accent text-4xl text-white/90">
                Earnings
              </span>
            </h1>
          </div>
        </m.div>

        <TierHeroCard
          tier={tier}
          nextTier={nextTier}
          totalEarned={totalEarned}
          tierProgress={tierProgress}
          tierGap={tierGap}
        />

        <StatsRow
          thisMonthEarnings={thisMonthEarnings}
          lastMonthEarnings={lastMonthEarnings}
          monthChange={monthChange}
          pendingEarnings={pendingEarnings}
          completedCount={completed.length}
        />

        <AchievementsStrip badges={badges} />

        {nextMilestone !== null && (
          <MilestoneCard
            totalEarned={totalEarned}
            nextMilestone={nextMilestone}
            milestoneProgress={milestoneProgress}
            bestMonth={bestMonth}
          />
        )}

        {completed.length > 0 && (
          <EarningsChart
            monthlyData={monthlyData}
            maxMonthlyAmount={maxMonthlyAmount}
            peakMonthIdx={peakMonthIdx}
            avgPerCampaign={avgPerCampaign}
          />
        )}

        {/* ── Transaction History ── */}
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transaction History
              </p>
              {completed.length + active.length > 0 && (
                <p className="text-[11px] text-muted-foreground">
                  {completed.length + active.length} transaction
                  {completed.length + active.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            <TransactionTable transactions={transactions} />
          </div>
        </m.div>
      </m.div>
    </div>
  );
}
