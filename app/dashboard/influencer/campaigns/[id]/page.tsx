"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useBusinessProfiles } from "@/hooks/queries/use-business-profiles";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle,
  Calendar,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Package,
  Phone,
  Send,
  Timer,
  X,
} from "lucide-react";
import { CampaignChat } from "@/components/campaign/campaign-chat";
import { useToast } from "@/hooks/use-toast";
import { statusColor } from "@/lib/format";
import { BookingTimer } from "@/components/booking-timer";
import {
  getBusinessDisplayName,
  getBusinessLocation,
} from "@/lib/business-profile";
import { BusinessAvatar } from "@/components/shared/business-avatar";

function daysRemaining(fromDate: string, totalDays: number): number {
  const deadline =
    new Date(fromDate).getTime() + totalDays * 24 * 60 * 60 * 1000;
  return Math.max(
    0,
    Math.ceil((deadline - Date.now()) / (24 * 60 * 60 * 1000)),
  );
}

function formatPackageLabel(value: string | null) {
  if (!value) return "Custom package";
  return value
    .split("+")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" + ");
}

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

  const { data: campaign, isLoading: campaignLoading } = useCampaign(id);
  const businessIds = campaign?.business_id ? [campaign.business_id] : [];
  const { data: businessMap } = useBusinessProfiles(businessIds);
  const businessIdentity =
    campaign?.business_id && businessMap
      ? (businessMap.get(campaign.business_id) ?? null)
      : null;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({
      queryKey: ["influencer-campaigns"],
    });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
    queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
    queryClient.invalidateQueries({
      queryKey: ["business-inbox-conversations"],
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
        toast({ title: "Booking declined" });
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

  if (campaignLoading) {
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
          <Link href="/dashboard/influencer">Back to Dashboard</Link>
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
  const actionable = ["pre_authorized", "requested", "pending"].includes(
    campaign.status,
  );

  // Show contact info once the deal is locked
  const showContactInfo = [
    "in_escrow",
    "delivery_submitted",
    "completed",
    "accepted",
  ].includes(campaign.status);

  // Show chat for all non-terminal states
  const terminalStatuses = new Set([
    "declined",
    "rejected",
    "expired",
    "cancelled",
  ]);
  const showChat = !terminalStatuses.has(campaign.status);

  return (
    <div className="container max-w-5xl py-6 space-y-6 animate-fade-in">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/influencer/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Campaigns
        </Link>
      </Button>

      <Card className="overflow-hidden border-white/10 bg-card/[0.48] shadow-[0_18px_48px_rgba(0,0,0,0.24)]">
        <CardContent className="p-0">
          <div className="border-b border-white/8 bg-white/[0.03] p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`${statusColor(campaign.status)} border text-xs font-medium`}
                  >
                    {campaign.status.replaceAll("_", " ")}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Received{" "}
                    {new Date(campaign.created_at).toLocaleDateString("en-IN")}
                  </span>
                </div>

                <div>
                  <CardTitle className="heading-premium text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {campaign.title || "Untitled Campaign"}
                  </CardTitle>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Review the brand, the brief, and the commercial terms before
                    you decide. Once accepted, you&apos;ll move directly into
                    the campaign conversation.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <Package className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Package</p>
                        <p className="mt-1 font-medium text-white">
                          {formatPackageLabel(campaign.package_type)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/coin.png"
                        alt="coin"
                        className="mt-0.5 h-5 w-5 object-contain"
                      />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Your earning
                        </p>
                        <p className="mt-1 font-medium text-white">
                          ₹
                          {campaign.price_offered?.toLocaleString("en-IN") ||
                            "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Timeline
                        </p>
                        <p className="mt-1 font-medium text-white">
                          {campaign.expires_at && actionable
                            ? "Review before expiry"
                            : "Shared with you to review"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {actionable && campaign.expires_at ? (
                <div className="rounded-[28px] border border-amber-500/25 bg-amber-500/10 p-5 text-right lg:min-w-[250px]">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-amber-100/70">
                    Time Left
                  </p>
                  <BookingTimer
                    expiresAt={campaign.expires_at}
                    onExpire={invalidate}
                    className="mt-3 block text-4xl font-semibold tracking-[0.16em] text-amber-50"
                  />
                  <p className="mt-3 text-xs leading-5 text-amber-100/70">
                    This offer stays available only while the response window is
                    open.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                <div className="flex items-start gap-4">
                  <BusinessAvatar
                    business={businessIdentity}
                    name={businessName}
                    className="h-14 w-14"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                      Brand
                    </p>
                    <h2 className="font-display mt-2 text-[1.55rem] font-medium text-white">
                      {businessName}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {businessIdentity?.businessProfile?.brand_type ? (
                        <span className="inline-flex items-center gap-1.5">
                          <BriefcaseBusiness className="h-4 w-4" />
                          {businessIdentity.businessProfile.brand_type}
                        </span>
                      ) : null}
                      {businessLocation ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {businessLocation}
                        </span>
                      ) : null}
                    </div>
                    {businessSummary ? (
                      <p className="mt-3 text-sm leading-6 text-white/68">
                        {businessSummary}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        The brand has shared this campaign with you for review.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {actionable ? (
                <section className="rounded-[28px] border border-emerald-500/20 bg-emerald-500/[0.05] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-display text-[1.28rem] font-medium text-white">
                        Ready to take this campaign?
                      </p>
                      <p className="mt-1 max-w-xl text-sm leading-6 text-white/65">
                        Accept to lock the offer and continue the collaboration
                        in chat. Decline if the scope or timing doesn&apos;t
                        fit.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        onClick={() =>
                          acceptMutation.mutate({ campaignId: id })
                        }
                        disabled={
                          acceptMutation.isPending || declineMutation.isPending
                        }
                        className="h-12 min-w-[190px] rounded-full bg-white text-black hover:bg-white/90"
                      >
                        {acceptMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Accepting…
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept Campaign
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          declineMutation.mutate({ campaignId: id })
                        }
                        disabled={
                          acceptMutation.isPending || declineMutation.isPending
                        }
                        className="h-12 min-w-[150px] rounded-full border-white/12 bg-transparent text-white hover:bg-white/[0.05]"
                      >
                        {declineMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            Decline
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </section>
              ) : null}

              {campaign.status === "payment_pending" ? (
                <section className="rounded-[28px] border border-yellow-500/25 bg-yellow-500/[0.06] p-5">
                  <div className="flex items-start gap-3">
                    <Timer className="mt-0.5 h-5 w-5 shrink-0 text-yellow-300" />
                    <div>
                      <p className="font-semibold text-white">
                        Waiting for brand payment
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/68">
                        You&apos;ve accepted the campaign. The brand needs to
                        complete payment before work officially begins.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {campaign.status === "in_escrow" ? (
                <section className="rounded-[28px] border border-green-500/25 bg-green-500/[0.06] p-5">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-5 w-5 shrink-0 text-green-300" />
                    <div>
                      <p className="font-semibold text-white">
                        Funds are locked in escrow
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/68">
                        Create the content, publish it, and then submit the
                        final link below to trigger review and payout.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {campaign.status === "delivery_submitted" ? (
                <section className="rounded-[28px] border border-blue-500/25 bg-blue-500/[0.06] p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-blue-300" />
                    <div>
                      <p className="font-semibold text-white">
                        Delivery submitted
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/68">
                        The brand is reviewing your submission. Payment
                        auto-releases in {autoReleaseDays} day
                        {autoReleaseDays !== 1 ? "s" : ""} if no action is
                        taken.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              {campaign.status === "completed" ? (
                <section className="rounded-[28px] border border-violet-500/25 bg-violet-500/[0.06] p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
                    <div>
                      <p className="font-semibold text-white">
                        Campaign completed
                      </p>
                      <p className="mt-1 text-sm leading-6 text-white/68">
                        ₹{(campaign.price_offered ?? 0).toLocaleString("en-IN")}{" "}
                        has been released to your payout account.
                      </p>
                    </div>
                  </div>
                </section>
              ) : null}

              <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-white">Campaign Brief</h3>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-white/70">
                  {campaign.brief?.trim() ||
                    "The brand hasn't added a detailed brief yet."}
                </p>
              </section>

              <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                <h3 className="font-semibold text-white">Offer Summary</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs text-muted-foreground">
                      Campaign type
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {formatPackageLabel(campaign.package_type)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs text-muted-foreground">
                      Offered payout
                    </p>
                    <p className="mt-1 text-sm font-medium text-white">
                      ₹{campaign.price_offered?.toLocaleString("en-IN") || "—"}
                    </p>
                  </div>
                </div>
              </section>

              {showContactInfo ? (
                <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                  <h3 className="font-semibold text-white">Business Contact</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {campaign.business_contact_email ? (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-start gap-3">
                          <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Email
                            </p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {campaign.business_contact_email}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                    {campaign.business_contact_phone ? (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                        <div className="flex items-start gap-3">
                          <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Phone
                            </p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {campaign.business_contact_phone}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {campaign.status === "in_escrow" ? (
                <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                  <h3 className="font-semibold text-white">Submit Delivery</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Share the final Instagram URL once the content is live so
                    the brand can review it.
                  </p>
                  <div className="mt-4 space-y-3">
                    {!showDeliveryForm ? (
                      <Button
                        className="h-12 rounded-full px-5"
                        onClick={() => setShowDeliveryForm(true)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Submit delivery
                      </Button>
                    ) : (
                      <form
                        onSubmit={handleSubmitDelivery}
                        className="space-y-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="content-url"
                            className="text-sm font-medium text-white"
                          >
                            Instagram post URL{" "}
                            <span className="text-red-400">*</span>
                          </Label>
                          <div className="relative">
                            <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              id="content-url"
                              type="url"
                              value={contentUrl}
                              onChange={(e) => setContentUrl(e.target.value)}
                              placeholder="https://www.instagram.com/p/..."
                              className="pl-10"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="delivery-notes"
                            className="text-sm font-medium text-muted-foreground"
                          >
                            Notes to brand
                          </Label>
                          <Textarea
                            id="delivery-notes"
                            value={deliveryNotes}
                            onChange={(e) => setDeliveryNotes(e.target.value)}
                            placeholder="Anything the brand should know about the content..."
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button
                            type="submit"
                            className="h-11 flex-1 rounded-full"
                            disabled={
                              deliveryMutation.isPending || !contentUrl.trim()
                            }
                          >
                            {deliveryMutation.isPending ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-11 rounded-full"
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
                </section>
              ) : null}
            </div>

            <div className="space-y-6">
              <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                <h3 className="font-semibold text-white">Decision Snapshot</h3>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs text-muted-foreground">Brand</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {businessName}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs text-muted-foreground">Offer value</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      ₹{campaign.price_offered?.toLocaleString("en-IN") || "—"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs text-muted-foreground">Format</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {formatPackageLabel(campaign.package_type)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="mt-1 text-sm font-medium capitalize text-white">
                      {campaign.status.replaceAll("_", " ")}
                    </p>
                  </div>
                </div>
              </section>

              {!actionable && showChat ? (
                <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5">
                  <h3 className="font-semibold text-white">Next Step</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Continue the collaboration in chat for updates, files, and
                    delivery coordination.
                  </p>
                  <Button className="mt-4 h-11 rounded-full" asChild>
                    <Link
                      href={`/dashboard/influencer/inbox?chat=${campaign.id}`}
                    >
                      Open conversation
                    </Link>
                  </Button>
                </section>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {showChat ? (
        <CampaignChat
          campaignId={campaign.id}
          businessId={campaign.business_id}
          influencerId={campaign.influencer_id}
          businessName={businessName}
          influencerName={myProfile?.full_name || "Influencer"}
          disabled={campaign.status === "completed"}
        />
      ) : null}
    </div>
  );
}
