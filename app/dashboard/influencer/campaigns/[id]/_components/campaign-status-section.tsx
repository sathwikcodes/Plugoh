import { CheckCircle, Clock, LockKeyhole, Timer } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import type { Campaign } from "./campaign-types";

interface CampaignStatusSectionProps {
  campaign: Campaign;
  autoReleaseDays: number;
}

export function CampaignStatusSection({
  campaign,
  autoReleaseDays,
}: CampaignStatusSectionProps) {
  if (campaign.status === "payment_pending") {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Timer className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              Waiting on brand payment
            </p>
            <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
              You&apos;ve accepted the campaign. The brand needs to complete
              payment before work officially begins.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status === "in_escrow" || campaign.status === "accepted") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              {formatCurrency(campaign.price_offered)} locked in escrow — time
              to create
            </p>
            <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
              Create the content, publish it, then submit the final link below
              to trigger review and payout.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status === "delivery_submitted") {
    return (
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/8 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
            <div>
              <p className="text-sm font-semibold text-white">
                Delivery submitted — awaiting brand review
              </p>
              <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
                Payment auto-releases if no action is taken within the review
                window.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50">
            <Timer className="h-3 w-3" />
            {autoReleaseDays}d auto-release
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status === "completed") {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] px-5 py-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-emerald-300/50">
          Paid out
        </p>
        <p className="mt-1 text-[32px] font-bold leading-none tracking-[-0.04em] text-emerald-300">
          {formatCurrency(campaign.price_offered)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-400/70" />
          <p className="text-[12px] text-white/50">
            Released to your payout account
          </p>
        </div>
      </div>
    );
  }

  return null;
}
