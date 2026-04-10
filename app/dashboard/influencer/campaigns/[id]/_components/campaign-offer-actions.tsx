import { CheckCircle, Loader2, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="space-y-4 rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              New offer — review before the window closes
            </p>
            <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
              Accept to lock the deal and start the campaign conversation.
            </p>
          </div>
        </div>
        {campaign.expires_at && (
          <div className="flex w-full justify-center sm:w-auto sm:justify-end">
            <FlipClock
              className="justify-center"
              expiresAt={campaign.expires_at}
              onExpire={onExpire}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button
          onClick={onAccept}
          disabled={isAccepting || isDeclining}
          className="h-10 w-full rounded-full bg-white text-sm text-black hover:bg-white/90 sm:flex-1"
        >
          {isAccepting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Accepting…
            </>
          ) : (
            <>
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
              Accept Campaign
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onDecline}
          disabled={isAccepting || isDeclining}
          className="h-10 w-full rounded-full border-white/15 text-sm text-white/70 hover:bg-white/[0.05] sm:w-auto sm:px-5"
        >
          {isDeclining ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <X className="mr-1.5 h-3.5 w-3.5" />
              Decline
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
