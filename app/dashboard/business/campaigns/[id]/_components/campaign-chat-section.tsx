import Link from "next/link";
import Image from "next/image";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  timeAgo,
  formatCurrency,
  formatPackage,
  getInitials,
} from "@/lib/format";
import { INSTAGRAM_GRADIENT } from "@/lib/animations";
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
  platformFee: number;
  totalCharged: number;
}

export function CampaignChatSection({
  campaign,
  influencerProfile,
  platformFee,
  totalCharged,
}: CampaignChatSectionProps) {
  const handle =
    influencerProfile?.instagram_handle || influencerProfile?.ig_username;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
          Creator
        </p>
        <div className="flex items-center gap-3">
          {influencerProfile?.ig_profile_picture_url ? (
            <Image
              src={influencerProfile.ig_profile_picture_url}
              alt={influencerProfile.display_name || "Creator"}
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
              {influencerProfile?.display_name || "Creator"}
            </p>
            <p className="truncate text-xs text-white/45">
              {handle ? `@${handle}` : influencerProfile?.category || "—"}
            </p>
          </div>
        </div>
        {influencerProfile && (
          <Button
            variant="outline"
            asChild
            size="sm"
            className="mt-3 h-9 w-full rounded-full border-white/12 text-xs hover:bg-white/8"
          >
            <Link href={`/dashboard/business/discover/${influencerProfile.id}`}>
              View creator profile
            </Link>
          </Button>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
          Payment
        </p>
        <div className="space-y-2 text-[13px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Creator fee</span>
            <span className="font-medium text-white text-right">
              {formatCurrency(campaign.price_offered)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Platform (12%)</span>
            <span className="font-medium text-white text-right">
              {formatCurrency(platformFee)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-2">
            <span className="text-white/70 font-medium">Total</span>
            <span className="font-semibold text-white text-right">
              {formatCurrency(totalCharged)}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
          Details
        </p>
        <div className="space-y-2 text-[13px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Package</span>
            <span className="text-white text-right">
              {formatPackage(campaign.package_type)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Booked</span>
            <span className="text-white text-right">
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
              <span className="text-white text-right">
                {timeAgo(campaign.updated_at)}
              </span>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="outline"
        asChild
        className="h-10 w-full rounded-full border-white/12 text-sm hover:bg-white/8"
      >
        <Link href={`/dashboard/business/inbox?chat=${campaign.id}`}>
          <MessageSquare className="mr-2 h-3.5 w-3.5" />
          Open in inbox
        </Link>
      </Button>
    </div>
  );
}
