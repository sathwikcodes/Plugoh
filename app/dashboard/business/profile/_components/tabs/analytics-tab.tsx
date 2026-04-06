"use client";

import { useMemo } from "react";
import { m } from "framer-motion";
import { stagger, fadeUp } from "@/lib/animations";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  IndianRupee,
  Film,
  ImageIcon,
  Mic,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/format";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

interface AnalyticsTabProps {
  campaigns: Campaign[];
  influencerProfiles: InfluencerProfile[];
}

const PACKAGE_ICON: Record<string, React.ElementType> = {
  reel: Film,
  post: ImageIcon,
  story: Mic,
};

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

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#1a1a1a",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  color: "#fff",
  fontSize: 12,
};

export default function AnalyticsTab({
  campaigns,
  influencerProfiles,
}: AnalyticsTabProps) {
  const completed = useMemo(
    () => campaigns.filter((c) => c.status === "completed"),
    [campaigns],
  );

  // Build influencer profile map for O(1) lookups
  const ipMap = useMemo(
    () => new Map(influencerProfiles.map((ip) => [ip.id, ip])),
    [influencerProfiles],
  );

  // ── Spend by package type ─────────────────────────────────────────────────
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

  // ── Monthly spend (last 6 months) ─────────────────────────────────────────
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

  // ── Top 3 influencers by total spend ──────────────────────────────────────
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
        profile: ipMap.get(profileId) ?? null,
      }));
  }, [completed, ipMap]);

  // ── Campaign funnel ───────────────────────────────────────────────────────
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
      {/* Spend by Package Type */}
      {packageData.length > 0 && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Spend by Content Type
            </p>
            <div className="flex flex-col gap-3">
              {packageData.map((pkg) => {
                const Icon = PACKAGE_ICON[pkg.rawName] ?? Film;
                const maxTotal = packageData[0]?.total || 1;
                const pct = Math.round((pkg.total / maxTotal) * 100);
                return (
                  <div key={pkg.rawName} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{pkg.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {pkg.count} campaign{pkg.count > 1 ? "s" : ""}
                        </span>
                      </div>
                      <span className="text-sm font-semibold">
                        ₹{pkg.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </m.div>
      )}

      {/* Monthly Spend Trend */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Monthly Spend (last 6 months)
          </p>
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyData}
                margin={{ top: 4, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="spendGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => (v > 0 ? `₹${compactNumber(v)}` : "")}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  formatter={(v) => [`₹${Number(v).toLocaleString()}`, "Spend"]}
                />
                <Area
                  type="monotone"
                  dataKey="spend"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#spendGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </m.div>

      {/* Top Influencers */}
      {topInfluencers.length > 0 && (
        <m.div variants={fadeUp}>
          <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Top Influencers Worked With
            </p>
            <div className="space-y-3">
              {topInfluencers.map(({ profile: ip, total, count }, i) => {
                const name = ip?.display_name ?? "Influencer";
                const initials = name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                return (
                  <div key={i} className="flex items-center gap-3">
                    {ip?.ig_profile_picture_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ip.ig_profile_picture_url}
                        alt={name}
                        className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-white/60">
                          {initials}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {ip?.ig_followers_count || ip?.follower_count ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {compactNumber(
                              ip.ig_followers_count ?? ip.follower_count ?? 0,
                            )}
                          </span>
                        ) : null}
                        <span className="text-[11px] text-muted-foreground">
                          {count} campaign{count > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">
                        ₹{total.toLocaleString()}
                      </p>
                      <div
                        className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded-full",
                          i === 0
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-white/5 text-muted-foreground",
                        )}
                      >
                        #{i + 1}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </m.div>
      )}

      {/* Campaign Funnel */}
      <m.div variants={fadeUp}>
        <div className="rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Campaign Funnel
          </p>
          <div className="flex items-center gap-3">
            {[
              {
                label: "Sent",
                value: funnel.sent,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                label: "Accepted",
                value: funnel.accepted,
                color: "text-green-400",
                bg: "bg-green-500/10",
              },
              {
                label: "Completed",
                value: funnel.done,
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
            ].map((stage, i) => (
              <div key={stage.label} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "flex-1 rounded-xl px-3 py-3 text-center",
                    stage.bg,
                  )}
                >
                  <p className={cn("text-xl font-extrabold", stage.color)}>
                    {stage.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {stage.label}
                  </p>
                </div>
                {i < 2 && (
                  <IndianRupee className="h-3 w-3 text-muted-foreground/30 shrink-0 -rotate-90" />
                )}
              </div>
            ))}
          </div>
        </div>
      </m.div>
    </m.div>
  );
}
