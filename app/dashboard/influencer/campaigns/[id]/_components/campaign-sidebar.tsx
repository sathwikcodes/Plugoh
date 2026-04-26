"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Mail, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ThreeDButton } from "@/components/ui/3d-button";
import type { Campaign } from "./campaign-types";

interface CampaignSidebarProps {
  campaign: Campaign;
  showContactInfo: boolean;
  onSubmitDelivery: (input: {
    campaignId: string;
    contentUrl: string;
    notes?: string;
  }) => Promise<unknown>;
  isSubmittingDelivery: boolean;
}

const OFFER_STATUSES = new Set(["pre_authorized", "requested", "pending"]);

// ── Inline delivery form ──────────────────────────────────────────────────────

function DeliveryWidget({
  campaign,
  onSubmitDelivery,
  isSubmittingDelivery,
}: {
  campaign: Campaign;
  onSubmitDelivery: (input: {
    campaignId: string;
    contentUrl: string;
    notes?: string;
  }) => Promise<unknown>;
  isSubmittingDelivery: boolean;
}) {
  const [contentUrl, setContentUrl] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleCancel = () => {
    setShowForm(false);
    setContentUrl("");
    setDeliveryNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl.trim()) return;
    await onSubmitDelivery({
      campaignId: campaign.id,
      contentUrl: contentUrl.trim(),
      notes: deliveryNotes.trim() || undefined,
    });
    handleCancel();
  };

  return (
    <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
      <p className="mb-4 text-[12px] text-white/45 leading-[1.6]">
        Upload to Drive / Dropbox and share the link so the brand can release payment.
      </p>

      {!showForm ? (
        /* ── Green 3D trigger button ── */
        <ThreeDButton
          label="Submit delivery"
          hoverLabel="Submit delivery"
          hideIcon
          className="!w-full !min-w-0 !h-11 three-d-button--emerald three-d-button--no-glow"
          onClick={() => setShowForm(true)}
        />
      ) : (
        <form onSubmit={handleSubmit} className="w-full min-w-0 space-y-3.5 rounded-[18px] border border-white/[0.08] bg-[rgba(22,18,25,0.70)] p-3.5 backdrop-blur-sm overflow-hidden">
          <div className="space-y-1.5">
            <Label htmlFor="sidebar-content-url" className="text-xs font-medium text-white/70">
              Content URL <span className="text-amber-400">*</span>
            </Label>
            <div className="relative">
              <ExternalLink className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
              <Input
                id="sidebar-content-url"
                type="url"
                value={contentUrl}
                onChange={(e) => setContentUrl(e.target.value)}
                placeholder="https://drive.google.com/..."
                className="h-9 rounded-full border-white/10 bg-white/5 pl-9 text-sm text-white"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sidebar-delivery-notes" className="text-xs font-medium text-white/50">
              Notes to brand
            </Label>
            <Textarea
              id="sidebar-delivery-notes"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Anything the brand should know…"
              rows={2}
              className="resize-none border-white/10 bg-white/5 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmittingDelivery}
              className="flex h-10 w-full items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/15 text-sm font-semibold text-rose-300 transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingDelivery || !contentUrl.trim()}
              className="flex h-10 w-full items-center justify-center gap-1.5 rounded-full bg-emerald-400 text-sm font-semibold text-black shadow-[0_4px_14px_rgba(52,211,153,0.30)] transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              {isSubmittingDelivery ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── Main sidebar ──────────────────────────────────────────────────────────────

export function CampaignSidebar({
  campaign,
  showContactInfo,
  onSubmitDelivery,
  isSubmittingDelivery,
}: CampaignSidebarProps) {
  const isOffer = OFFER_STATUSES.has(campaign.status);
  const showDelivery = campaign.status === "in_escrow";
  const hasDeliveryUrl = !!campaign.delivery_url;

  return (
    <div className="space-y-3">
      {/* Delivered content link */}
      {hasDeliveryUrl && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3.5">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
            Delivered content
          </p>
          <a
            href={campaign.delivery_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 transition-colors hover:text-emerald-400/80"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View delivery
          </a>
        </div>
      )}

      {/* Submit delivery widget */}
      {showDelivery && (
        <DeliveryWidget
          campaign={campaign}
          onSubmitDelivery={onSubmitDelivery}
          isSubmittingDelivery={isSubmittingDelivery}
        />
      )}

      {/* Brand contact */}
      {showContactInfo &&
      (campaign.business_contact_email || campaign.business_contact_phone) ? (
        <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
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
