"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { m, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Megaphone,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  CampaignCardStack,
  CampaignCardTile,
} from "@/components/campaign/campaign-card-stack";

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

// ── Campaign sort panel (discover-style) ──────────────────────────────────
function CampaignSortPanel({
  open,
  onClose,
  activeTab,
  setActiveTab,
  statusFilter,
  setStatusFilter,
  statusCounts,
  sortMode,
  setSortMode,
}: {
  open: boolean;
  onClose: () => void;
  activeTab: "status" | "sort";
  setActiveTab: (v: "status" | "sort") => void;
  statusFilter: StatusFilter;
  setStatusFilter: (v: StatusFilter) => void;
  statusCounts: Record<StatusFilter, number>;
  sortMode: SortMode;
  setSortMode: (v: SortMode) => void;
}) {
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [handleDismiss, open]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (open && isMobile) {
      document.body.dataset.mobileDockHidden = "true";
    } else {
      delete document.body.dataset.mobileDockHidden;
    }

    return () => {
      delete document.body.dataset.mobileDockHidden;
    };
  }, [isMobile, open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) handleDismiss();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleDismiss, open]);

  const content = (
    <div className="flex h-full min-h-0 flex-col">
      {isMobile && (
        <div className="flex shrink-0 justify-center pb-1 pt-3">
          <div className="h-1.5 w-22 rounded-full bg-white/14" />
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between border-b border-white/8 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-white/45" />
          <span className="text-[15px] font-semibold text-white">
            Sort campaigns
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        <div className="space-y-5 pb-6">
          <div className="grid grid-cols-2 gap-2 rounded-[22px] border border-white/10 bg-white/[0.035] p-1">
            {[
              { value: "status" as const, label: "Status" },
              { value: "sort" as const, label: "Sort" },
            ].map((tab) => {
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    "rounded-[18px] px-4 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-white text-black shadow-[0_10px_20px_rgba(0,0,0,0.18)]"
                      : "text-white/58 hover:text-white",
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === "status" ? (
            <div className="space-y-3">
              <p className="eyebrow-label text-[10px] text-white/35">
                Filter by status
              </p>
              <div className="space-y-3">
                {STATUS_FILTERS.map((sf) => {
                  const active = statusFilter === sf;
                  const count = statusCounts[sf];
                  const isUrgent =
                    sf === "payment_pending" && count > 0 && !active;
                  return (
                    <button
                      key={sf}
                      type="button"
                      onClick={() => {
                        setStatusFilter(sf);
                        handleDismiss();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition-colors",
                        active
                          ? "border-white/20 bg-white/[0.1]"
                          : isUrgent
                            ? "border-yellow-400/40 bg-yellow-400/10 hover:bg-yellow-400/15"
                            : "border-white/10 bg-white/[0.035] hover:bg-white/[0.065]",
                      )}
                    >
                      <div className="pr-4">
                        <p
                          className={cn(
                            "text-[15px]",
                            active
                              ? "text-white"
                              : isUrgent
                                ? "text-yellow-200"
                                : "text-white",
                          )}
                        >
                          {STATUS_PILL_LABELS[sf]}
                        </p>
                        <p className="mt-1 text-[12px] text-white/42">
                          {count} campaign{count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex min-w-[32px] items-center justify-center rounded-full border px-2 py-1 text-[11px]",
                          active
                            ? "border-white bg-white text-black"
                            : isUrgent
                              ? "border-yellow-300/30 bg-yellow-300/12 text-yellow-200"
                              : "border-white/12 text-white/45",
                        )}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="eyebrow-label text-[10px] text-white/35">Sort by</p>
              <div className="space-y-3">
                {SORT_OPTIONS.map((opt) => {
                  const active = sortMode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortMode(opt.value);
                        handleDismiss();
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition-colors",
                        active
                          ? "border-white/20 bg-white/[0.1]"
                          : "border-white/10 bg-white/[0.035] hover:bg-white/[0.065]",
                      )}
                    >
                      <div className="pr-4">
                        <p className="text-[15px] text-white">{opt.label}</p>
                        <p className="mt-1 text-[12px] text-white/42">
                          {opt.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          active
                            ? "border-white bg-white text-black"
                            : "border-white/12 text-transparent",
                        )}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-current" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
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
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleDismiss}
          />
          {isMobile ? (
            <m.div
              key="sort-sheet-mobile"
              ref={panelRef}
              className="fixed bottom-0 left-0 right-0 z-50 flex max-h-[88dvh] flex-col rounded-t-[32px] border-t border-white/10 bg-[#151922] text-white shadow-[0_-24px_60px_rgba(0,0,0,0.55)]"
              style={{ height: "min(88dvh, 760px)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 34 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.y > 90) handleDismiss();
              }}
            >
              {content}
            </m.div>
          ) : (
            <m.div
              key="sort-panel-desktop"
              ref={panelRef}
              className="fixed bottom-0 right-0 top-0 z-50 flex w-[420px] flex-col border-l border-white/10 bg-[#151922] text-white shadow-[-28px_0_90px_rgba(0,0,0,0.5)]"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
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
  const isMobile = useIsMobile();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "business",
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [sortPanelOpen, setSortPanelOpen] = useState(false);
  const [sortPanelTab, setSortPanelTab] = useState<"status" | "sort">("sort");

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

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      All: campaigns.length,
      requested: 0,
      payment_pending: 0,
      in_escrow: 0,
      completed: 0,
      closed: 0,
    };
    for (const c of campaigns) {
      for (const key of Object.keys(STATUS_FILTER_GROUPS) as StatusFilter[]) {
        if (key !== "All" && STATUS_FILTER_GROUPS[key].includes(c.status)) {
          counts[key]++;
        }
      }
    }
    return counts;
  }, [campaigns]);

  const displayItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = enriched;

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

    const sorted = items.toSorted((a, b) => {
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

    // Highlight "pay now" campaigns at top when on "All" filter
    if (statusFilter !== "All") return sorted;
    const payNow: EnrichedCampaign[] = [];
    const rest: EnrichedCampaign[] = [];
    for (const item of sorted) {
      (item.campaign.status === "payment_pending" ? payNow : rest).push(item);
    }
    return [...payNow, ...rest];
  }, [enriched, search, sortMode, statusFilter]);

  const mobileViewportHeight = "100dvh";
  const mobileBottomInset = "calc(96px + env(safe-area-inset-bottom, 0px))";

  if (campaignsLoading) {
    return (
      <div
        className="relative h-dvh overflow-hidden"
        style={
          isMobile
            ? {
                height: mobileViewportHeight,
                minHeight: mobileViewportHeight,
              }
            : undefined
        }
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden md:absolute">
          <AnimatedGradientBackground
            Breathing
            gradientColors={GRADIENT_COLORS}
            gradientStops={GRADIENT_STOPS}
            startingGap={180}
            breathingRange={8}
            animationSpeed={0.015}
            containerStyle={GRADIENT_STYLE}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff0a,transparent_38%),linear-gradient(180deg,#0F1115_0%,#0F1115_42%,#0F1115_100%)]" />
          <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#20B8A814_0%,transparent_100%)]" />
        </div>
        <div
          className="relative z-10 container h-full py-4 md:flex md:h-full md:flex-col md:py-6"
          style={isMobile ? { paddingBottom: mobileBottomInset } : undefined}
        >
          <div className="flex h-full flex-col gap-4">
            <div className="h-12 w-48 animate-pulse rounded-2xl bg-white/[0.06]" />
            <div className="h-14 w-full animate-pulse rounded-full bg-white/[0.04]" />
            <div className="flex-1 space-y-2 overflow-hidden">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[60px] w-full animate-pulse rounded-2xl bg-white/[0.03]"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="relative h-dvh overflow-hidden"
        style={
          isMobile
            ? {
                height: mobileViewportHeight,
                minHeight: mobileViewportHeight,
              }
            : undefined
        }
      >
        {/* Background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden md:absolute">
          <AnimatedGradientBackground
            Breathing
            gradientColors={GRADIENT_COLORS}
            gradientStops={GRADIENT_STOPS}
            startingGap={180}
            breathingRange={8}
            animationSpeed={0.015}
            containerStyle={GRADIENT_STYLE}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff0a,transparent_38%),linear-gradient(180deg,#0F1115_0%,#0F1115_42%,#0F1115_100%)]" />
          <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,#20B8A814_0%,transparent_100%)]" />
        </div>

        <div
          className="relative z-10 container h-full py-4 md:flex md:h-full md:flex-col md:py-6"
          style={isMobile ? { paddingBottom: mobileBottomInset } : undefined}
        >
          <m.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex h-full flex-col gap-4 md:h-auto md:gap-5"
          >
            {/* ── Header ───────────────────────────────────────────────── */}
            <m.div
              variants={fadeUp}
              className="shrink-0 flex items-center justify-center gap-3 md:justify-start"
            >
              <div className="min-w-0 flex flex-col justify-center text-center md:text-left">
                <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-3xl">
                  Manage{" "}
                  <span className="heading-mix-accent text-4xl text-white/90">
                    Campaigns
                  </span>
                </h1>
              </div>
            </m.div>

            {/* ── Search + Sort bar ────────────────────────────────────── */}
            <m.div variants={fadeUp} className="shrink-0 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search"
                    className="h-12 rounded-full border-white/10 bg-white/5 pl-11 text-white placeholder:text-white/35"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSortPanelTab(statusFilter !== "All" ? "status" : "sort");
                    setSortPanelOpen(true);
                  }}
                  className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-sm font-medium text-white backdrop-blur-md transition-all duration-200 sm:w-auto sm:gap-2 sm:px-5",
                    sortMode !== "newest" || statusFilter !== "All"
                      ? "border-white/25 bg-white/12 shadow-[0_0_20px_rgba(255,255,255,0.06)]"
                      : "border-primary/20 bg-primary/[0.07] shadow-[0_12px_32px_rgba(15,17,21,0.35)] hover:bg-primary/10",
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">Sort</span>
                </button>
              </div>
            </m.div>

            {/* ── Campaign list ──────────────────────────────────────────── */}
            {campaigns.length === 0 ? (
              <m.div
                variants={fadeUp}
                className="flex flex-1 items-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.025] py-20 text-center"
              >
                <div className="mx-auto">
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
                </div>
              </m.div>
            ) : displayItems.length === 0 ? (
              <m.div
                variants={fadeUp}
                className="flex flex-1 items-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.025] py-16 text-center"
              >
                <div className="mx-auto">
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
                    className="mt-4 rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
                  >
                    Clear filters
                  </button>
                </div>
              </m.div>
            ) : (
              <>
                {/* Mobile: swipeable card stack */}
                <m.div
                  variants={fadeUp}
                  className="flex flex-col min-h-0 flex-1 md:hidden"
                >
                  <CampaignCardStack
                    campaigns={displayItems.map(({ campaign, influencer }) => ({
                      id: campaign.id,
                      title: campaign.title,
                      status: campaign.status,
                      package_type: campaign.package_type,
                      price_offered: campaign.price_offered,
                      expires_at: campaign.expires_at,
                      created_at: campaign.created_at,
                      influencerName: influencer?.display_name || "Creator",
                      influencerHandle: influencer?.ig_username || null,
                      influencerAvatarUrl:
                        influencer?.ig_profile_picture_url || null,
                    }))}
                    className="w-full flex-1"
                  />
                </m.div>

                {/* Desktop: grid of campaign cards */}
                <m.div
                  variants={fadeUp}
                  className="hidden md:grid min-h-0 flex-1 grid-cols-2 gap-5 overflow-y-auto overscroll-contain pr-1 xl:grid-cols-3"
                >
                  {displayItems.map(({ campaign, influencer }) => (
                    <CampaignCardTile
                      key={campaign.id}
                      card={{
                        id: campaign.id,
                        title: campaign.title,
                        status: campaign.status,
                        package_type: campaign.package_type,
                        price_offered: campaign.price_offered,
                        expires_at: campaign.expires_at,
                        created_at: campaign.created_at,
                        influencerName: influencer?.display_name || "Creator",
                        influencerHandle: influencer?.ig_username || null,
                        influencerAvatarUrl:
                          influencer?.ig_profile_picture_url || null,
                      }}
                      className="aspect-[0.74]"
                    />
                  ))}
                </m.div>
              </>
            )}
          </m.div>
        </div>
      </div>

      <CampaignSortPanel
        open={sortPanelOpen}
        onClose={() => setSortPanelOpen(false)}
        activeTab={sortPanelTab}
        setActiveTab={setSortPanelTab}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        statusCounts={statusCounts}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />
    </>
  );
}
