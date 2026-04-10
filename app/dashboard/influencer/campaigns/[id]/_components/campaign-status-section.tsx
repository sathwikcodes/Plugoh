import { CheckCircle, Lock, Timer } from "lucide-react";
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
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.08] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Timer className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              Waiting for brand payment
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

  if (campaign.status === "in_escrow") {
    return (
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.08] p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              Funds locked in escrow — time to create
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
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.08] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
            <div>
              <p className="text-sm font-semibold text-white">
                Delivery submitted — waiting for brand review
              </p>
              <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
                Payment auto-releases if no action is taken within the review
                window.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50 sm:self-auto sm:text-xs">
            <Timer className="h-3 w-3" />
            {autoReleaseDays}d auto-release
          </div>
        </div>
      </div>
    );
  }

  if (campaign.status === "completed") {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border border-green-500/20 bg-green-500/[0.07] px-4 py-3 sm:flex-row sm:items-center">
        <CheckCircle className="h-4 w-4 shrink-0 text-green-300/80" />
        <div>
          <p className="text-sm font-semibold text-white">
            Campaign completed
          </p>
          <p className="text-xs text-white/50">
            {formatCurrency(campaign.price_offered)} released to your payout
            account
          </p>
        </div>
      </div>
    );
  }

  return null;
}
