"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { m } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import CampaignDetailLoading from "./loading";
import { fadeUp, stagger } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import type { Campaign } from "./_components/campaign-types";
import { CampaignHeader } from "./_components/campaign-header";
import { CampaignProgressSection } from "./_components/campaign-progress-section";
import { CampaignBriefSection } from "./_components/campaign-brief-section";
import { CampaignDeliverySection } from "./_components/campaign-delivery-section";
import { CampaignPaymentSection } from "./_components/campaign-payment-section";
import { CampaignChatSection } from "./_components/campaign-chat-section";

export default function BusinessCampaignDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user, authReady } = useAuth();

  const { data: rawCampaign, isLoading } = useCampaign(id, { userId: user?.id });
  const campaign = rawCampaign as Campaign | undefined;
  const { data: influencerProfile } = useInfluencerProfile(
    campaign?.influencer_profile_id ?? undefined,
  );

  if (!authReady || isLoading) {
    return <CampaignDetailLoading />;
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
        <CampaignPaymentSection
          campaign={campaign}
          platformFee={platformFee}
          totalCharged={totalCharged}
        />
      </m.div>

      <m.div variants={fadeUp}>
        <CampaignDeliverySection campaign={campaign} />
      </m.div>

      <m.div variants={fadeUp}>
        <CampaignProgressSection status={campaign.status} />
      </m.div>

      <m.div variants={fadeUp} className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <CampaignBriefSection campaign={campaign} />
        <CampaignChatSection
          campaign={campaign}
          influencerProfile={influencerProfile}
          totalCharged={totalCharged}
        />
      </m.div>
    </m.div>
  );
}
