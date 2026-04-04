"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  CircleDot,
  ExternalLink,
  Loader2,
  MessageSquare,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useTRPC } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { timeAgo } from "@/lib/format";
import { BookingTimer } from "@/components/booking-timer";
import { CAMPAIGN_STATUS_CONFIG } from "@/lib/constants";
import type { CampaignStatus } from "@/lib/constants";
import type { Database } from "@/lib/supabase/types";
import { INSTAGRAM_GRADIENT } from "@/lib/animations";
import { cn } from "@/lib/utils";

// The Supabase type generator lags behind actual columns; cast to extend it.
type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  payment_method?: string | null;
  delivery_url?: string | null;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

// ── Step definitions ──────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "pre_authorized", label: "Booked" },
  { key: "in_escrow", label: "In Progress" },
  { key: "delivery_submitted", label: "Delivered" },
  { key: "completed", label: "Done" },
];

const LEGACY_STEPS = [
  { key: "requested", label: "Requested" },
  { key: "payment_pending", label: "Accepted" },
  { key: "in_escrow", label: "In Progress" },
  { key: "delivery_submitted", label: "Delivered" },
  { key: "completed", label: "Done" },
];

const TERMINAL_STATUSES = new Set([
  "declined",
  "expired",
  "cancelled",
  "refunded",
  "rejected",
]);

// ── Helpers ───────────────────────────────────────────────────────────────
function formatCurrency(value: number | null): string {
  if (!value) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatPackage(pkg: string | null): string {
  if (!pkg) return "Campaign";
  return pkg.charAt(0).toUpperCase() + pkg.slice(1);
}

function getInitials(name: string | null): string {
  return (name?.trim() || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function daysRemaining(from: string, totalDays: number): number {
  const deadline = new Date(from).getTime() + totalDays * 86_400_000;
  return Math.max(0, Math.ceil((deadline - Date.now()) / 86_400_000));
}

// ── Status timeline ───────────────────────────────────────────────────────
function StatusTimeline({ status }: { status: string }) {
  if (TERMINAL_STATUSES.has(status)) {
    const labels: Record<string, string> = {
      declined: "Declined by the creator",
      rejected: "Declined by the creator",
      expired: "No response — booking expired",
      cancelled: "Booking cancelled",
      refunded: "Refunded",
    };
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3">
        <CircleDot className="h-4 w-4 shrink-0 text-rose-300/70" />
        <div>
          <p className="text-sm font-medium capitalize text-white">{status}</p>
          <p className="text-xs text-white/50">
            {labels[status] ?? "This campaign did not move forward."}
          </p>
        </div>
      </div>
    );
  }

  const isLegacy = status === "requested" || status === "payment_pending";
  const steps = isLegacy ? LEGACY_STEPS : STATUS_STEPS;
  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="flex items-center overflow-x-auto">
      {steps.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                  reached
                    ? "border-emerald-300/30 bg-emerald-300/15"
                    : "border-white/10 bg-white/[0.04]",
                )}
              >
                <CircleDot
                  className={cn(
                    "h-3.5 w-3.5",
                    current
                      ? "text-emerald-200"
                      : reached
                        ? "text-emerald-200/60"
                        : "text-white/30",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium uppercase tracking-[0.14em]",
                  reached ? "text-white/80" : "text-white/35",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-4 h-px w-8 sm:w-14",
                  index < currentIndex ? "bg-emerald-300/45" : "bg-white/10",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function BusinessCampaignDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [payingEscrow, setPayingEscrow] = useState(false);

  const { data: rawCampaign, isLoading } = useCampaign(id, user?.id);
  const campaign = rawCampaign as Campaign | undefined;
  const { data: influencerProfile } = useInfluencerProfile(
    campaign?.influencer_profile_id ?? undefined,
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
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

  const handlePayEscrow = async () => {
    if (!campaign || !user) return;
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

  if (isLoading) {
    return (
      <div className="container max-w-5xl space-y-5 py-6">
        <div className="h-9 w-36 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-28 w-full animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="h-16 animate-pulse rounded-2xl bg-white/[0.04]" />
            <div className="h-40 animate-pulse rounded-2xl bg-white/[0.04]" />
          </div>
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-2xl bg-white/[0.04]" />
            <div className="h-24 animate-pulse rounded-2xl bg-white/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container py-12 text-center">
        <p className="text-white/50">Campaign not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/business/campaigns">Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  const cfg =
    CAMPAIGN_STATUS_CONFIG[campaign.status as CampaignStatus] ??
    CAMPAIGN_STATUS_CONFIG.requested;
  const platformFee =
    campaign.platform_fee_amount ?? (campaign.price_offered ?? 0) * 0.12;
  const totalCharged =
    campaign.total_charged_amount ?? (campaign.price_offered ?? 0) * 1.12;
  const autoReleaseDays = campaign.delivery_submitted_at
    ? daysRemaining(campaign.delivery_submitted_at, 7)
    : 7;
  const handle =
    influencerProfile?.instagram_handle || influencerProfile?.ig_username;

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="container max-w-5xl space-y-5 py-6">
        {/* ── Back + title header ───────────────────────────────────── */}
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
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold text-white sm:text-2xl">
                {campaign.title || "Untitled Campaign"}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-xs",
                  cfg.badge,
                )}
              >
                {cfg.label}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-white/40">
              Booked {timeAgo(campaign.created_at)}
              {influencerProfile?.display_name
                ? ` · ${influencerProfile.display_name}`
                : ""}
            </p>
          </div>
        </div>

        {/* ── Contextual action banners (one at a time) ─────────────── */}

        {campaign.status === "pre_authorized" && (
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amber-300/80" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    {campaign.payment_method === "upi"
                      ? "Payment held — waiting for creator"
                      : "Card pre-authorized — waiting for creator"}
                  </p>
                  <p className="mt-0.5 text-xs text-white/55">
                    {campaign.payment_method === "upi"
                      ? "Full refund if they don't accept within the window."
                      : "No charge yet. Only captured if the creator accepts."}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] uppercase tracking-wide text-white/35">
                  expires
                </p>
                <BookingTimer expiresAt={campaign.expires_at} />
              </div>
            </div>
          </div>
        )}

        {campaign.status === "payment_pending" && (
          <div className="rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.08] p-4 sm:p-5 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Creator accepted — pay to start
                </p>
                <p className="mt-0.5 text-xs text-white/55">
                  Funds go into escrow. Released only when you approve the
                  delivery.
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
        )}

        {campaign.status === "delivery_submitted" && (
          <div className="rounded-2xl border border-blue-500/25 bg-blue-500/[0.08] p-4 sm:p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-300/80" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Content delivered — your move
                  </p>
                  <p className="mt-0.5 text-xs text-white/55">
                    Review the content, then approve to release payment.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
                <Timer className="h-3 w-3" />
                {autoReleaseDays}d auto-release
              </div>
            </div>

            {!showDisputeForm ? (
              <div className="flex gap-2.5">
                <Button
                  onClick={() =>
                    approveDelivery.mutate({ campaignId: campaign.id })
                  }
                  disabled={approveDelivery.isPending}
                  className="h-10 flex-1 rounded-full bg-white text-black hover:bg-white/90 text-sm"
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
                  className="h-10 rounded-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-sm px-4"
                >
                  <AlertTriangle className="mr-1.5 h-3.5 w-3.5" />
                  Dispute
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-xs text-white/70">
                  Describe the issue
                </Label>
                <Textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="What's wrong? Be specific so we can resolve quickly."
                  rows={3}
                  className="resize-none text-sm"
                />
                <div className="flex gap-2.5">
                  <Button
                    onClick={() =>
                      disputeDelivery.mutate({
                        campaignId: campaign.id,
                        reason: disputeReason,
                      })
                    }
                    disabled={
                      disputeDelivery.isPending || disputeReason.length < 10
                    }
                    className="h-10 flex-1 rounded-full bg-rose-500 text-white hover:bg-rose-600"
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
                    className="h-10 rounded-full text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {campaign.status === "completed" && (
          <div className="flex items-center gap-3 rounded-2xl border border-violet-500/20 bg-violet-500/[0.07] px-4 py-3">
            <CheckCircle className="h-4 w-4 shrink-0 text-violet-300/80" />
            <div>
              <p className="text-sm font-semibold text-white">
                Campaign completed
              </p>
              <p className="text-xs text-white/50">
                {formatCurrency(campaign.price_offered)} released · Platform fee{" "}
                {formatCurrency(platformFee)}
              </p>
            </div>
          </div>
        )}

        {/* ── Main two-column layout ────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          {/* ── Left: Timeline + Brief ──────────────────────────────── */}
          <div className="space-y-4">
            {/* Timeline */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
                Progress
              </p>
              <StatusTimeline status={campaign.status} />
            </div>

            {/* Campaign brief */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
                Campaign brief
              </p>
              {campaign.brief ? (
                <p className="whitespace-pre-wrap text-[13px] leading-[1.75] text-white/70">
                  {campaign.brief}
                </p>
              ) : (
                <p className="text-[13px] text-white/35 italic">
                  No brief provided.
                </p>
              )}
            </div>

            {/* Delivery URL (if submitted or completed) */}
            {campaign.delivery_url && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4">
                <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Delivered content
                </p>
                <a
                  href={campaign.delivery_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  View delivery
                </a>
              </div>
            )}
          </div>

          {/* ── Right: Creator + Financials + Details ───────────────── */}
          <div className="space-y-3">
            {/* Creator card */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
                Creator
              </p>
              <div className="flex items-center gap-3">
                {influencerProfile?.ig_profile_picture_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={influencerProfile.ig_profile_picture_url}
                    alt={influencerProfile.display_name || "Creator"}
                    className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white/70 ring-1 ring-white/8"
                    style={{ background: INSTAGRAM_GRADIENT }}
                  >
                    {getInitials(influencerProfile?.display_name ?? null)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {influencerProfile?.display_name || "Creator"}
                  </p>
                  <p className="truncate text-xs text-white/45">
                    {handle ? `@${handle}` : influencerProfile?.category || "—"}
                  </p>
                </div>
              </div>
              {influencerProfile && (
                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="mt-3 h-9 w-full rounded-full border-white/12 text-xs hover:bg-white/8"
                >
                  <Link
                    href={`/dashboard/business/discover/${influencerProfile.id}`}
                  >
                    View creator profile
                  </Link>
                </Button>
              )}
            </div>

            {/* Financials */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
                Payment
              </p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-white/50">Creator fee</span>
                  <span className="font-medium text-white">
                    {formatCurrency(campaign.price_offered)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Platform (12%)</span>
                  <span className="font-medium text-white">
                    {formatCurrency(platformFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/8 pt-2">
                  <span className="text-white/70 font-medium">Total</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(totalCharged)}
                  </span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
                Details
              </p>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-white/50">Package</span>
                  <span className="text-white">
                    {formatPackage(campaign.package_type)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Booked</span>
                  <span className="text-white">
                    {new Date(campaign.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {campaign.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-white/50">Updated</span>
                    <span className="text-white">
                      {timeAgo(campaign.updated_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Inbox link */}
            <Button
              variant="outline"
              asChild
              className="h-10 w-full rounded-full border-white/12 text-sm hover:bg-white/8"
            >
              <Link href={`/dashboard/business/inbox?chat=${campaign.id}`}>
                <MessageSquare className="mr-2 h-3.5 w-3.5" />
                Open in inbox
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
