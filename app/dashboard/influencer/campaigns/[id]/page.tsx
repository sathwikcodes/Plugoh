"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useProfile } from "@/hooks/queries/use-profile";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CheckCircle,
  Calendar,
  ExternalLink,
  FileText,
  Loader2,
  Lock,
  Mail,
  Package,
  Phone,
  Send,
  Timer,
  X,
} from "lucide-react";
import { CampaignChat } from "@/components/campaign/campaign-chat";
import { useToast } from "@/hooks/use-toast";
import { statusColor } from "@/lib/format";

function daysRemaining(fromDate: string, totalDays: number): number {
  const deadline = new Date(fromDate).getTime() + totalDays * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((deadline - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function InfluencerCampaignDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { user, profile: myProfile } = useAuth();
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [contentUrl, setContentUrl] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  const { data: campaign, isLoading: campaignLoading } = useCampaign(id);
  const { data: businessProfile } = useProfile(campaign?.business_id);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    queryClient.invalidateQueries({ queryKey: ["campaign"] });
    queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
    queryClient.invalidateQueries({ queryKey: ["business-inbox-conversations"] });
  };

  const acceptMutation = useMutation(
    trpc.campaign.acceptBooking.mutationOptions({
      onSuccess: () => {
        invalidate();
        toast({ title: "Booking accepted!", description: "The brand has been notified to complete payment." });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
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
        toast({ title: "Error", description: err.message, variant: "destructive" });
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
        toast({ title: "Delivery submitted!", description: "The brand has 7 days to review before auto-release." });
      },
      onError: (err) => {
        toast({ title: "Submission failed", description: err.message, variant: "destructive" });
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

  // Show contact info once the deal is locked
  const showContactInfo = ["in_escrow", "delivery_submitted", "completed", "accepted"].includes(campaign.status);

  // Show chat for all non-terminal states
  const terminalStatuses = new Set(["declined", "rejected", "expired", "cancelled"]);
  const showChat = !terminalStatuses.has(campaign.status);

  return (
    <div className="container max-w-3xl py-6 space-y-6 animate-fade-in">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/influencer">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Link>
      </Button>

      {/* ── Status banners ────────────────────────────────────────────────── */}

      {campaign.status === "payment_pending" ? (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 flex items-start gap-3">
          <Timer className="mt-0.5 h-5 w-5 text-yellow-300 shrink-0" />
          <div>
            <p className="font-semibold text-white">Waiting for brand payment</p>
            <p className="mt-1 text-sm text-white/65">
              The brand has been notified to complete payment. You&apos;ll get a notification once funds are secured.
            </p>
          </div>
        </div>
      ) : null}

      {campaign.status === "in_escrow" ? (
        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-4 flex items-start gap-3">
          <Lock className="mt-0.5 h-5 w-5 text-green-300 shrink-0" />
          <div>
            <p className="font-semibold text-white">
              ₹{(campaign.price_offered ?? 0).toLocaleString("en-IN")} locked in escrow for you
            </p>
            <p className="mt-1 text-sm text-white/65">
              Create the content, post it, then submit the link below to release your payment.
            </p>
          </div>
        </div>
      ) : null}

      {campaign.status === "delivery_submitted" ? (
        <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-0.5 h-5 w-5 text-blue-300 shrink-0" />
            <div>
              <p className="font-semibold text-white">Delivery submitted — awaiting brand approval</p>
              <p className="mt-1 text-sm text-white/65">
                Payment auto-releases in {autoReleaseDays} day{autoReleaseDays !== 1 ? "s" : ""} if the brand doesn&apos;t respond.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {campaign.status === "completed" ? (
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-violet-300 shrink-0" />
          <div>
            <p className="font-semibold text-white">Campaign completed</p>
            <p className="text-sm text-white/65">
              ₹{(campaign.price_offered ?? 0).toLocaleString("en-IN")} has been sent to your payout account.
            </p>
          </div>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-xl sm:text-2xl">
              {campaign.title || "Untitled Campaign"}
            </CardTitle>
            <Badge
              variant="outline"
              className={`${statusColor(campaign.status)} text-sm`}
            >
              {campaign.status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Package</p>
                <p className="font-medium capitalize">{campaign.package_type || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <img src="/coin.png" alt="coin" className="h-5 w-5 object-contain mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Your earning</p>
                <p className="font-medium">
                  ₹{campaign.price_offered?.toLocaleString("en-IN") || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Received</p>
                <p className="font-medium">{new Date(campaign.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {campaign.brief ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Campaign Brief</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-lg p-4">
                {campaign.brief}
              </p>
            </div>
          ) : null}

          {/* Business contact — shown once deal is active */}
          {showContactInfo ? (
            <div>
              <h3 className="font-semibold mb-3">Business Contact</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {campaign.business_contact_email ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium">{campaign.business_contact_email}</p>
                    </div>
                  </div>
                ) : null}
                {campaign.business_contact_phone ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm font-medium">{campaign.business_contact_phone}</p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Accept / Decline — for new booking requests */}
          {(campaign.status === "requested" || campaign.status === "pending") ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1 h-12"
                onClick={() => acceptMutation.mutate({ campaignId: id })}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Accept Booking
              </Button>
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => declineMutation.mutate({ campaignId: id })}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                {declineMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <X className="mr-2 h-4 w-4" />
                )}
                Decline
              </Button>
            </div>
          ) : null}

          {/* Submit Delivery — shown when work is in progress */}
          {campaign.status === "in_escrow" ? (
            <div className="space-y-3">
              {!showDeliveryForm ? (
                <Button
                  className="w-full h-12"
                  onClick={() => setShowDeliveryForm(true)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Delivery
                </Button>
              ) : (
                <form onSubmit={handleSubmitDelivery} className="space-y-4 rounded-2xl border border-white/10 bg-muted/20 p-4">
                  <div className="space-y-2">
                    <Label htmlFor="content-url" className="text-sm font-medium">
                      Instagram post URL <span className="text-red-400">*</span>
                    </Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                    <Label htmlFor="delivery-notes" className="text-sm font-medium text-muted-foreground">
                      Notes to brand (optional)
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
                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      className="flex-1 h-10"
                      disabled={deliveryMutation.isPending || !contentUrl.trim()}
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
                      onClick={() => { setShowDeliveryForm(false); setContentUrl(""); setDeliveryNotes(""); }}
                      className="h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {showChat ? (
        <CampaignChat
          campaignId={campaign.id}
          businessId={campaign.business_id}
          influencerId={campaign.influencer_id}
          businessName={
            businessProfile?.business_name ||
            businessProfile?.full_name ||
            "Business"
          }
          influencerName={myProfile?.full_name || "Influencer"}
          disabled={campaign.status === "completed"}
        />
      ) : null}
    </div>
  );
}
