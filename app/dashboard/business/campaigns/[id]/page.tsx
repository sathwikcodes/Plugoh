"use client";

import { useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle,
  CircleDot,
  ExternalLink,
  IndianRupee,
  Loader2,
  Package,
  ShieldCheck,
  Sparkles,
  Timer,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useTRPC } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { statusColor, timeAgo } from "@/lib/format";
import { BookingTimer } from "@/components/booking-timer";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const STATUS_STEPS = [
  { key: "pre_authorized", label: "Booked" },
  { key: "in_escrow", label: "In Progress" },
  { key: "delivery_submitted", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

// Legacy steps for old-flow campaigns
const LEGACY_STATUS_STEPS = [
  { key: "requested", label: "Requested" },
  { key: "payment_pending", label: "Accepted" },
  { key: "in_escrow", label: "In Progress" },
  { key: "delivery_submitted", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

const TERMINAL_STATUSES = new Set(["declined", "expired", "cancelled", "refunded", "rejected"]);

function formatCurrency(value: number | null) {
  if (!value) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatPackage(packageType: string | null) {
  if (!packageType) return "Campaign";
  return packageType.charAt(0).toUpperCase() + packageType.slice(1);
}

function getInfluencerInitials(name: string | null) {
  return (name?.trim() || "Influencer")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function daysRemaining(fromDate: string, totalDays: number): number {
  const deadline = new Date(fromDate).getTime() + totalDays * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((deadline - Date.now()) / (24 * 60 * 60 * 1000)));
}

function StatusTimeline({ status }: { status: string }) {
  const isLegacy = status === "requested" || status === "payment_pending";
  const steps = isLegacy ? LEGACY_STATUS_STEPS : STATUS_STEPS;

  if (TERMINAL_STATUSES.has(status)) {
    const labels: Record<string, string> = {
      declined: "Declined by the influencer",
      rejected: "Declined by the influencer",
      expired: "Booking expired — no response received",
      cancelled: "Cancelled",
      refunded: "Refunded",
    };
    return (
      <div className="rounded-2xl border border-rose-300/20 bg-rose-300/8 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-300/15">
            <CircleDot className="h-4 w-4 text-rose-200" />
          </div>
          <div>
            <p className="text-sm font-medium text-white capitalize">{status}</p>
            <p className="text-sm text-white/55">{labels[status] ?? "This campaign did not move forward."}</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {steps.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                  reached ? "border-emerald-300/30 bg-emerald-300/15" : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <CircleDot
                  className={`h-4 w-4 ${
                    current ? "text-emerald-200" : reached ? "text-emerald-200/70" : "text-white/35"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-medium uppercase tracking-[0.18em] ${
                  reached ? "text-white/85" : "text-white/40"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <div
                className={`mx-2 mt-[-18px] h-px w-8 sm:w-12 ${
                  index < currentIndex ? "bg-emerald-300/50" : "bg-white/10"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function InfoTile({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof Package;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-4 backdrop-blur-xl">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06]">
        <Icon className="h-4 w-4 text-white/70" />
      </div>
      <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-white/40">{label}</p>
      <p className="mt-2 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-white/50">{helper}</p>
    </div>
  );
}

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

  const { data: campaign, isLoading } = useCampaign(id, user?.id);
  const { data: influencerProfile } = useInfluencerProfile(
    campaign?.influencer_profile_id ?? undefined,
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
  };

  const approveDeliveryMutation = useMutation(
    trpc.campaign.approveDelivery.mutationOptions({
      onSuccess: () => {
        invalidate();
        toast({ title: "Delivery approved", description: "Payment is being released to the creator." });
      },
      onError: (error) => {
        toast({ title: "Could not approve delivery", description: error.message, variant: "destructive" });
      },
    }),
  );

  const disputeMutation = useMutation(
    trpc.campaign.disputeDelivery.mutationOptions({
      onSuccess: () => {
        invalidate();
        setShowDisputeForm(false);
        setDisputeReason("");
        toast({ title: "Dispute raised", description: "Our team will review within 48 hours." });
      },
      onError: (error) => {
        toast({ title: "Could not raise dispute", description: error.message, variant: "destructive" });
      },
    }),
  );

  const handlePayEscrow = async () => {
    if (!campaign || !user) return;
    setPayingEscrow(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expired — please sign in again");

      const orderRes = await fetch("/api/payment/create-escrow-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ campaign_id: campaign.id }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Failed to create order");

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Plugoh",
        description: campaign.title ?? "Campaign payment",
        order_id: orderData.orderId,
        prefill: { email: campaign.business_contact_email ?? "", contact: campaign.business_contact_phone ?? "" },
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
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              campaign_id: campaign.id,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            toast({ title: "Payment verification failed", description: verifyData.error, variant: "destructive" });
            setPayingEscrow(false);
            return;
          }

          toast({ title: "Payment secured", description: "Funds are locked in escrow. The creator can now start work." });
          invalidate();
          setPayingEscrow(false);
        },
        modal: { ondismiss: () => setPayingEscrow(false) },
      });

      rzp.open();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Could not start payment", description: message, variant: "destructive" });
      setPayingEscrow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container py-12 text-center">
        <p className="text-muted-foreground">Campaign not found.</p>
        <Button className="mt-4" asChild>
          <Link href="/dashboard/business/campaigns">Back to Campaigns</Link>
        </Button>
      </div>
    );
  }

  const influencerInitials = getInfluencerInitials(influencerProfile?.display_name ?? null);
  const totalCharged = campaign.total_charged_amount ?? (campaign.price_offered ?? 0) * 1.12;
  const platformFee = campaign.platform_fee_amount ?? (campaign.price_offered ?? 0) * 0.12;
  const autoReleaseDays = campaign.delivery_submitted_at
    ? daysRemaining(campaign.delivery_submitted_at, 7)
    : 7;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="container max-w-5xl space-y-6 py-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/business/campaigns">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to campaigns
          </Link>
        </Button>

        {/* ── Pre-Authorized Banner (new flow) ─────────────────────────────── */}
        {campaign.status === "pre_authorized" ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-amber-300 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Payment pre-authorized — waiting for creator</p>
                  <p className="mt-1 text-sm text-white/65">
                    {campaign.payment_method === "upi"
                      ? "Your UPI payment is held securely. Full refund if the creator doesn't accept."
                      : "Your card is pre-authorized — no charge yet. You'll only be charged if the creator accepts."}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/40">Time left</p>
                <BookingTimer expiresAt={campaign.expires_at} />
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/55">
              The creator has been notified and must accept before the timer runs out.
              If they don&apos;t respond, your {campaign.payment_method === "upi" ? "payment will be refunded" : "pre-authorization will be released"} automatically.
            </div>
          </div>
        ) : null}

        {/* ── Payment Pending Banner (legacy flow) ──────────────────────────── */}
        {campaign.status === "payment_pending" ? (
          <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 text-yellow-300 shrink-0" />
              <div>
                <p className="font-semibold text-white">Creator accepted your booking!</p>
                <p className="mt-1 text-sm text-white/65">
                  Complete payment to lock funds in escrow and let the creator start work.
                  You won&apos;t be charged unless you pay here.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 space-y-1 text-sm">
              <div className="flex justify-between text-white/60">
                <span>{formatPackage(campaign.package_type)}</span>
                <span>{formatCurrency(campaign.price_offered)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Platform fee (12%)</span>
                <span>{formatCurrency(platformFee)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-1 font-medium text-white">
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
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Starting payment…</>
              ) : (
                `Pay ${formatCurrency(totalCharged)} and start`
              )}
            </Button>
          </div>
        ) : null}

        {/* ── Delivery Review Banner ─────────────────────────────────────────── */}
        {campaign.status === "delivery_submitted" ? (
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 text-blue-300 shrink-0" />
                <div>
                  <p className="font-semibold text-white">Content has been delivered!</p>
                  <p className="mt-1 text-sm text-white/65">
                    Review the content below, then approve to release payment.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60 shrink-0">
                <Timer className="h-3.5 w-3.5" />
                Auto-releases in {autoReleaseDays}d
              </div>
            </div>

            {!showDisputeForm ? (
              <div className="flex gap-3">
                <Button
                  onClick={() => approveDeliveryMutation.mutate({ campaignId: campaign.id })}
                  disabled={approveDeliveryMutation.isPending}
                  className="h-10 flex-1 rounded-full bg-white text-black hover:bg-white/90"
                >
                  {approveDeliveryMutation.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Releasing…</>
                  ) : (
                    `Approve & release ${formatCurrency(campaign.price_offered)}`
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDisputeForm(true)}
                  className="h-10 rounded-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Dispute
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Label className="text-white/80">Describe the issue</Label>
                <Textarea
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="What's wrong with the content? Be specific so we can resolve quickly."
                  rows={3}
                  className="resize-none"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={() => disputeMutation.mutate({ campaignId: campaign.id, reason: disputeReason })}
                    disabled={disputeMutation.isPending || disputeReason.length < 10}
                    className="h-10 flex-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                  >
                    {disputeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Dispute"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setShowDisputeForm(false); setDisputeReason(""); }}
                    className="h-10 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ── Completed Banner ──────────────────────────────────────────────── */}
        {campaign.status === "completed" ? (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-violet-300 shrink-0" />
            <div>
              <p className="font-semibold text-white">Campaign completed</p>
              <p className="text-sm text-white/60">
                {formatCurrency(campaign.price_offered)} released to the creator ·{" "}
                Platform fee: {formatCurrency(platformFee)}
              </p>
            </div>
          </div>
        ) : null}

        <Card className="overflow-hidden border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.03))] backdrop-blur-2xl">
          <CardContent className="space-y-8 p-0">
            <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(117,232,255,0.16),transparent_38%),radial-gradient(circle_at_top_right,rgba(255,130,203,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)] px-6 py-6 sm:px-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-white/55">
                <Sparkles className="h-3.5 w-3.5" />
                Campaign dossier
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                        {campaign.title || "Untitled Campaign"}
                      </h1>
                      <Badge
                        variant="outline"
                        className={`${statusColor(campaign.status)} rounded-full px-3 py-1 capitalize`}
                      >
                        {campaign.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
                      A clear snapshot of what was booked, who is attached to it, and where this campaign stands right now.
                    </p>
                  </div>
                  <StatusTimeline status={campaign.status} />
                </div>

                <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">Booked creator</p>
                  <div className="flex items-center gap-4">
                    {influencerProfile?.ig_profile_picture_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={influencerProfile.ig_profile_picture_url}
                        alt={influencerProfile.display_name || "Influencer"}
                        className="h-16 w-16 rounded-full object-cover ring-1 ring-white/12"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-white/80 ring-1 ring-white/12">
                        {influencerInitials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-white">
                        {influencerProfile?.display_name || "Influencer"}
                      </p>
                      <p className="truncate text-sm text-white/50">
                        {influencerProfile?.instagram_handle
                          ? `@${influencerProfile.instagram_handle}`
                          : influencerProfile?.ig_username
                            ? `@${influencerProfile.ig_username}`
                            : influencerProfile?.category || "Creator profile"}
                      </p>
                    </div>
                  </div>
                  {influencerProfile ? (
                    <Button variant="outline" asChild className="w-full rounded-full">
                      <Link href={`/dashboard/business/discover/${influencerProfile.id}`}>
                        View creator profile
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="grid gap-4 px-6 sm:grid-cols-2 xl:grid-cols-4 sm:px-7">
              <InfoTile
                label="Package"
                value={formatPackage(campaign.package_type)}
                helper="What was booked"
                icon={Package}
              />
              <InfoTile
                label="Creator fee"
                value={formatCurrency(campaign.price_offered)}
                helper="Goes to creator on completion"
                icon={IndianRupee}
              />
              <InfoTile
                label="Initiated"
                value={new Date(campaign.created_at).toLocaleDateString()}
                helper={timeAgo(campaign.created_at)}
                icon={Calendar}
              />
              <InfoTile
                label="Updated"
                value={new Date(campaign.updated_at || campaign.created_at).toLocaleDateString()}
                helper={timeAgo(campaign.updated_at || campaign.created_at)}
                icon={CheckCircle}
              />
            </section>

            <section className="grid gap-6 px-6 pb-8 lg:grid-cols-[1.15fr_0.85fr] sm:px-7">
              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <Sparkles className="h-4 w-4 text-white/70" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Campaign brief</h2>
                      <p className="text-sm text-white/50">The booking context captured for this creator.</p>
                    </div>
                  </div>
                  {campaign.brief ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="whitespace-pre-wrap text-sm leading-7 text-white/72">{campaign.brief}</p>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
                      No campaign brief was provided for this booking.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <User className="h-4 w-4 text-white/70" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Campaign identity</h2>
                      <p className="text-sm text-white/50">The key booking metadata at a glance.</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Campaign ID</p>
                      <p className="mt-2 break-all text-sm text-white/72">{campaign.id}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Current state</p>
                      <p className="mt-2 text-sm text-white/72 capitalize">{campaign.status.replace("_", " ")}</p>
                    </div>
                    {campaign.status === "in_escrow" ? (
                      <div className="rounded-2xl border border-green-500/20 bg-green-500/8 p-4 flex items-center gap-3">
                        <ShieldCheck className="h-4 w-4 text-green-400 shrink-0" />
                        <p className="text-sm text-green-300">
                          {formatCurrency(totalCharged)} locked in escrow
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <Button
                  variant="outline"
                  asChild
                  className="w-full rounded-full"
                >
                  <Link href={`/dashboard/business/inbox?chat=${campaign.id}`}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in inbox
                  </Link>
                </Button>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
