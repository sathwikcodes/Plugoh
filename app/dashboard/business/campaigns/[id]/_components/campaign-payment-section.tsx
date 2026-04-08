"use client";

import { useState } from "react";
import Script from "next/script";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { useTRPC } from "@/lib/trpc/client";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPackage } from "@/lib/format";
import type { Campaign } from "./campaign-types";

interface CampaignPaymentSectionProps {
  campaign: Campaign;
  platformFee: number;
  totalCharged: number;
}

export function CampaignPaymentSection({
  campaign,
  platformFee,
  totalCharged,
}: CampaignPaymentSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [payingEscrow, setPayingEscrow] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.campaign.getCampaigns.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.campaign.getCampaign.queryKey(),
    });
  };

  const handlePayEscrow = async () => {
    if (!user) return;
    setPayingEscrow(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token)
        throw new Error("Session expired — please sign in again");
      const orderRes = await fetch("/api/payment/create-escrow-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ campaign_id: campaign.id }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.error ?? "Failed to create order");

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Plugoh",
        description: campaign.title ?? "Campaign payment",
        order_id: orderData.orderId,
        prefill: {
          email: campaign.business_contact_email ?? "",
          contact: campaign.business_contact_phone ?? "",
        },
        theme: { color: "#0f172a" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payment/verify-escrow", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ ...response, campaign_id: campaign.id }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            toast({
              title: "Verification failed",
              description: verifyData.error,
              variant: "destructive",
            });
            setPayingEscrow(false);
            return;
          }
          toast({
            title: "Payment secured",
            description: "Funds locked in escrow. Creator can now start work.",
          });
          invalidate();
          setPayingEscrow(false);
        },
        modal: { ondismiss: () => setPayingEscrow(false) },
      });
      rzp.open();
    } catch (err) {
      toast({
        title: "Could not start payment",
        description:
          err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
      setPayingEscrow(false);
    }
  };

  if (campaign.status !== "payment_pending") return null;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.08] p-4 sm:p-5 space-y-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              Creator accepted — pay to start
            </p>
            <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
              Funds go into escrow. Released only when you approve the delivery.
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-black/20 px-4 py-3 text-xs space-y-1.5">
          <div className="flex justify-between text-white/55">
            <span>{formatPackage(campaign.package_type)}</span>
            <span>{formatCurrency(campaign.price_offered)}</span>
          </div>
          <div className="flex justify-between text-white/55">
            <span>Platform fee (12%)</span>
            <span>{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex justify-between border-t border-white/8 pt-1.5 font-semibold text-white">
            <span>Total</span>
            <span>{formatCurrency(totalCharged)}</span>
          </div>
        </div>
        <Button
          onClick={handlePayEscrow}
          disabled={payingEscrow}
          className="h-11 w-full rounded-full bg-white text-black hover:bg-white/90"
        >
          {payingEscrow ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting…
            </>
          ) : (
            `Pay ${formatCurrency(totalCharged)} to start`
          )}
        </Button>
      </div>
    </>
  );
}
