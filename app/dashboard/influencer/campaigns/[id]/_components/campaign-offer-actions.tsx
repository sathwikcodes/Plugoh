"use client";

import { Check, Loader2, X } from "lucide-react";
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
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onDecline}
          disabled={actionsDisabled}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 text-[14px] font-semibold text-rose-300 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {isDeclining ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <><X className="h-4 w-4" />Cancel</>
          )}
        </button>
        <button
          type="button"
          onClick={onAccept}
          disabled={actionsDisabled}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 text-[14px] font-semibold text-black shadow-[0_6px_20px_rgba(52,211,153,0.30)] transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
        >
          {isAccepting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <><Check className="h-4 w-4" />Accept</>
          )}
        </button>
      </div>
    </div>
  );
}
