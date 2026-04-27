"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { BarChart3 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { brandDisplayAmountFromCampaign } from "@/lib/brand-pricing";
import { AnalyticsTopInfluencers } from "./analytics-top-influencers";

const AnalyticsSpendChart = dynamic(
  () =>
    import("./analytics-spend-chart").then((m) => ({
      default: m.AnalyticsSpendChart,
    })),
  { ssr: false },
);

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface AnalyticsTabProps {
  campaigns: Campaign[];
  influencerProfiles: InfluencerProfile[];
}

export default function AnalyticsTab({
  campaigns,
  influencerProfiles,
}: AnalyticsTabProps) {
  const completed = useMemo(
    () => campaigns.filter((c) => c.status === "completed"),
    [campaigns],
  );

  const ipMap = useMemo(
    () => new Map(influencerProfiles.map((ip) => [ip.id, ip])),
    [influencerProfiles],
  );

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { label: string; key: string; spend: number }[] = [];
    const spendMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      months.push({ label: MONTH_LABELS[d.getMonth()], key, spend: 0 });
      spendMap.set(key, 0);
    }
    for (const c of completed) {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const prev = spendMap.get(key);
      if (prev !== undefined)
        spendMap.set(key, prev + brandDisplayAmountFromCampaign(c));
    }
    return months.map((m) => ({
      name: m.label,
      spend: spendMap.get(m.key) ?? 0,
    }));
  }, [completed]);

  const topInfluencers = useMemo(() => {
    const map: Record<
      string,
      { total: number; count: number; profileId: string }
    > = {};
    for (const c of completed) {
      if (!c.influencer_profile_id) continue;
      if (!map[c.influencer_profile_id]) {
        map[c.influencer_profile_id] = {
          total: 0,
          count: 0,
          profileId: c.influencer_profile_id,
        };
      }
      map[c.influencer_profile_id].total += brandDisplayAmountFromCampaign(c);
      map[c.influencer_profile_id].count++;
    }
    return Object.values(map)
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map(({ total, count, profileId }) => ({
        total,
        count,
        profileId,
        profile: ipMap.get(profileId) ?? null,
      }));
  }, [completed, ipMap]);

  if (completed.length === 0) {
    return (
      <div className="pt-8 text-center space-y-3">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-linear-to-br from-primary/10 to-[#b02aaa]/10">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="font-semibold">No analytics yet</p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Complete your first campaign to unlock spend analytics and insights
        </p>
      </div>
    );
  }

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-4 pt-4"
    >
      <m.div variants={fadeUp}>
        <AnalyticsSpendChart data={monthlyData} />
      </m.div>
      {topInfluencers.length > 0 && (
        <m.div variants={fadeUp}>
          <AnalyticsTopInfluencers data={topInfluencers} />
        </m.div>
      )}
    </m.div>
  );
}
