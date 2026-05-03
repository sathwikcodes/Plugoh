"use client";

import { useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useBusinessProfiles } from "@/hooks/queries/use-business-profiles";
import { trpcClient } from "@/lib/trpc/client";
import { getBusinessDisplayName } from "@/lib/business-profile";
import { fadeUp, stagger } from "@/lib/animations";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  STATUS_FILTER_GROUPS,
  type EnrichedCampaign,
  type SortMode,
  type StatusFilter,
} from "./_components/campaign-constants";
import { CampaignFilters } from "./_components/campaign-filters";
import { CampaignSortPanel } from "./_components/campaign-sort-panel";
import { CampaignsList } from "./_components/campaigns-list";
import { useInfluencerCampaignActions } from "./_hooks/use-influencer-campaign-actions";
import CampaignsLoading from "./loading";

export default function CampaignsPage() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns(
    user?.id,
    "influencer",
  );
  const { acceptCampaign, declineCampaign, acceptingId, decliningId } =
    useInfluencerCampaignActions({
      acceptRedirectTo: (campaignId) =>
        `/dashboard/influencer/campaigns/${campaignId}`,
      acceptSuccessDescription: "Opening the campaign details.",
    });

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [search, setSearch] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [sortPanelOpen, setSortPanelOpen] = useState(false);
  const [sortPanelTab, setSortPanelTab] = useState<"status" | "sort">("status");

  useEffect(() => {
    if (!user?.id) return;
    // Bulk-mark every unread booking notification for this user in one call,
    // replacing the previous per-campaign loop.
    trpcClient.campaign.markAllNotificationsRead.mutate({
      notificationType: "new_booking",
    });
  }, [user?.id]);

  const businessIds = useMemo(
    () => [...new Set(campaigns.map((campaign) => campaign.business_id))],
    [campaigns],
  );

  const { data: businessMap } = useBusinessProfiles(businessIds);

  const enriched = useMemo<EnrichedCampaign[]>(
    () =>
      campaigns.map((campaign) => ({
        campaign,
        business: businessMap?.get(campaign.business_id) ?? null,
      })),
    [businessMap, campaigns],
  );

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      All: campaigns.length,
      requested: 0,
      in_escrow: 0,
      completed: 0,
      closed: 0,
    };
    for (const campaign of campaigns) {
      for (const key of Object.keys(STATUS_FILTER_GROUPS) as StatusFilter[]) {
        if (
          key !== "All" &&
          STATUS_FILTER_GROUPS[key].includes(campaign.status)
        )
          counts[key]++;
      }
    }
    return counts;
  }, [campaigns]);

  const displayItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    let items = enriched;

    if (statusFilter !== "All") {
      items = items.filter((item) =>
        STATUS_FILTER_GROUPS[statusFilter].includes(item.campaign.status),
      );
    }

    if (query) {
      items = items.filter((item) => {
        const businessName = getBusinessDisplayName(item.business);
        const blob = [item.campaign.title, businessName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(query);
      });
    }

    const sorted = items.toSorted((a, b) => {
      if (sortMode === "highest_offer") {
        return (
          (b.campaign.price_offered ?? 0) - (a.campaign.price_offered ?? 0)
        );
      }
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

    const offers: EnrichedCampaign[] = [];
    const rest: EnrichedCampaign[] = [];
    for (const item of sorted) {
      (STATUS_FILTER_GROUPS.requested.includes(item.campaign.status)
        ? offers
        : rest
      ).push(item);
    }
    return [...offers, ...rest];
  }, [enriched, search, sortMode, statusFilter]);

  if (campaignsLoading) return <CampaignsLoading />;

  const mobileStyle = isMobile
    ? { height: "100dvh" as const, minHeight: "100dvh" as const }
    : undefined;
  const mobileInset = isMobile
    ? { paddingBottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }
    : undefined;
  const activeSelectionCount =
    Number(statusFilter !== "All") + Number(sortMode !== "newest");

  return (
    <>
      <div className="relative h-dvh overflow-hidden" style={mobileStyle}>
        <div
          className="relative z-10 container h-full min-h-0 py-4 md:flex md:h-full md:min-h-0 md:flex-col md:py-6"
          style={mobileInset}
        >
          <m.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="flex h-full min-h-0 flex-col gap-4 md:gap-5"
          >
            <m.div
              variants={fadeUp}
              className="shrink-0 flex items-center justify-center gap-3 md:justify-start"
            >
              <div className="min-w-0 flex flex-col justify-center text-center md:text-left">
                <h1 className="heading-mix text-3xl font-semibold tracking-tight text-white sm:text-3xl">
                  My{" "}
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
              acceptCampaign={acceptCampaign}
              declineCampaign={declineCampaign}
              acceptingId={acceptingId}
              decliningId={decliningId}
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
