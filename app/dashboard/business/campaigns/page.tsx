"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { m, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Megaphone,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { timeAgo } from "@/lib/format";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import AnimatedGradientBackground from "@/components/ui/animated-gradient-background";
import {
  GRADIENT_COLORS,
  GRADIENT_STOPS,
  GRADIENT_STYLE,
  fadeUp,
  stagger,
} from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { CAMPAIGN_STATUS_CONFIG } from "@/lib/constants";
import type { CampaignStatus } from "@/lib/constants";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type SortMode = "newest" | "highest_spend" | "recently_updated";
type StatusFilter =
  | "All"
  | "requested"
  | "payment_pending"
  | "in_escrow"
  | "completed"
  | "closed";

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

const STATUS_FILTER_GROUPS: Record<StatusFilter, string[]> = {
  All: [],
  requested: ["requested", "pending", "pre_authorized"],
  payment_pending: ["payment_pending"],
  in_escrow: ["in_escrow", "accepted", "delivery_submitted"],
  completed: ["completed"],
  closed: ["declined", "rejected", "expired", "cancelled", "refunded"],
};

const STATUS_PILL_LABELS: Record<StatusFilter, string> = {
  All: "All",
  requested: "Pending",
  payment_pending: "Pay now",
  in_escrow: "Active",
  completed: "Done",
  closed: "Closed",
};

const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "requested",
  "payment_pending",
  "in_escrow",
  "completed",
  "closed",
];

const SORT_OPTIONS: Array<{
  value: SortMode;
  label: string;
  description: string;
}> = [
  {
    value: "newest",
    label: "Newest first",
    description: "Most recently booked campaigns",
  },
  {
    value: "recently_updated",
    label: "Recently updated",
    description: "Last activity or status change",
  },
  {
    value: "highest_spend",
    label: "Highest spend",
    description: "Highest creator fee at the top",
  },
];

function getInitials(name: string | null): string {
  return (name?.trim() || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatPackage(pkg: string | null): string {
  if (!pkg) return "Campaign";
  return pkg.charAt(0).toUpperCase() + pkg.slice(1);
}

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg =
    CAMPAIGN_STATUS_CONFIG[status as CampaignStatus] ??
    CAMPAIGN_STATUS_CONFIG.requested;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium leading-none",
        cfg.badge,
      )}
    >
      {cfg.label}
    </span>
  );
}

// ── Campaign ledger row ───────────────────────────────────────────────────
function CampaignRow({ item }: { item: EnrichedCampaign }) {
  const { campaign, influencer } = item;
  const isActionable =
    campaign.status === "payment_pending" ||
    campaign.status === "delivery_submitted";

  return (
    <Link
      href={`/dashboard/business/campaigns/${campaign.id}`}
      className="group block"
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200",
          "hover:bg-white/[0.045] hover:border-white/[0.12] hover:shadow-[0_4px_24px_rgba(0,0,0,0.25)]",
          isActionable
            ? "border-white/[0.10] bg-white/[0.035]"
            : "border-white/[0.065] bg-white/[0.02]",
        )}
      >
        {/* Status accent dot */}
        <div
          className={cn(
            "h-2 w-2 shrink-0 rounded-full",
            campaign.status === "payment_pending"
              ? "bg-yellow-400"
              : campaign.status === "delivery_submitted"
                ? "bg-blue-400"
                : campaign.status === "in_escrow" ||
                    campaign.status === "accepted"
                  ? "bg-emerald-400"
                  : campaign.status === "completed"
                    ? "bg-violet-400"
                    : [
                          "declined",
                          "rejected",
                          "expired",
                          "cancelled",
                          "refunded",
                        ].includes(campaign.status)
                      ? "bg-white/20"
                      : "bg-amber-400",
          )}
        />

        {/* Creator info */}
        <div className="flex min-w-0 shrink-0 items-center gap-2.5 sm:w-44 md:w-52">
          {influencer?.ig_profile_picture_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={influencer.ig_profile_picture_url}
              alt={influencer.display_name || "Creator"}
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/10"
            />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-semibold text-white/70 ring-1 ring-white/8">
              {getInitials(influencer?.display_name ?? null)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {influencer?.display_name || "Creator"}
            </p>
            <p className="truncate text-[11px] text-white/38">
              {influencer?.ig_username
                ? `@${influencer.ig_username}`
                : influencer?.category || "—"}
            </p>
          </div>
        </div>

        {/* Campaign title + package — hidden on small screens */}
        <div className="hidden min-w-0 flex-1 sm:block">
          <p className="truncate text-[13px] text-white/82">
            {campaign.title || "Untitled campaign"}
          </p>
          <p className="text-[11px] text-white/38">
            {formatPackage(campaign.package_type)}
          </p>
        </div>

        {/* Status badge */}
        <div className="shrink-0">
          <StatusBadge status={campaign.status} />
        </div>

        {/* Amount + date */}
        <div className="shrink-0 text-right">
          <p className="text-[13px] font-semibold text-white">
            {formatCurrency(campaign.price_offered)}
          </p>
          <p className="text-[11px] text-white/38">
            {timeAgo(campaign.created_at)}
          </p>
        </div>

        <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/18 transition-colors group-hover:text-white/45" />
      </div>
    </Link>
  );
}

// ── Campaign sort panel (discover-style) ──────────────────────────────────
function CampaignSortPanel({
  open,
  onClose,
  sortMode,
  setSortMode,
}: {
  open: boolean;
  onClose: () => void;
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
}) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const content = (
    <div className="flex h-full flex-col">
      {isMobile && (
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1 w-9 rounded-full bg-white/20" />
        </div>
      )}
      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-white/50" />
          <span className="text-[15px] font-semibold text-white">
            Sort campaigns
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-all hover:bg-white/10 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="space-y-5">
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/30">
              Sort by
            </p>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSortMode(opt.value);
                    onClose();
                  }}
                  className={cn(
                    "w-full rounded-xl border p-3.5 text-left transition-all duration-200",
                    sortMode === opt.value
                      ? "border-white/20 bg-white/10"
                      : "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]",
                  )}
                >
                  <p
                    className={cn(
                      "text-[13px] font-medium",
                      sortMode === opt.value ? "text-white" : "text-white/70",
                    )}
                  >
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/38">
                    {opt.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <Separator className="bg-white/[0.07]" />

          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.26em] text-white/30">
              Currently sorting by
            </p>
            <p className="text-[13px] text-white/60">
              {SORT_OPTIONS.find((o) => o.value === sortMode)?.label}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <m.div
            key="sort-backdrop"
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          {isMobile ? (
            <m.div
              key="sort-sheet-mobile"
              ref={panelRef}
              className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[85dvh] flex-col rounded-t-[28px] border-t border-white/10 bg-[#0b0d12] text-white"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.y > 80) onClose();
              }}
            >
              {content}
            </m.div>
          ) : (
            <m.div
              key="sort-panel-desktop"
              ref={panelRef}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[360px] flex-col border-l border-white/10 bg-[#0b0d12] text-white shadow-[-24px_0_80px_rgba(0,0,0,0.45)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x > 80) onClose();
              }}
            >
              {content}
            </m.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function CampaignsList() {
  const { user } = useAuth();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "business",
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [sortPanelOpen, setSortPanelOpen] = useState(false);

  // Mark campaign notifications as read
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

  // Batch-fetch influencer profiles for all campaigns
  const influencerProfileIds = useMemo(
    () =>
      [
        ...new Set(
          campaigns.map((c) => c.influencer_profile_id).filter(Boolean),
        ),
      ] as string[],
    [campaigns],
  );

  const { data: influencerProfiles = [] } = useQuery({
    queryKey: ["campaign-profiles", influencerProfileIds],
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
    () => new Map(influencerProfiles.map((p) => [p.id, p])),
    [influencerProfiles],
  );

  const enriched = useMemo<EnrichedCampaign[]>(
    () =>
      campaigns.map((campaign) => ({
        campaign,
        influencer: campaign.influencer_profile_id
          ? (profileMap.get(campaign.influencer_profile_id) ?? null)
          : null,
      })),
    [campaigns, profileMap],
  );

  const statusCounts = useMemo(
    () => ({
      All: campaigns.length,
      requested: campaigns.filter((c) =>
        STATUS_FILTER_GROUPS.requested.includes(c.status),
      ).length,
      payment_pending: campaigns.filter((c) =>
        STATUS_FILTER_GROUPS.payment_pending.includes(c.status),
      ).length,
      in_escrow: campaigns.filter((c) =>
        STATUS_FILTER_GROUPS.in_escrow.includes(c.status),
      ).length,
      completed: campaigns.filter((c) =>
        STATUS_FILTER_GROUPS.completed.includes(c.status),
      ).length,
      closed: campaigns.filter((c) =>
        STATUS_FILTER_GROUPS.closed.includes(c.status),
      ).length,
    }),
    [campaigns],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = [...enriched];

    if (statusFilter !== "All") {
      items = items.filter((item) =>
        STATUS_FILTER_GROUPS[statusFilter].includes(item.campaign.status),
      );
    }

    if (q) {
      items = items.filter((item) => {
        const blob = [
          item.campaign.title,
          item.influencer?.display_name,
          item.influencer?.ig_username,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(q);
      });
    }

    items.sort((a, b) => {
      if (sortMode === "highest_spend")
        return (
          (b.campaign.price_offered ?? 0) - (a.campaign.price_offered ?? 0)
        );
      if (sortMode === "recently_updated") {
        return (
          new Date(b.campaign.updated_at || b.campaign.created_at).getTime() -
          new Date(a.campaign.updated_at || a.campaign.created_at).getTime()
        );
      }
      return (
        new Date(b.campaign.created_at).getTime() -
        new Date(a.campaign.created_at).getTime()
      );
    });

    return items;
  }, [enriched, search, sortMode, statusFilter]);

  // Highlight "pay now" campaigns at top when on "All" filter
  const displayItems = useMemo(() => {
    if (statusFilter !== "All") return filtered;
    const payNow = filtered.filter(
      (i) => i.campaign.status === "payment_pending",
    );
    const rest = filtered.filter(
      (i) => i.campaign.status !== "payment_pending",
    );
    return [...payNow, ...rest];
  }, [filtered, statusFilter]);

  if (campaignsLoading) {
    return (
      <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <AnimatedGradientBackground
            Breathing
            gradientColors={GRADIENT_COLORS}
            gradientStops={GRADIENT_STOPS}
            startingGap={220}
            breathingRange={10}
            animationSpeed={0.014}
            containerStyle={GRADIENT_STYLE}
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,16,0.12),rgba(5,8,16,0.62))]" />
        </div>
        <div className="relative z-10 container py-6 space-y-4">
          <div className="h-12 w-48 animate-pulse rounded-2xl bg-white/[0.06]" />
          <div className="h-14 w-full animate-pulse rounded-full bg-white/[0.04]" />
          <div className="space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[60px] w-full animate-pulse rounded-2xl bg-white/[0.03]"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative min-h-[calc(100dvh-4rem)] overflow-hidden">
        {/* Background */}
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_34%),linear-gradient(180deg,rgba(5,8,16,0.10),rgba(5,8,16,0.55))]" />
        </div>

        <div className="relative z-10 container space-y-5 py-6">
          <m.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-5"
          >
            {/* ── Header ───────────────────────────────────────────────── */}
            <m.div variants={fadeUp} className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="h-11 w-11 shrink-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10"
              >
                <Link href="/dashboard/business">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div>
                <p className="eyebrow-label text-[11px] text-white/45">
                  Brand activity
                </p>
                <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  Campaign{" "}
                  <span className="heading-mix-accent text-white/90">
                    Ledger
                  </span>
                </h1>
              </div>
            </m.div>

            {/* ── Search + Sort bar ────────────────────────────────────── */}
            <m.div variants={fadeUp} className="space-y-3">
              <div className="flex items-center gap-3 rounded-[28px] border border-white/10 bg-black/20 p-3 backdrop-blur-xl sm:p-4">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search campaigns or creator names"
                    className="h-12 rounded-full border-white/10 bg-white/[0.05] pl-11 text-white placeholder:text-white/35"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setSortPanelOpen(true)}
                  className={cn(
                    "relative flex h-12 shrink-0 items-center gap-2 rounded-full border px-5 text-sm font-medium text-white backdrop-blur-md transition-all duration-200",
                    sortMode !== "newest"
                      ? "border-white/25 bg-white/12"
                      : "border-cyan-300/20 bg-[linear-gradient(135deg,#dfe7ff18,#8be9ff14)] hover:bg-white/10",
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                </button>
              </div>

              {/* Status pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {STATUS_FILTERS.map((sf) => {
                  const count = statusCounts[sf];
                  const isActive = statusFilter === sf;
                  const isUrgent =
                    sf === "payment_pending" && count > 0 && !isActive;
                  return (
                    <button
                      key={sf}
                      type="button"
                      onClick={() => setStatusFilter(sf)}
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12px] font-medium transition-all duration-200",
                        isActive
                          ? "border-white/25 bg-white text-black"
                          : isUrgent
                            ? "border-yellow-400/40 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/15"
                            : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/16 hover:text-white/80",
                      )}
                    >
                      <span>{STATUS_PILL_LABELS[sf]}</span>
                      <span
                        className={cn(
                          "text-[10px]",
                          isActive ? "text-black/50" : "text-white/35",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="pl-1 text-xs text-white/38">
                {displayItems.length} campaign
                {displayItems.length !== 1 ? "s" : ""}
                {sortMode !== "newest" && (
                  <span className="ml-2 text-white/25">
                    · sorted by{" "}
                    {SORT_OPTIONS.find(
                      (o) => o.value === sortMode,
                    )?.label.toLowerCase()}
                  </span>
                )}
              </p>
            </m.div>

            {/* ── Campaign list ──────────────────────────────────────────── */}
            {campaigns.length === 0 ? (
              <m.div
                variants={fadeUp}
                className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.025] py-20 text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/[0.05]">
                  <Megaphone className="h-6 w-6 text-white/40" />
                </div>
                <p className="text-lg font-semibold text-white">
                  No campaigns yet
                </p>
                <p className="mt-1.5 text-sm text-white/50">
                  Book a creator and your campaign activity will appear here.
                </p>
                <Button
                  asChild
                  className="mt-6 h-11 rounded-full bg-white text-black hover:bg-white/90"
                >
                  <Link href="/dashboard/business/discover">
                    Browse creators
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </m.div>
            ) : displayItems.length === 0 ? (
              <m.div
                variants={fadeUp}
                className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.025] py-16 text-center"
              >
                <p className="text-base font-medium text-white">
                  No campaigns match this filter
                </p>
                <p className="mt-1 text-sm text-white/45">
                  Try a different status or clear the search.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter("All");
                    setSearch("");
                  }}
                  className="mt-4 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-white/70 hover:text-white transition-colors"
                >
                  Clear filters
                </button>
              </m.div>
            ) : (
              <m.div
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="space-y-1.5"
              >
                {displayItems.map((item) => (
                  <m.div key={item.campaign.id} variants={fadeUp}>
                    <CampaignRow item={item} />
                  </m.div>
                ))}
              </m.div>
            )}
          </m.div>
        </div>
      </div>

      <CampaignSortPanel
        open={sortPanelOpen}
        onClose={() => setSortPanelOpen(false)}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />
    </>
  );
}
