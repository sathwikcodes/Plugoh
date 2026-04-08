"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import { BarChart3 } from "lucide-react";
import type { Database } from "@/lib/supabase/types";
import { AnalyticsPackageBreakdown } from "./analytics-package-breakdown";
import { AnalyticsTopInfluencers } from "./analytics-top-influencers";
import { AnalyticsFunnel } from "./analytics-funnel";

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

  const packageData = useMemo(() => {
    const map: Record<string, { count: number; total: number }> = {};
    for (const c of completed) {
      const pkg = c.package_type || "other";
      if (!map[pkg]) map[pkg] = { count: 0, total: 0 };
      map[pkg].count++;
      map[pkg].total += c.price_offered || 0;
    }
    return Object.entries(map)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([name, { count, total }]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        rawName: name,
        count,
        total,
      }));
  }, [completed]);

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
      if (prev !== undefined) spendMap.set(key, prev + (c.price_offered || 0));
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
      map[c.influencer_profile_id].total += c.price_offered || 0;
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

  const funnel = useMemo(() => {
    let sent = 0;
    let accepted = 0;
    let done = 0;
    for (const c of campaigns) {
      if (c.status !== "rejected") sent++;
      if (c.status === "accepted" || c.status === "completed") accepted++;
      if (c.status === "completed") done++;
    }
    return { sent, accepted, done };
  }, [campaigns]);

  if (completed.length === 0) {
    return (
      <div className="pt-8 text-center space-y-3">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/10">
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
      {packageData.length > 0 && (
        <m.div variants={fadeUp}>
          <AnalyticsPackageBreakdown data={packageData} />
        </m.div>
      )}
      <m.div variants={fadeUp}>
        <AnalyticsSpendChart data={monthlyData} />
      </m.div>
      {topInfluencers.length > 0 && (
        <m.div variants={fadeUp}>
          <AnalyticsTopInfluencers data={topInfluencers} />
        </m.div>
      )}
      <m.div variants={fadeUp}>
        <AnalyticsFunnel data={funnel} />
      </m.div>
    </m.div>
  );
}
