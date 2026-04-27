"use client";

import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  Clock,
  Image as ImageIcon,
  Pencil,
  Video,
} from "lucide-react";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type InstagramMedia = Database["public"]["Tables"]["instagram_media"]["Row"];

interface Props {
  ip: InfluencerProfile;
  campaigns: Campaign[];
  media: InstagramMedia[];
  onStatusUpdate: (id: string, status: string) => Promise<void>;
  onTabChange: (tab: string) => void;
}

function formatNumber(value: number | null | undefined): string {
  if (value == null) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Captured at module load time — not during render, avoids React Compiler purity checks
const NOW_MS = Date.now();
const NOW_DATE = new Date(NOW_MS);

export function InfluencerProfileOverview({
  ip,
  campaigns,
  onStatusUpdate,
  onTabChange,
}: Props) {
  const currentYear = NOW_DATE.getFullYear();
  const currentMonth = NOW_DATE.getMonth();

  // Earnings
  const monthEarnings = campaigns
    .filter((c) => {
      if (c.status !== "accepted" && c.status !== "completed") return false;
      const d = new Date(c.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .reduce((sum, c) => sum + (c.price_offered || 0), 0);

  const allTimeEarnings = campaigns
    .filter((c) => c.status === "accepted" || c.status === "completed")
    .reduce((sum, c) => sum + (c.price_offered || 0), 0);

  const pendingEarnings = campaigns
    .filter((c) => c.status === "accepted")
    .reduce((sum, c) => sum + (c.price_offered || 0), 0);

  const completedEarnings = campaigns
    .filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + (c.price_offered || 0), 0);

  const activeCampaigns = campaigns.filter((c) => c.status === "accepted");

  // Chart data: 4 weekly buckets for last 30 days
  const thirtyDaysAgo = new Date(NOW_MS - 30 * 24 * 60 * 60 * 1000);
  const earningsChartData = [
    { week: "Wk 1", earnings: 0 },
    { week: "Wk 2", earnings: 0 },
    { week: "Wk 3", earnings: 0 },
    { week: "Wk 4", earnings: 0 },
  ];
  campaigns
    .filter((c) => {
      if (c.status !== "accepted" && c.status !== "completed") return false;
      return new Date(c.created_at) >= thirtyDaysAgo;
    })
    .forEach((c) => {
      const daysAgo = Math.floor(
        (NOW_MS - new Date(c.created_at).getTime()) / (24 * 60 * 60 * 1000),
      );
      const bucketIdx = Math.min(3, Math.floor(daysAgo / 7));
      earningsChartData[3 - bucketIdx].earnings += c.price_offered || 0;
    });

  // Engagement
  const avgLikes = ip.avg_likes_per_reel;
  const followers = ip.ig_followers_count;
  const engagementRate =
    avgLikes && followers && followers > 0
      ? ((avgLikes / followers) * 100).toFixed(2)
      : null;

  // Package stats
  const packageStats = (["reel", "post", "story"] as const).map((type) => {
    const matching = campaigns.filter(
      (c) =>
        (c.package_type || "").toLowerCase() === type &&
        (c.status === "accepted" || c.status === "completed"),
    );
    const avg =
      matching.length > 0
        ? Math.round(
            matching.reduce((s, c) => s + (c.price_offered || 0), 0) /
              matching.length,
          )
        : 0;
    return { type, count: matching.length, avg };
  });

  // Platform stats
  const acceptedCampaigns = campaigns.filter(
    (c) => c.status === "accepted" || c.status === "completed",
  );
  const completedCampaigns = campaigns.filter((c) => c.status === "completed");
  const avgCampaignValue =
    acceptedCampaigns.length > 0
      ? Math.round(
          acceptedCampaigns.reduce((s, c) => s + (c.price_offered || 0), 0) /
            acceptedCampaigns.length,
        )
      : 0;

  const displayName = ip.display_name || "Influencer";
  const handle = ip.ig_username ? `@${ip.ig_username}` : "";

  return (
    <div className="space-y-4 pb-8">
      {/* Section 1 — Profile Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage
                src={ip.ig_profile_picture_url || undefined}
                alt={displayName}
              />
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-bold text-lg truncate">{displayName}</p>
              {handle && (
                <p className="text-sm text-muted-foreground">{handle}</p>
              )}
            </div>
          </div>
          {/* Horizontal-scroll chips */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
            <span className="shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
              ₹{monthEarnings.toLocaleString()} this month
            </span>
            <span className="shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-success/10 text-success border-success/20">
              {activeCampaigns.length} active jobs
            </span>
            {engagementRate && (
              <span className="shrink-0 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium bg-accent/20 text-accent-foreground border-accent/30">
                {engagementRate}% engagement
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 2 — Earnings Overview */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
          Earnings Overview
        </h2>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold text-primary">
                ₹{allTimeEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold text-warning">
                ₹{pendingEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-xl font-bold text-success">
                ₹{completedEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Payouts</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3">
              Last 30 days (weekly)
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={earningsChartData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 12,
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value) => [
                    `₹${Number(value ?? 0).toLocaleString()}`,
                    "Earnings",
                  ]}
                />
                <Bar
                  dataKey="earnings"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Section 3 — Active Jobs */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
          Active Jobs
        </h2>
        {activeCampaigns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Briefcase className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No active jobs yet
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTabChange("pending")}
              >
                View Pending Requests
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeCampaigns.map((c) => {
              const deadline = new Date(
                new Date(c.created_at).getTime() + 30 * 24 * 60 * 60 * 1000,
              );
              return (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">
                          {c.title || "Untitled"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                          {c.package_type || "—"} · Due{" "}
                          {deadline.toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-primary shrink-0">
                        ₹{(c.price_offered || 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => onStatusUpdate(c.id, "completed")}
                      >
                        Mark Complete
                      </Button>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/dashboard/influencer/campaigns/${c.id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Section 4 — My Packages */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            My Packages
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onTabChange("edit")}
          >
            <Pencil className="h-3 w-3 mr-1" /> Edit Prices
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {packageStats.map(({ type, count, avg }) => {
            const priceMap = {
              reel: ip.price_per_reel,
              post: ip.price_per_post,
              story: ip.price_per_story,
            };
            const price = priceMap[type];
            const Icon =
              type === "reel" ? Video : type === "post" ? ImageIcon : Clock;
            return (
              <Card key={type}>
                <CardContent className="p-4 text-center">
                  <Icon className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-xs font-semibold capitalize mb-1">
                    {type}
                  </p>
                  <p className="text-base font-bold">
                    {price != null ? `₹${price.toLocaleString()}` : "Not set"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {count > 0 ? `Booked ${count}×` : "No bookings"}
                  </p>
                  {avg > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Avg ₹{avg.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Section 5 — Key Metrics */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
          Key Metrics
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Followers",
              value: formatNumber(ip.ig_followers_count),
            },
            {
              label: "Avg Reel Views",
              value: formatNumber(ip.avg_views_per_reel),
            },
            {
              label: "Engagement",
              value: engagementRate ? `${engagementRate}%` : "—",
            },
            {
              label: "Total Campaigns",
              value: campaigns.length.toString(),
            },
            {
              label: "Completed",
              value: completedCampaigns.length.toString(),
            },
            {
              label: "Avg Campaign",
              value:
                avgCampaignValue > 0
                  ? `₹${avgCampaignValue.toLocaleString()}`
                  : "—",
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border bg-card p-4 text-center"
            >
              <p className="text-xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6 — Footer CTAs */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="default"
          className="flex-1"
          onClick={() => onTabChange("edit")}
        >
          <Pencil className="h-4 w-4 mr-2" /> Edit Profile
        </Button>
        <Button variant="outline" className="flex-1" disabled>
          View Public Profile
          <span className="ml-2 text-xs text-muted-foreground">
            (coming soon)
          </span>
        </Button>
      </div>
    </div>
  );
}
