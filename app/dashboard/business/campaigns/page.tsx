"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, m } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Megaphone,
  Search,
  Sparkles,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { compactNumber, statusColor, timeAgo } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
} from "@/lib/animations";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];

type SortMode = "newest" | "highest_spend" | "recently_updated";
type StatusFilter = "All" | "pending" | "accepted" | "completed" | "rejected";
type LaneKey = "requested" | "active" | "completed" | "rejected";

type EnrichedCampaign = {
  campaign: Campaign;
  influencer: Pick<
    InfluencerProfile,
    | "id"
    | "display_name"
    | "ig_profile_picture_url"
    | "ig_username"
    | "category"
  > | null;
};

const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "pending",
  "accepted",
  "completed",
  "rejected",
];

const SORT_OPTIONS: Array<{ value: SortMode; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "highest_spend", label: "Highest spend" },
  { value: "recently_updated", label: "Recently updated" },
];

const LANE_CONFIG: Record<
  LaneKey,
  {
    title: string;
    description: string;
    statuses: string[];
    glow: string;
    ring: string;
    icon: typeof Clock3;
  }
> = {
  requested: {
    title: "Requested",
    description: "Bookings you initiated and are waiting on.",
    statuses: ["pending"],
    glow: "from-amber-300/20 via-orange-300/10 to-transparent",
    ring: "border-amber-300/20 bg-amber-300/6",
    icon: Clock3,
  },
  active: {
    title: "Active",
    description: "Campaigns in motion with creators already hired.",
    statuses: ["accepted"],
    glow: "from-emerald-300/20 via-cyan-300/10 to-transparent",
    ring: "border-emerald-300/20 bg-emerald-300/6",
    icon: TrendingUp,
  },
  completed: {
    title: "Completed",
    description: "Closed loops, delivered work, done campaigns.",
    statuses: ["completed"],
    glow: "from-fuchsia-300/20 via-violet-300/10 to-transparent",
    ring: "border-fuchsia-300/20 bg-fuchsia-300/6",
    icon: CheckCircle2,
  },
  rejected: {
    title: "Rejected",
    description: "Requests that did not move forward.",
    statuses: ["rejected"],
    glow: "from-rose-300/20 via-red-300/10 to-transparent",
    ring: "border-rose-300/20 bg-rose-300/6",
    icon: XCircle,
  },
};

function getInitials(name: string | null, fallback: string) {
  return (name?.trim() || fallback)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatCurrency(value: number | null) {
  if (!value) return "—";
  return `₹${value.toLocaleString()}`;
}

function formatPackage(packageType: string | null) {
  if (!packageType) return "Campaign";
  return packageType.charAt(0).toUpperCase() + packageType.slice(1);
}

function CampaignMetricCard({
  label,
  value,
  helper,
  accent,
}: {
  label: string;
  value: string;
  helper: string;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] backdrop-blur-xl">
      <CardContent className="relative p-5">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${accent} opacity-90 blur-2xl`}
        />
        <div className="relative space-y-2">
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">
            {label}
          </p>
          <p className="text-3xl font-semibold tracking-tight text-white">
            {value}
          </p>
          <p className="text-sm text-white/55">{helper}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CampaignCommandCard({ item }: { item: EnrichedCampaign }) {
  const { campaign, influencer } = item;
  const initials = getInitials(
    influencer?.display_name ?? null,
    campaign.title || "Campaign",
  );

  return (
    <Link
      href={`/dashboard/business/campaigns/${campaign.id}`}
      className="group block"
    >
      <Card className="relative h-full overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.025))] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(143,244,255,0.16),transparent_42%),radial-gradient(circle_at_top_right,rgba(255,97,196,0.14),transparent_38%)]" />
        <CardContent className="relative flex h-full flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="line-clamp-2 text-lg font-semibold leading-tight text-white">
                {campaign.title || "Untitled Campaign"}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-white/38">
                {formatPackage(campaign.package_type)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`${statusColor(campaign.status)} shrink-0 rounded-full px-2.5 py-1 capitalize`}
            >
              {campaign.status}
            </Badge>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
            {influencer?.ig_profile_picture_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={influencer.ig_profile_picture_url}
                alt={influencer.display_name || "Influencer"}
                className="h-12 w-12 rounded-full object-cover ring-1 ring-white/12"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80 ring-1 ring-white/12">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                {influencer?.display_name || "Influencer"}
              </p>
              <p className="truncate text-sm text-white/50">
                {influencer?.ig_username
                  ? `@${influencer.ig_username}`
                  : influencer?.category || "Creator booked"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Spend
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {formatCurrency(campaign.price_offered)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/42">
                Initiated
              </p>
              <p className="mt-2 text-xl font-semibold text-white">
                {timeAgo(campaign.created_at)}
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.18em] text-white/38">
                Last updated
              </p>
              <p className="truncate text-sm text-white/68">
                {timeAgo(campaign.updated_at || campaign.created_at)}
              </p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform group-hover:translate-x-1">
              Open campaign
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function EmptyLane({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.025] p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
        <Megaphone className="h-5 w-5 text-white/40" />
      </div>
      <p className="font-medium text-white">{title}</p>
      <p className="mt-1 text-sm text-white/50">{description}</p>
    </div>
  );
}

export default function CampaignsList() {
  const { user, loading: authLoading } = useAuth();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "business",
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .in("type", ["booking_accepted", "booking_rejected"])
      .eq("read", false)
      .then(() => {});
  }, [user?.id]);

  const influencerProfileIds = useMemo(
    () =>
      [
        ...new Set(
          campaigns
            .map((campaign) => campaign.influencer_profile_id)
            .filter(Boolean),
        ),
      ] as string[],
    [campaigns],
  );

  const { data: influencerProfiles = [], isLoading: profilesLoading } =
    useQuery({
      queryKey: ["campaign-dashboard-profiles", influencerProfileIds],
      queryFn: async () => {
        if (!influencerProfileIds.length) return [];
        const { data, error } = await supabase
          .from("influencer_profiles")
          .select(
            "id, display_name, ig_profile_picture_url, ig_username, category",
          )
          .in("id", influencerProfileIds);
        if (error) throw error;
        return data as Pick<
          InfluencerProfile,
          | "id"
          | "display_name"
          | "ig_profile_picture_url"
          | "ig_username"
          | "category"
        >[];
      },
      enabled: influencerProfileIds.length > 0,
      staleTime: 30_000,
    });

  const profileMap = useMemo(
    () => new Map(influencerProfiles.map((profile) => [profile.id, profile])),
    [influencerProfiles],
  );

  const enrichedCampaigns = useMemo<EnrichedCampaign[]>(
    () =>
      campaigns.map((campaign) => ({
        campaign,
        influencer: campaign.influencer_profile_id
          ? (profileMap.get(campaign.influencer_profile_id) ?? null)
          : null,
      })),
    [campaigns, profileMap],
  );

  const metrics = useMemo(() => {
    const totalSpend = campaigns.reduce(
      (sum, campaign) => sum + (campaign.price_offered || 0),
      0,
    );

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(
        (campaign) => campaign.status === "accepted",
      ).length,
      completedCampaigns: campaigns.filter(
        (campaign) => campaign.status === "completed",
      ).length,
      rejectedCampaigns: campaigns.filter(
        (campaign) => campaign.status === "rejected",
      ).length,
      totalSpend,
    };
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();
    let items = [...enrichedCampaigns];

    if (statusFilter !== "All") {
      items = items.filter((item) => item.campaign.status === statusFilter);
    }

    if (query) {
      items = items.filter((item) => {
        const title = (item.campaign.title || "").toLowerCase();
        const name = (item.influencer?.display_name || "").toLowerCase();
        const handle = (item.influencer?.ig_username || "").toLowerCase();
        return (
          title.includes(query) ||
          name.includes(query) ||
          handle.includes(query)
        );
      });
    }

    items.sort((left, right) => {
      if (sortMode === "highest_spend") {
        return (
          (right.campaign.price_offered || 0) -
          (left.campaign.price_offered || 0)
        );
      }

      if (sortMode === "recently_updated") {
        return (
          new Date(
            right.campaign.updated_at || right.campaign.created_at,
          ).getTime() -
          new Date(
            left.campaign.updated_at || left.campaign.created_at,
          ).getTime()
        );
      }

      return (
        new Date(right.campaign.created_at).getTime() -
        new Date(left.campaign.created_at).getTime()
      );
    });

    return items;
  }, [enrichedCampaigns, search, sortMode, statusFilter]);

  const lanes = useMemo(() => {
    return (Object.keys(LANE_CONFIG) as LaneKey[]).map((laneKey) => ({
      key: laneKey,
      ...LANE_CONFIG[laneKey],
      items: filteredCampaigns.filter((item) =>
        LANE_CONFIG[laneKey].statuses.includes(item.campaign.status),
      ),
    }));
  }, [filteredCampaigns]);

  const statusCounts = useMemo(
    () => ({
      All: campaigns.length,
      pending: campaigns.filter((campaign) => campaign.status === "pending")
        .length,
      accepted: campaigns.filter((campaign) => campaign.status === "accepted")
        .length,
      completed: campaigns.filter((campaign) => campaign.status === "completed")
        .length,
      rejected: campaigns.filter((campaign) => campaign.status === "rejected")
        .length,
    }),
    [campaigns],
  );

  if (authLoading || campaignsLoading || profilesLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <AnimatedGradientBackground
          Breathing
          gradientColors={GRADIENT_COLORS}
          gradientStops={GRADIENT_STOPS}
          startingGap={220}
          breathingRange={10}
          animationSpeed={0.014}
          containerStyle={GRADIENT_STYLE}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(5,8,16,0.12),rgba(5,8,16,0.62))]" />
      </div>

      <div className="relative z-10 container space-y-8 py-6">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="h-11 w-11 shrink-0"
          >
            <Link href="/dashboard/business">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/55">
              <Sparkles className="h-3.5 w-3.5" />
              Campaign command center
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Campaigns
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58 sm:text-base">
                Track who you hired, what you launched, and what still needs
                your attention, all from one brand-side control room.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <CampaignMetricCard
            label="Initiated"
            value={compactNumber(metrics.totalCampaigns)}
            helper="Total campaigns kicked off"
            accent="from-cyan-300/25 via-sky-300/10 to-transparent"
          />
          <CampaignMetricCard
            label="Active"
            value={compactNumber(metrics.activeCampaigns)}
            helper="Creators currently in motion"
            accent="from-emerald-300/25 via-green-300/10 to-transparent"
          />
          <CampaignMetricCard
            label="Completed"
            value={compactNumber(metrics.completedCampaigns)}
            helper="Closed loops and delivered work"
            accent="from-violet-300/25 via-fuchsia-300/10 to-transparent"
          />
          <CampaignMetricCard
            label="Rejected"
            value={compactNumber(metrics.rejectedCampaigns)}
            helper="Requests that did not move forward"
            accent="from-rose-300/25 via-red-300/10 to-transparent"
          />
          <CampaignMetricCard
            label="Committed spend"
            value={formatCurrency(metrics.totalSpend)}
            helper="Booked value across all campaigns"
            accent="from-amber-300/25 via-orange-300/10 to-transparent"
          />
        </div>

        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] backdrop-blur-2xl">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-xl flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-white/36" />
                <Input
                  placeholder="Search campaigns, influencer names, or handles"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-12 rounded-full border-white/10 bg-black/20 pl-11 text-white placeholder:text-white/35"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSortMode(option.value)}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      sortMode === option.value
                        ? "bg-white text-black"
                        : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    statusFilter === status
                      ? "border-white/30 bg-white text-black"
                      : "border-white/10 bg-white/[0.03] text-white/58 hover:border-white/16 hover:text-white"
                  }`}
                >
                  <span className="capitalize">
                    {status === "All" ? "All campaigns" : status}
                  </span>
                  <span className="ml-2 text-xs opacity-70">
                    {statusCounts[status]}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredCampaigns.length === 0 ? (
          <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] backdrop-blur-xl">
            <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.05]">
                <Megaphone className="h-7 w-7 text-white/55" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-semibold text-white">
                  {campaigns.length === 0
                    ? "No campaigns yet"
                    : "No campaigns match this view"}
                </p>
                <p className="max-w-md text-sm text-white/55">
                  {campaigns.length === 0
                    ? "Start by booking an influencer and your campaign dashboard will come alive here."
                    : "Try a different status filter, search term, or sort mode."}
                </p>
              </div>
              {campaigns.length === 0 ? (
                <Button asChild size="lg" className="h-12 rounded-full">
                  <Link href="/dashboard/business/discover">
                    Browse Influencers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("All");
                    setSearch("");
                    setSortMode("newest");
                  }}
                  className="rounded-full"
                >
                  Reset view
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-5">
            <AnimatePresence initial={false}>
              {lanes.map((lane, index) => {
                const Icon = lane.icon;

                return (
                  <m.section
                    key={lane.key}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: index * 0.05 }}
                    className={`overflow-hidden rounded-[28px] border ${lane.ring} backdrop-blur-xl`}
                  >
                    <div
                      className={`pointer-events-none h-24 bg-gradient-to-r ${lane.glow}`}
                    />
                    <div className="-mt-16 space-y-5 px-5 pb-5 sm:px-6 sm:pb-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/30">
                            <Icon className="h-5 w-5 text-white/75" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl font-semibold text-white">
                                {lane.title}
                              </h2>
                              <Badge
                                variant="outline"
                                className="rounded-full border-white/10 bg-white/[0.04] text-white/65"
                              >
                                {lane.items.length}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm text-white/50">
                              {lane.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {lane.items.length === 0 ? (
                        <EmptyLane
                          title={`Nothing in ${lane.title.toLowerCase()} right now`}
                          description="This lane will populate automatically as your campaign lifecycle changes."
                        />
                      ) : (
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {lane.items.map((item) => (
                            <CampaignCommandCard
                              key={item.campaign.id}
                              item={item}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </m.section>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
