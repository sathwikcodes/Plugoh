"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { m } from "framer-motion";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useBusinessProfiles } from "@/hooks/queries/use-business-profiles";
import {
  getBusinessDisplayName,
  getBusinessLocation,
} from "@/lib/business-profile";
import { fadeUp, stagger } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { CampaignHeader } from "./_components/campaign-header";
import { CampaignOfferActions } from "./_components/campaign-offer-actions";
import { CampaignStatusSection } from "./_components/campaign-status-section";
import { CampaignProgressSection } from "./_components/campaign-progress-section";
import { CampaignBrandSection } from "./_components/campaign-brand-section";
import { CampaignBriefSection } from "./_components/campaign-brief-section";
import { CampaignSidebar } from "./_components/campaign-sidebar";
import type { Campaign } from "./_components/campaign-types";
import { useInfluencerCampaignActions } from "../_hooks/use-influencer-campaign-actions";

function daysRemaining(from: string, totalDays: number): number {
  const deadline = new Date(from).getTime() + totalDays * 86_400_000;
  return Math.max(0, Math.ceil((deadline - Date.now()) / 86_400_000));
}

export default function InfluencerCampaignDetail() {
  const params = useParams();
  const id = params?.id as string;

  const { data: rawCampaign, isLoading } = useCampaign(id, {
    role: "influencer",
  });
  const campaign = rawCampaign as Campaign | undefined;
  const {
    acceptCampaign,
    declineCampaign,
    submitDelivery,
    acceptingId,
    decliningId,
    isSubmittingDelivery,
    invalidateCampaignQueries,
  } = useInfluencerCampaignActions({
    acceptRedirectTo: (campaignId) =>
      `/dashboard/influencer/inbox?chat=${campaignId}`,
    acceptSuccessDescription: "Taking you to the conversation with the brand.",
  });

  const businessIds = campaign?.business_id ? [campaign.business_id] : [];
  const { data: businessMap, isLoading: profilesLoading } =
    useBusinessProfiles(businessIds);
  const businessIdentity =
    campaign?.business_id && businessMap
      ? (businessMap.get(campaign.business_id) ?? null)
      : null;

  if (isLoading) {
    return (
      <div className="container max-w-5xl space-y-5 py-6">
        <div className="h-9 w-36 animate-pulse rounded-full bg-[#211b2c]" />
        <div className="h-28 w-full animate-pulse rounded-2xl bg-[#211b2c]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-2xl bg-[#211b2c]" />
            <div className="h-40 animate-pulse rounded-2xl bg-[#211b2c]" />
          </div>
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-2xl bg-[#211b2c]" />
            <div className="h-24 animate-pulse rounded-2xl bg-[#211b2c]" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container py-12 text-center">
        <p className="text-white/50">Campaign not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/influencer/campaigns">Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  const autoReleaseDays = campaign.delivery_submitted_at
    ? daysRemaining(campaign.delivery_submitted_at, 7)
    : 7;
  const businessName = getBusinessDisplayName(businessIdentity);
  const businessLocation = getBusinessLocation(businessIdentity);
  const businessSummary =
    businessIdentity?.businessProfile?.brand_summary?.trim() ||
    businessIdentity?.businessProfile?.tagline?.trim() ||
    null;
  const showContactInfo = [
    "in_escrow",
    "accepted",
    "delivery_submitted",
    "completed",
  ].includes(campaign.status);
  const igUsername =
    businessIdentity?.businessProfile?.ig_username?.trim() || null;

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="container max-w-5xl space-y-5 py-6"
    >
      <m.div variants={fadeUp}>
        <CampaignHeader campaign={campaign} />
      </m.div>

      <m.div variants={fadeUp}>
        <CampaignOfferActions
          campaign={campaign}
          onAccept={() => acceptCampaign(campaign.id)}
          onDecline={() => declineCampaign(campaign.id)}
          isAccepting={acceptingId === campaign.id}
          isDeclining={decliningId === campaign.id}
          onExpire={invalidateCampaignQueries}
        />
      </m.div>

      <m.div variants={fadeUp}>
        <CampaignStatusSection
          campaign={campaign}
          autoReleaseDays={autoReleaseDays}
        />
      </m.div>

      <m.div variants={fadeUp} className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <CampaignProgressSection status={campaign.status} />
          <CampaignBrandSection
            businessIdentity={businessIdentity}
            businessName={businessName}
            businessLocation={businessLocation}
            businessSummary={businessSummary}
            igUsername={igUsername}
            profilesLoading={profilesLoading}
          />
          <CampaignBriefSection campaign={campaign} />
        </div>

        <CampaignSidebar
          campaign={campaign}
          showContactInfo={showContactInfo}
          onSubmitDelivery={submitDelivery}
          isSubmittingDelivery={isSubmittingDelivery}
        />
      </m.div>
    </m.div>
  );
}
