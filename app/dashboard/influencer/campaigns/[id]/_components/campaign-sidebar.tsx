import Link from "next/link";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { ThreeDButton } from "@/components/ui/3d-button";
import type { Campaign } from "./campaign-types";

interface CampaignSidebarProps {
  campaign: Campaign;
  showContactInfo: boolean;
}

const EARNINGS_CONFIG: Record<
  string,
  { label: string; note: string; color: string }
> = {
  pre_authorized: {
    label: "Offer Value",
    note: "Accept to lock this deal",
    color: "text-amber-300",
  },
  requested: {
    label: "Offer Value",
    note: "Accept to lock this deal",
    color: "text-amber-300",
  },
  pending: {
    label: "Offer Value",
    note: "Accept to lock this deal",
    color: "text-amber-300",
  },
  payment_pending: {
    label: "Accepted",
    note: "Waiting for brand to pay",
    color: "text-white",
  },
  in_escrow: {
    label: "In Escrow",
    note: "Released on brand approval",
    color: "text-emerald-300",
  },
  accepted: {
    label: "In Escrow",
    note: "Released on brand approval",
    color: "text-emerald-300",
  },
  delivery_submitted: {
    label: "Pending Payout",
    note: "Auto-releases in 7 days if brand doesn't act",
    color: "text-yellow-300",
  },
  completed: {
    label: "Earned",
    note: "Paid out to your account",
    color: "text-emerald-300",
  },
};

const DEFAULT_EARNINGS = {
  label: "Amount",
  note: "Campaign did not proceed",
  color: "text-white/40",
};

const OFFER_STATUSES = new Set(["pre_authorized", "requested", "pending"]);

export function CampaignSidebar({
  campaign,
  showContactInfo,
}: CampaignSidebarProps) {
  const earnings = EARNINGS_CONFIG[campaign.status] ?? DEFAULT_EARNINGS;
  const isOffer = OFFER_STATUSES.has(campaign.status);

  const formattedReceived = new Date(campaign.created_at).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "short", year: "numeric" },
  );

  const formattedExpiry = campaign.expires_at
    ? new Date(campaign.expires_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-3">
      {/* Earnings */}
      <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/35">
          {earnings.label}
        </p>
        <p
          className={`mt-1.5 text-[34px] font-bold leading-none tracking-[-0.04em] ${earnings.color}`}
        >
          {formatCurrency(campaign.price_offered)}
        </p>
        <p className="mt-1.5 text-[11px] text-white/40">{earnings.note}</p>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
          Details
        </p>
        <div className="space-y-2 text-[13px]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-white/45">Received</span>
            <span className="text-right text-white">{formattedReceived}</span>
          </div>
          {formattedExpiry && isOffer && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-white/45">Expires</span>
              <span className="text-right text-amber-300/80">
                {formattedExpiry}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Brand contact */}
      {showContactInfo &&
      (campaign.business_contact_email || campaign.business_contact_phone) ? (
        <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
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

      {/* Chat button */}
      <ThreeDButton
        asChild
        label="Open in inbox"
        className="!h-11 !w-full !min-w-0 text-[13px]"
      >
        <Link href={`/dashboard/influencer/inbox?chat=${campaign.id}`} />
      </ThreeDButton>
    </div>
  );
}
