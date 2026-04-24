"use client";

import { CheckCircle, Loader2, X } from "lucide-react";
import FlipClock from "@/components/ui/flip-clock";
import type { Campaign } from "./campaign-types";

interface CampaignOfferActionsProps {
  campaign: Campaign;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting: boolean;
  isDeclining: boolean;
  onExpire: () => void;
}

export function CampaignOfferActions({
  campaign,
  onAccept,
  onDecline,
  isAccepting,
  isDeclining,
  onExpire,
}: CampaignOfferActionsProps) {
  const isOffer = ["pre_authorized", "requested", "pending"].includes(
    campaign.status,
  );

  if (!isOffer) return null;

  const actionsDisabled = isAccepting || isDeclining;

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-5 py-5">
      <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-300/60">
        New Offer
      </p>
      <p className="mb-4 text-center text-[15px] font-semibold text-white">
        Review and accept before the window closes
      </p>
      {campaign.expires_at && (
        <div className="mb-5 flex justify-center">
          <FlipClock
            expiresAt={campaign.expires_at}
            onExpire={onExpire}
            className="justify-center"
          />
        </div>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onDecline}
          disabled={actionsDisabled}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-amber-400/18 bg-amber-400/10 text-amber-300/80 transition-transform duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeclining ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={actionsDisabled}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-400 text-[14px] font-semibold text-black shadow-[0_6px_20px_rgba(52,211,153,0.30)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isAccepting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Accept Campaign</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
