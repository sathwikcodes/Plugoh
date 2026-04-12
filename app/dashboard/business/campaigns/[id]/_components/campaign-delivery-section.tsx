"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, Loader2, Timer } from "lucide-react";
import { useTRPC } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import type { Campaign } from "./campaign-types";

function daysRemaining(from: string, totalDays: number): number {
  const deadline = new Date(from).getTime() + totalDays * 86_400_000;
  return Math.max(0, Math.ceil((deadline - Date.now()) / 86_400_000));
}

interface CampaignDeliverySectionProps {
  campaign: Campaign;
}

export function CampaignDeliverySection({
  campaign,
}: CampaignDeliverySectionProps) {
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.campaign.getCampaigns.queryKey(),
    });
    // No-arg queryKey() is a TRPC prefix wildcard — matches every getCampaign({...}) query.
    queryClient.invalidateQueries({
      queryKey: trpc.campaign.getCampaign.queryKey(),
    });
  };

  const approveDelivery = useMutation(
    trpc.campaign.approveDelivery.mutationOptions({
      onSuccess: () => {
        invalidate();
        toast({
          title: "Delivery approved",
          description: "Payment is being released to the creator.",
        });
      },
      onError: (err) => {
        toast({
          title: "Could not approve",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const disputeDelivery = useMutation(
    trpc.campaign.disputeDelivery.mutationOptions({
      onSuccess: () => {
        invalidate();
        setShowDisputeForm(false);
        setDisputeReason("");
        toast({
          title: "Dispute raised",
          description: "Our team will review within 48 hours.",
        });
      },
      onError: (err) => {
        toast({
          title: "Could not raise dispute",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  if (campaign.status !== "delivery_submitted") return null;

  const autoReleaseDays = campaign.delivery_submitted_at
    ? daysRemaining(campaign.delivery_submitted_at, 7)
    : 7;

  return (
    <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/8 p-4 sm:p-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              Content delivered — your move
            </p>
            <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
              Review the content, then approve to release payment.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50 sm:text-xs sm:self-auto">
          <Timer className="h-3 w-3" />
          {autoReleaseDays}d auto-release
        </div>
      </div>
      {!showDisputeForm ? (
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <Button
            onClick={() => approveDelivery.mutate({ campaignId: campaign.id })}
            disabled={approveDelivery.isPending}
            className="h-10 w-full rounded-full bg-white text-black hover:bg-white/90 text-sm sm:flex-1"
          >
            {approveDelivery.isPending ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Releasing…
              </>
            ) : (
              `Approve & release ${formatCurrency(campaign.price_offered)}`
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowDisputeForm(true)}
            className="h-10 w-full rounded-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm px-4 sm:w-auto"
          >
            <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
            Dispute
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Label className="text-xs text-white/70">Describe the issue</Label>
          <Textarea
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
            placeholder="What's wrong? Be specific so we can resolve quickly."
            rows={3}
            className="resize-none text-sm"
          />
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button
              onClick={() =>
                disputeDelivery.mutate({
                  campaignId: campaign.id,
                  reason: disputeReason,
                })
              }
              disabled={disputeDelivery.isPending || disputeReason.length < 10}
              className="h-10 w-full rounded-full bg-rose-500 text-white hover:bg-rose-600 sm:flex-1"
            >
              {disputeDelivery.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Submit dispute"
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setShowDisputeForm(false);
                setDisputeReason("");
              }}
              className="h-10 w-full rounded-full text-sm sm:w-auto"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
