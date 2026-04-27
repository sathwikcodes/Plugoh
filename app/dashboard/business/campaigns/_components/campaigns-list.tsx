"use client";

import Link from "next/link";
import { m } from "framer-motion";
import { ArrowRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeUp } from "@/lib/animations";
import {
  CampaignCardStack,
  CampaignCardTile,
} from "@/components/campaign/campaign-card-stack";
import { brandDisplayAmountFromCampaign } from "@/lib/brand-pricing";
import type { EnrichedCampaign } from "./campaign-constants";

interface CampaignsListProps {
  isEmpty: boolean;
  displayItems: EnrichedCampaign[];
  onClearFilters: () => void;
}

function mapCardProps(
  campaign: EnrichedCampaign["campaign"],
  influencer: EnrichedCampaign["influencer"],
) {
  return {
    id: campaign.id,
    title: campaign.title,
    brief: campaign.brief || null,
    status: campaign.status,
    package_type: campaign.package_type,
    price_offered: campaign.price_offered,
    brand_display_amount: brandDisplayAmountFromCampaign(campaign),
    expires_at: campaign.expires_at,
    created_at: campaign.created_at,
    influencerName: influencer?.display_name || "Influencer",
    influencerHandle: influencer?.ig_username || null,
    influencerAvatarUrl: influencer?.ig_profile_picture_url || null,
    influencerCategory: influencer?.category || null,
  };
}

export function CampaignsList({
  isEmpty,
  displayItems,
  onClearFilters,
}: CampaignsListProps) {
  if (isEmpty) {
    return (
      <m.div
        variants={fadeUp}
        className="flex flex-1 items-center rounded-[28px] border border-dashed border-white/10 bg-white/[0.025] py-20 text-center"
      >
        <div className="mx-auto">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-3xl bg-white/5">
            <Megaphone className="h-6 w-6 text-white/40" />
          </div>
          <p className="text-lg font-semibold text-white">No campaigns yet</p>
          <p className="mt-1.5 text-sm text-white/50">
            Book an influencer and your campaign activity will appear here.
          </p>
          <Button
            asChild
            className="mt-6 h-11 rounded-full bg-white text-black hover:bg-white/90"
          >
            <Link href="/dashboard/business/discover">
              Browse influencers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </m.div>
    );
  }

  if (displayItems.length === 0) {
    return (
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
            onClick={onClearFilters}
            className="mt-4 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:text-white"
          >
            Clear filters
          </button>
        </div>
      </m.div>
    );
  }

  return (
    <>
      <m.div variants={fadeUp} className="flex min-h-0 flex-1 md:hidden">
        <CampaignCardStack
          campaigns={displayItems.map(({ campaign, influencer }) =>
            mapCardProps(campaign, influencer),
          )}
          className="h-full w-full"
        />
      </m.div>
      <m.div
        variants={fadeUp}
        className="hidden md:grid min-h-0 flex-1 grid-cols-2 gap-5 overflow-y-auto overscroll-contain pr-1 xl:grid-cols-3"
      >
        {displayItems.map(({ campaign, influencer }) => (
          <CampaignCardTile
            key={campaign.id}
            card={mapCardProps(campaign, influencer)}
            className="aspect-[0.74]"
          />
        ))}
      </m.div>
    </>
  );
}
