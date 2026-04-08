"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { m } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  CircleDot,
  ExternalLink,
  Loader2,
  Lock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  ShieldCheck,
  Timer,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useBusinessProfiles } from "@/hooks/queries/use-business-profiles";
import { useTRPC } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BusinessAvatar } from "@/components/shared/business-avatar";
import FlipClock from "@/components/ui/flip-clock";
import { formatCurrency, formatPackage, timeAgo } from "@/lib/format";
import {
  getBusinessDisplayName,
  getBusinessLocation,
} from "@/lib/business-profile";
import { fadeUp, stagger } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"] & {
  delivery_url?: string | null;
};

// ── Step definitions ──────────────────────────────────────────────────────
const STATUS_STEPS = [
  { key: "pre_authorized", label: "Offered" },
  { key: "in_escrow", label: "In Progress" },
  { key: "delivery_submitted", label: "Delivered" },
  { key: "completed", label: "Done" },
];

const LEGACY_STEPS = [
  { key: "requested", label: "Offered" },
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
function daysRemaining(from: string, totalDays: number): number {
  const deadline = new Date(from).getTime() + totalDays * 86_400_000;
  return Math.max(0, Math.ceil((deadline - Date.now()) / 86_400_000));
}

// ── Status timeline ───────────────────────────────────────────────────────
function StatusTimeline({ status }: { status: string }) {
  if (TERMINAL_STATUSES.has(status)) {
    const labels: Record<string, string> = {
      declined: "You declined this offer",
      rejected: "Offer declined",
      expired: "Offer window expired",
      cancelled: "Booking cancelled",
      refunded: "Refunded",
    };
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3">
        <CircleDot className="h-4 w-4 shrink-0 text-rose-300/70" />
        <div>
          <p className="text-sm font-medium capitalize text-white">
            {status.replaceAll("_", " ")}
          </p>
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
  const reachedTone = status === "completed" ? "success" : "active";

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
                  "flex h-7 w-7 items-center justify-center rounded-full border transition-colors sm:h-8 sm:w-8",
                  reached
                    ? reachedTone === "success"
                      ? "border-green-300/30 bg-green-300/15"
                      : "border-yellow-300/30 bg-yellow-300/15"
                    : "border-white/10 bg-white/[0.04]",
                )}
              >
                <CircleDot
                  className={cn(
                    "h-3 w-3 sm:h-3.5 sm:w-3.5",
                    current
                      ? reachedTone === "success"
                        ? "text-green-200"
                        : "text-yellow-200"
                      : reached
                        ? reachedTone === "success"
                          ? "text-green-200/60"
                          : "text-yellow-200/60"
                        : "text-white/30",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium uppercase tracking-[0.14em] sm:text-[10px]",
                  reached ? "text-white/80" : "text-white/35",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-4 h-px w-6 sm:w-14",
                  index < currentIndex
                    ? reachedTone === "success"
                      ? "bg-green-300/45"
                      : "bg-yellow-300/45"
                    : "bg-white/10",
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
export default function InfluencerCampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { profile: myProfile } = useAuth();
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [contentUrl, setContentUrl] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  const { data: rawCampaign, isLoading } = useCampaign(id);
  const campaign = rawCampaign as Campaign | undefined;

  const businessIds = campaign?.business_id ? [campaign.business_id] : [];
  const { data: businessMap, isLoading: profilesLoading } =
    useBusinessProfiles(businessIds);
  const businessIdentity =
    campaign?.business_id && businessMap
      ? (businessMap.get(campaign.business_id) ?? null)
      : null;

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.campaign.getCampaigns.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.campaign.getCampaign.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.inbox.getInboxConversations.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.inbox.getBusinessInboxConversations.queryKey(),
    });
  };

  const acceptMutation = useMutation(
    trpc.campaign.acceptBooking.mutationOptions({
      onSuccess: () => {
        invalidate();
        toast({
          title: "Booking accepted!",
          description: "Taking you to the conversation with the brand.",
        });
        router.push(`/dashboard/influencer/inbox?chat=${id}`);
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const declineMutation = useMutation(
    trpc.campaign.declineBooking.mutationOptions({
      onSuccess: () => {
        invalidate();
        toast({ title: "Offer declined" });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const deliveryMutation = useMutation(
    trpc.campaign.submitDelivery.mutationOptions({
      onSuccess: () => {
        invalidate();
        setShowDeliveryForm(false);
        setContentUrl("");
        setDeliveryNotes("");
        toast({
          title: "Delivery submitted!",
          description: "The brand has 7 days to review before auto-release.",
        });
      },
      onError: (err) => {
        toast({
          title: "Submission failed",
          description: err.message,
          variant: "destructive",
        });
      },
    }),
  );

  const handleSubmitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentUrl.trim()) return;
    deliveryMutation.mutate({
      campaignId: id,
      contentUrl: contentUrl.trim(),
      notes: deliveryNotes.trim() || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-5xl space-y-5 py-6">
        <div className="h-9 w-36 animate-pulse rounded-full bg-white/[0.06]" />
        <div className="h-28 w-full animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
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
          <Link href="/dashboard/influencer/campaigns">Back to campaigns</Link>
        </Button>
      </div>
    );
  }

  const autoReleaseDays = campaign.delivery_submitted_at
    ? daysRemaining(campaign.delivery_submitted_at, 7)
    : 7;

  const businessName = getBusinessDisplayName(businessIdentity);
  const businessLocation = getBusinessLocation(businessIdentity);
  const businessSummary =
    businessIdentity?.businessProfile?.brand_summary?.trim() ||
    businessIdentity?.businessProfile?.tagline?.trim() ||
    null;

  const isOffer = ["pre_authorized", "requested", "pending"].includes(
    campaign.status,
  );
  const showContactInfo = [
    "in_escrow",
    "accepted",
    "delivery_submitted",
    "completed",
  ].includes(campaign.status);
  const igUsername =
    businessIdentity?.businessProfile?.ig_username?.trim() || null;

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="container max-w-5xl space-y-5 py-6"
    >
      {/* ── Back + title ──────────────────────────────────────────────── */}
      <m.div variants={fadeUp} className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="h-10 w-10 shrink-0 rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
        >
          <Link href="/dashboard/influencer/campaigns">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="min-w-0 flex-1 truncate font-display text-3xl text-white sm:text-3xl">
          {campaign.title || "Untitled Campaign"}
        </h1>
      </m.div>

      {/* ── Contextual action banners ─────────────────────────────────── */}

      {isOffer && (
        <m.div
          variants={fadeUp}
          className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] p-4 sm:p-5 space-y-4"
        >
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
                  onExpire={invalidate}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button
              onClick={() => acceptMutation.mutate({ campaignId: id })}
              disabled={acceptMutation.isPending || declineMutation.isPending}
              className="h-10 w-full rounded-full bg-white text-black hover:bg-white/90 text-sm sm:flex-1"
            >
              {acceptMutation.isPending ? (
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
              onClick={() => declineMutation.mutate({ campaignId: id })}
              disabled={acceptMutation.isPending || declineMutation.isPending}
              className="h-10 w-full rounded-full border-white/15 text-white/70 hover:bg-white/[0.05] text-sm sm:w-auto sm:px-5"
            >
              {declineMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Decline
                </>
              )}
            </Button>
          </div>
        </m.div>
      )}

      {campaign.status === "payment_pending" && (
        <m.div
          variants={fadeUp}
          className="rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.08] p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <Timer className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
            <div>
              <p className="text-sm font-semibold text-white">
                Waiting for brand payment
              </p>
              <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
                You&apos;ve accepted the campaign. The brand needs to complete
                payment before work officially begins.
              </p>
            </div>
          </div>
        </m.div>
      )}

      {campaign.status === "in_escrow" && (
        <m.div
          variants={fadeUp}
          className="rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.08] p-4 sm:p-5"
        >
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
            <div>
              <p className="text-sm font-semibold text-white">
                Funds locked in escrow — time to create
              </p>
              <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
                Create the content, publish it, then submit the final link below
                to trigger review and payout.
              </p>
            </div>
          </div>
        </m.div>
      )}

      {campaign.status === "delivery_submitted" && (
        <m.div
          variants={fadeUp}
          className="rounded-2xl border border-yellow-500/25 bg-yellow-500/[0.08] p-4 sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-300/80" />
              <div>
                <p className="text-sm font-semibold text-white">
                  Delivery submitted — waiting for brand review
                </p>
                <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">
                  Payment auto-releases if no action is taken within the review
                  window.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/50 sm:text-xs sm:self-auto">
              <Timer className="h-3 w-3" />
              {autoReleaseDays}d auto-release
            </div>
          </div>
        </m.div>
      )}

      {campaign.status === "completed" && (
        <m.div
          variants={fadeUp}
          className="flex flex-col gap-3 rounded-2xl border border-green-500/20 bg-green-500/[0.07] px-4 py-3 sm:flex-row sm:items-center"
        >
          <CheckCircle className="h-4 w-4 shrink-0 text-green-300/80" />
          <div>
            <p className="text-sm font-semibold text-white">
              Campaign completed
            </p>
            <p className="text-xs text-white/50">
              {formatCurrency(campaign.price_offered)} released to your payout
              account
            </p>
          </div>
        </m.div>
      )}

      {/* ── Main two-column layout ────────────────────────────────────── */}
      <m.div variants={fadeUp} className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* ── Left: Timeline + Brand + Brief + Delivery ───────────────── */}
        <div className="space-y-4">
          {/* Progress */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 sm:px-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
              Progress
            </p>
            <StatusTimeline status={campaign.status} />
          </div>

          {/* Brand card */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
              Brand
            </p>
            {profilesLoading && !businessIdentity ? (
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 animate-pulse rounded-2xl bg-white/[0.06]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded-full bg-white/[0.06]" />
                  <div className="h-3 w-20 animate-pulse rounded-full bg-white/[0.04]" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <BusinessAvatar
                    business={businessIdentity}
                    name={businessName}
                    className="h-12 w-12 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-base font-medium text-white">
                      {businessName}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                      {businessIdentity?.businessProfile?.brand_type && (
                        <span className="text-xs text-white/45">
                          {businessIdentity.businessProfile.brand_type}
                        </span>
                      )}
                      {businessLocation && (
                        <span className="inline-flex items-center gap-1 text-xs text-white/40">
                          <MapPin className="h-3 w-3" />
                          {businessLocation}
                        </span>
                      )}
                      {igUsername && (
                        <span className="text-xs text-white/40">
                          @{igUsername}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {businessSummary && (
                  <p className="mt-3 text-[12.5px] leading-[1.7] text-white/60 sm:text-[13px]">
                    {businessSummary}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Campaign brief */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 sm:px-5">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
              Campaign brief
            </p>
            {campaign.brief ? (
              <p className="whitespace-pre-wrap text-[12.5px] leading-[1.75] text-white/70 sm:text-[13px]">
                {campaign.brief}
              </p>
            ) : (
              <p className="text-[12.5px] italic text-white/35 sm:text-[13px]">
                No brief provided.
              </p>
            )}
          </div>

          {/* Delivered content link */}
          {campaign.delivery_url && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-5 py-4">
              <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/35">
                Delivered content
              </p>
              <a
                href={campaign.delivery_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-emerald-300 transition-colors hover:text-emerald-200"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View delivery
              </a>
            </div>
          )}

          {/* Submit delivery form */}
          {campaign.status === "in_escrow" && (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 sm:px-5">
              <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-white/35">
                Submit delivery
              </p>
              <p className="mb-4 text-[12.5px] text-white/50 sm:text-[13px]">
                Share the final Instagram URL once the content is live so the
                brand can review and release payment.
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
                  className="space-y-4 rounded-[20px] border border-white/8 bg-white/[0.03] p-4"
                >
                  <div className="space-y-2">
                    <Label
                      htmlFor="content-url"
                      className="text-sm font-medium text-white"
                    >
                      Instagram post URL{" "}
                      <span className="text-rose-400">*</span>
                    </Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                      <Input
                        id="content-url"
                        type="url"
                        value={contentUrl}
                        onChange={(e) => setContentUrl(e.target.value)}
                        placeholder="https://www.instagram.com/p/..."
                        className="pl-10 h-10 rounded-full border-white/10 bg-white/5 text-white"
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
                      className="resize-none text-sm border-white/10 bg-white/5"
                    />
                  </div>
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <Button
                      type="submit"
                      className="h-10 flex-1 rounded-full text-sm"
                      disabled={
                        deliveryMutation.isPending || !contentUrl.trim()
                      }
                    >
                      {deliveryMutation.isPending ? (
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
                      onClick={() => {
                        setShowDeliveryForm(false);
                        setContentUrl("");
                        setDeliveryNotes("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Earnings + Details + Inbox ───────────────────────── */}
        <div className="space-y-3">
          {/* Earnings */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
              Your Earnings
            </p>
            <p className="text-[30px] font-bold leading-none tracking-[-0.04em] text-white">
              {formatCurrency(campaign.price_offered)}
            </p>
            <p className="mt-1.5 text-xs text-white/40">
              Released on brand approval or 7-day auto-release
            </p>
          </div>

          {/* Details */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
              Details
            </p>
            <div className="space-y-2 text-[13px]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-white/50">Package</span>
                <span className="text-white text-right">
                  {formatPackage(campaign.package_type)}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-white/50">Received</span>
                <span className="text-white text-right">
                  {new Date(campaign.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {campaign.updated_at && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-white/50">Updated</span>
                  <span className="text-white text-right">
                    {timeAgo(campaign.updated_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Contact info — revealed once deal is locked */}
          {showContactInfo &&
            (campaign.business_contact_email ||
              campaign.business_contact_phone) && (
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Brand contact
                </p>
                <div className="space-y-2.5">
                  {campaign.business_contact_email && (
                    <div className="flex items-start gap-2.5">
                      <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/35" />
                      <p className="break-all text-[13px] text-white/75">
                        {campaign.business_contact_email}
                      </p>
                    </div>
                  )}
                  {campaign.business_contact_phone && (
                    <div className="flex items-center gap-2.5">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-white/35" />
                      <p className="text-[13px] text-white/75">
                        {campaign.business_contact_phone}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Inbox link */}
          <Button
            variant="outline"
            asChild
            className="h-10 w-full rounded-full border-white/12 text-sm hover:bg-white/8"
          >
            <Link href={`/dashboard/influencer/inbox?chat=${campaign.id}`}>
              <MessageSquare className="mr-2 h-3.5 w-3.5" />
              Open in inbox
            </Link>
          </Button>
        </div>
      </m.div>
    </m.div>
  );
}
