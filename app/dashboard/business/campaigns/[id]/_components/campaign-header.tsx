import Link from "next/link";
import { ArrowLeft, CheckCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { brandDisplayAmountFromCampaign } from "@/lib/brand-pricing";
import FlipClock from "@/components/ui/flip-clock";
import type { Campaign } from "./campaign-types";

interface CampaignHeaderProps {
  campaign: Campaign;
}

export function CampaignHeader({ campaign }: CampaignHeaderProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
        >
          <Link href="/dashboard/business/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="min-w-0 flex-1 truncate text-3xl font-display text-white sm:text-3xl">
          {campaign.title || "Untitled Campaign"}
        </h1>
      </div>

      {campaign.status === "pre_authorized" && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" />
              <div>
                <p className="text-sm font-semibold text-white">
                  {campaign.payment_method === "upi"
                    ? "Payment held — waiting for influencer"
                    : "Card pre-authorized — waiting for influencer"}
                </p>
                <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
                  {campaign.payment_method === "upi"
                    ? "Full refund if they don't accept within the window."
                    : "No charge yet. Only captured if the influencer accepts."}
                </p>
              </div>
            </div>
            <div className="flex w-full justify-center sm:w-auto sm:justify-end">
              <FlipClock
                className="justify-center"
                expiresAt={campaign.expires_at}
              />
            </div>
          </div>
        </div>
      )}

      {campaign.status === "completed" && (
        <div className="flex flex-col gap-3 rounded-2xl border border-green-500/20 bg-green-500/[0.07] px-4 py-3 sm:flex-row sm:items-center">
          <CheckCircle className="h-4 w-4 shrink-0 text-green-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              Campaign completed
            </p>
            <p className="text-xs text-white/50">
              {formatCurrency(brandDisplayAmountFromCampaign(campaign))}{" "}
              released
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
