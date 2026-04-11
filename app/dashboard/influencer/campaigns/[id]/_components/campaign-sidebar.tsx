import Link from "next/link";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPackage, timeAgo } from "@/lib/format";
import type { Campaign } from "./campaign-types";

interface CampaignSidebarProps {
  campaign: Campaign;
  showContactInfo: boolean;
}

export function CampaignSidebar({
  campaign,
  showContactInfo,
}: CampaignSidebarProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
          Your Earnings
        </p>
        <p className="num text-[30px] font-bold leading-none tracking-[-0.04em] text-white">
          {formatCurrency(campaign.price_offered)}
        </p>
        <p className="mt-1.5 text-xs text-white/40">
          Released on brand approval or 7-day auto-release
        </p>
      </div>

      <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] p-4">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
          Details
        </p>
        <div className="space-y-2 text-[13px]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Package</span>
            <span className="text-right text-white">
              {formatPackage(campaign.package_type)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-white/50">Received</span>
            <span className="text-right text-white">
              {new Date(campaign.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          {campaign.updated_at ? (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-white/50">Updated</span>
              <span className="text-right text-white">
                {timeAgo(campaign.updated_at)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {showContactInfo &&
      (campaign.business_contact_email || campaign.business_contact_phone) ? (
        <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] p-4">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
            Brand contact
          </p>
          <div className="space-y-2.5">
            {campaign.business_contact_email ? (
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/35" />
                <p className="break-all text-[13px] text-white/75">
                  {campaign.business_contact_email}
                </p>
              </div>
            ) : null}
            {campaign.business_contact_phone ? (
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-white/35" />
                <p className="text-[13px] text-white/75">
                  {campaign.business_contact_phone}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <Button
        variant="outline"
        asChild
        className="h-10 w-full rounded-full border-white/12 text-sm hover:bg-white/8"
      >
        <Link href={`/dashboard/influencer/inbox?chat=${campaign.id}`}>
          <MessageSquare className="mr-2 h-3.5 w-3.5" />
          Open in inbox
        </Link>
      </Button>
    </div>
  );
}
