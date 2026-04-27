import Link from "next/link";
import Image from "next/image";
import {
  getInitials,
  formatCurrency,
  formatPackage,
  timeAgo,
} from "@/lib/format";
import { INSTAGRAM_GRADIENT } from "@/lib/animations";
import { ThreeDButton } from "@/components/ui/3d-button";
import type { Campaign } from "./campaign-types";

interface InfluencerProfile {
  id: string;
  display_name: string | null;
  ig_profile_picture_url: string | null;
  instagram_handle?: string | null;
  ig_username?: string | null;
  category: string | null;
}

interface CampaignChatSectionProps {
  campaign: Campaign;
  influencerProfile?: InfluencerProfile | null;
  totalCharged: number;
}

export function CampaignChatSection({
  campaign,
  influencerProfile,
  totalCharged,
}: CampaignChatSectionProps) {
  const handle =
    influencerProfile?.instagram_handle || influencerProfile?.ig_username;

  return (
    <div className="space-y-3">
      {/* Influencer card */}
      <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {influencerProfile?.ig_profile_picture_url ? (
            <Image
              src={influencerProfile.ig_profile_picture_url}
              alt={influencerProfile.display_name || "Influencer"}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
              unoptimized
            />
          ) : (
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white/70 ring-1 ring-white/8"
              style={{ background: INSTAGRAM_GRADIENT }}
            >
              {getInitials(influencerProfile?.display_name ?? null)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {influencerProfile?.display_name || "Influencer"}
            </p>
            <p className="truncate text-xs text-white/45">
              {handle ? `@${handle}` : influencerProfile?.category || "—"}
            </p>
          </div>
        </div>
        {influencerProfile && (
          <div className="mt-3">
            <ThreeDButton
              asChild
              label="View influencer profile"
              hideIcon
              className="three-d-button--sm three-d-button--no-glow three-d-button--pink w-full"
            >
              <Link
                href={`/dashboard/business/discover/${influencerProfile.id}`}
              />
            </ThreeDButton>
          </div>
        )}
      </div>

      {/* Payment summary */}
      <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
        <div className="space-y-2 text-[13px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Money spent</span>
            <span className="font-semibold text-white">
              {formatCurrency(totalCharged)}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
        <div className="space-y-2 text-[13px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Package</span>
            <span className="text-white">
              {formatPackage(campaign.package_type)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Booked</span>
            <span className="text-white">
              {new Date(campaign.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {campaign.updated_at && (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-white/50">Updated</span>
              <span className="text-white">{timeAgo(campaign.updated_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Inbox CTA */}
      <ThreeDButton
        asChild
        label="Open in inbox"
        className="!h-11 !w-full !min-w-0 text-[13px]"
      >
        <Link href={`/dashboard/business/inbox?chat=${campaign.id}`} />
      </ThreeDButton>
    </div>
  );
}
