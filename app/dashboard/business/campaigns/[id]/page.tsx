"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { Button } from "@/components/ui/button";
import type { Campaign } from "./_components/campaign-types";
import { CampaignHeader } from "./_components/campaign-header";
import { CampaignBriefSection } from "./_components/campaign-brief-section";
import { CampaignDeliverySection } from "./_components/campaign-delivery-section";
import { CampaignPaymentSection } from "./_components/campaign-payment-section";
import { CampaignChatSection } from "./_components/campaign-chat-section";

export default function BusinessCampaignDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();

  const { data: rawCampaign, isLoading } = useCampaign(id, user?.id);
  const campaign = rawCampaign as Campaign | undefined;
  const { data: influencerProfile } = useInfluencerProfile(
    campaign?.influencer_profile_id ?? undefined,
  );

  if (isLoading) {
    return (
      <div className="container max-w-5xl space-y-5 py-6">
        <div className="h-9 w-36 animate-pulse rounded-full bg-[#211b2c]" />
        <div className="h-28 w-full animate-pulse rounded-2xl bg-[#211b2c]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
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
          <Link href="/dashboard/business/campaigns">Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  const platformFee =
    campaign.platform_fee_amount ?? (campaign.price_offered ?? 0) * 0.12;
  const totalCharged =
    campaign.total_charged_amount ?? (campaign.price_offered ?? 0) * 1.12;

  return (
    <div className="container max-w-5xl space-y-5 py-6">
      <CampaignHeader campaign={campaign} platformFee={platformFee} />
      <CampaignPaymentSection
        campaign={campaign}
        platformFee={platformFee}
        totalCharged={totalCharged}
      />
      <CampaignDeliverySection campaign={campaign} />
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <CampaignBriefSection campaign={campaign} />
        <CampaignChatSection
          campaign={campaign}
          influencerProfile={influencerProfile}
          platformFee={platformFee}
          totalCharged={totalCharged}
        />
      </div>
    </div>
  );
}
