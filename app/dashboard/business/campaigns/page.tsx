"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { m } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { supabase } from "@/lib/supabase/client";
import { trpcClient } from "@/lib/trpc/client";
import type { Database } from "@/lib/supabase/types";
import {
  fadeUp,
  stagger,
} from "@/lib/animations";
import {
  STATUS_FILTER_GROUPS,
  type EnrichedCampaign,
  type SortMode,
  type StatusFilter,
} from "./_components/campaign-constants";
import { CampaignSortPanel } from "./_components/campaign-sort-panel";
import { CampaignFilters } from "./_components/campaign-filters";
import { CampaignsList } from "./_components/campaigns-list";
import CampaignsLoading from "./loading";

type InfluencerProfile =
  Database["public"]["Tables"]["influencer_profiles"]["Row"];
type InfluencerPick = Pick<
  InfluencerProfile,
  "id" | "display_name" | "ig_profile_picture_url" | "ig_username" | "category"
>;

export default function CampaignsPage() {
  const { user } = useAuth();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "business",
  );

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [sortPanelOpen, setSortPanelOpen] = useState(false);
  const [sortPanelTab, setSortPanelTab] = useState<"status" | "sort">("status");

  const markedReadRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!campaigns.length) return;
    for (const c of campaigns) {
      if (markedReadRef.current.has(c.id)) continue;
      markedReadRef.current.add(c.id);
      trpcClient.campaign.markNotificationsRead.mutate({
        campaignId: c.id,
        notificationType: "new_booking",
      });
    }
  }, [campaigns]);

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
      return data as InfluencerPick[];
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
      in_escrow: 0,
      completed: 0,
      closed: 0,
    };
    for (const c of campaigns) {
      for (const key of Object.keys(STATUS_FILTER_GROUPS) as StatusFilter[]) {
        if (key !== "All" && STATUS_FILTER_GROUPS[key].includes(c.status))
          counts[key]++;
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
    if (statusFilter !== "All") return sorted;
    const payNow: EnrichedCampaign[] = [];
    const rest: EnrichedCampaign[] = [];
    for (const item of sorted) {
      (item.campaign.status === "payment_pending" ? payNow : rest).push(item);
    }
    return [...payNow, ...rest];
  }, [enriched, search, sortMode, statusFilter]);

  if (campaignsLoading) return <CampaignsLoading />;

  const activeSelectionCount =
    Number(statusFilter !== "All") + Number(sortMode !== "newest");

  return (
    <>
      <div className="relative h-dvh overflow-hidden">
        <div className="relative z-10 container h-full py-4 pb-[calc(96px+env(safe-area-inset-bottom,0px))] md:flex md:h-full md:flex-col md:py-6 md:pb-6">
          <m.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex h-full flex-col gap-4 md:h-auto md:gap-5"
          >
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
            <CampaignFilters
              search={search}
              onSearchChange={setSearch}
              hasActiveFilters={sortMode !== "newest" || statusFilter !== "All"}
              activeSelectionCount={activeSelectionCount}
              onOpenSort={() => {
                setSortPanelTab("status");
                setSortPanelOpen(true);
              }}
            />
            <CampaignsList
              isEmpty={campaigns.length === 0}
              displayItems={displayItems}
              onClearFilters={() => {
                setStatusFilter("All");
                setSearch("");
              }}
            />
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
