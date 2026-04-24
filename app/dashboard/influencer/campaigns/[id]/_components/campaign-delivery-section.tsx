"use client";

import { useState } from "react";
import { ExternalLink, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Campaign } from "./campaign-types";

interface CampaignDeliverySectionProps {
  campaign: Campaign;
  onSubmitDelivery: (input: {
    campaignId: string;
    contentUrl: string;
    notes?: string;
  }) => Promise<unknown>;
  isSubmittingDelivery: boolean;
}

export function CampaignDeliverySection({
  campaign,
  onSubmitDelivery,
  isSubmittingDelivery,
}: CampaignDeliverySectionProps) {
  const [contentUrl, setContentUrl] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  const handleCancel = () => {
    setShowDeliveryForm(false);
    setContentUrl("");
    setDeliveryNotes("");
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl.trim()) return;
    await onSubmitDelivery({
      campaignId: campaign.id,
      contentUrl: contentUrl.trim(),
      notes: deliveryNotes.trim() || undefined,
    });
    handleCancel();
  };

  if (!campaign.delivery_url && campaign.status !== "in_escrow") return null;

  return (
    <div className="space-y-4">
      {campaign.delivery_url ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-4">
          <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
            Delivered content
          </p>
          <a
            href={campaign.delivery_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 transition-colors hover:text-emerald-400/80"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View delivery
          </a>
        </div>
      ) : null}

      {campaign.status === "in_escrow" ? (
        <div className="rounded-2xl border border-white/[0.09] bg-[linear-gradient(160deg,rgba(22,18,25,0.90)_0%,rgba(30,24,41,0.85)_100%)] px-4 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.32),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm sm:px-5">
          <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
            Submit delivery
          </p>
          <p className="mb-4 text-[12.5px] text-white/50 sm:text-[13px]">
            Upload your content to Google Drive, Dropbox, or similar and share
            the link here so the brand can review and release payment.
          </p>
          {!showDeliveryForm ? (
            <Button
              className="h-10 rounded-full px-5 text-sm"
              onClick={() => setShowDeliveryForm(true)}
            >
              <Send className="mr-2 h-3.5 w-3.5" />
              Submit delivery
            </Button>
          ) : (
            <form
              onSubmit={handleSubmitDelivery}
              className="space-y-4 rounded-[20px] border border-white/[0.08] bg-[rgba(22,18,25,0.70)] p-4 backdrop-blur-sm"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="content-url"
                  className="text-sm font-medium text-white"
                >
                  Content Drive URL <span className="text-amber-400">*</span>
                </Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  <Input
                    id="content-url"
                    type="url"
                    value={contentUrl}
                    onChange={(e) => setContentUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/..."
                    className="h-10 rounded-full border-white/10 bg-white/5 pl-10 text-white"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="delivery-notes"
                  className="text-sm font-medium text-white/60"
                >
                  Notes to brand
                </Label>
                <Textarea
                  id="delivery-notes"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Anything the brand should know about the content…"
                  rows={3}
                  className="resize-none border-white/10 bg-white/5 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row">
                <Button
                  type="submit"
                  className="h-10 flex-1 rounded-full text-sm"
                  disabled={isSubmittingDelivery || !contentUrl.trim()}
                >
                  {isSubmittingDelivery ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-3.5 w-3.5" />
                  )}
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 rounded-full text-sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
