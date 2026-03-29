"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  CircleDot,
  IndianRupee,
  Loader2,
  Package,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useCampaign } from "@/hooks/queries/use-campaigns";
import { useInfluencerProfile } from "@/hooks/queries/use-influencer-profiles";
import { useTRPC } from "@/lib/trpc/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { statusColor, timeAgo } from "@/lib/format";

const STATUS_STEPS = [
  { key: "pending", label: "Requested" },
  { key: "accepted", label: "Active" },
  { key: "completed", label: "Completed" },
];

function formatCurrency(value: number | null) {
  if (!value) return "—";
  return `₹${value.toLocaleString()}`;
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

function StatusTimeline({ status }: { status: string }) {
  const isRejected = status === "rejected";
  const currentIndex = isRejected
    ? -1
    : STATUS_STEPS.findIndex((step) => step.key === status);

  if (isRejected) {
    return (
      <div className="rounded-2xl border border-rose-300/20 bg-rose-300/8 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-300/15">
            <CircleDot className="h-4 w-4 text-rose-200" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Rejected</p>
            <p className="text-sm text-white/55">
              This campaign request did not move forward.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {STATUS_STEPS.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                  reached
                    ? "border-emerald-300/30 bg-emerald-300/15"
                    : "border-white/10 bg-white/[0.04]"
                }`}
              >
                <CircleDot
                  className={`h-4 w-4 ${
                    current
                      ? "text-emerald-200"
                      : reached
                        ? "text-emerald-200/70"
                        : "text-white/35"
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
            {index < STATUS_STEPS.length - 1 ? (
              <div
                className={`mx-2 mt-[-18px] h-px w-10 sm:w-16 ${
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
      <p className="mt-4 text-[11px] uppercase tracking-[0.22em] text-white/40">
        {label}
      </p>
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

  const { data: campaign, isLoading } = useCampaign(id, user?.id);
  const { data: influencerProfile } = useInfluencerProfile(
    campaign?.influencer_profile_id ?? undefined,
  );

  const completeMutation = useMutation(
    trpc.campaign.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["campaign"] });
        toast({ title: "Campaign marked as completed" });
      },
      onError: (error) => {
        toast({
          title: "Could not update campaign",
          description: error.message,
          variant: "destructive",
        });
      },
    }),
  );

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

  const canMarkCompleted = campaign.status === "accepted";
  const influencerInitials = getInfluencerInitials(
    influencerProfile?.display_name ?? null,
  );

  return (
    <div className="container max-w-5xl space-y-6 py-6">
      <Button variant="ghost" asChild>
        <Link href="/dashboard/business/campaigns">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to campaigns
        </Link>
      </Button>

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
                      {campaign.status}
                    </Badge>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-white/55 sm:text-base">
                    A clear snapshot of what was booked, who is attached to it,
                    and where this campaign stands right now.
                  </p>
                </div>

                <StatusTimeline status={campaign.status} />
              </div>

              <div className="space-y-4 rounded-[28px] border border-white/10 bg-black/20 p-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/42">
                  Booked creator
                </p>
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
                  <Button
                    variant="outline"
                    asChild
                    className="w-full rounded-full"
                  >
                    <Link
                      href={`/dashboard/business/discover/${influencerProfile.id}`}
                    >
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
              label="Spend"
              value={formatCurrency(campaign.price_offered)}
              helper="Booked campaign value"
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
              value={new Date(
                campaign.updated_at || campaign.created_at,
              ).toLocaleDateString()}
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
                    <h2 className="text-lg font-semibold text-white">
                      Campaign brief
                    </h2>
                    <p className="text-sm text-white/50">
                      The booking context captured for this creator.
                    </p>
                  </div>
                </div>

                {campaign.brief ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-white/72">
                      {campaign.brief}
                    </p>
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
                    <h2 className="text-lg font-semibold text-white">
                      Campaign identity
                    </h2>
                    <p className="text-sm text-white/50">
                      The key booking metadata at a glance.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Campaign ID
                    </p>
                    <p className="mt-2 break-all text-sm text-white/72">
                      {campaign.id}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                      Current state
                    </p>
                    <p className="mt-2 text-sm text-white/72 capitalize">
                      {campaign.status}
                    </p>
                  </div>
                </div>
              </div>

              {canMarkCompleted ? (
                <Button
                  className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90"
                  onClick={() =>
                    completeMutation.mutate({
                      campaignId: campaign.id,
                      status: "completed",
                    })
                  }
                  disabled={completeMutation.isPending}
                >
                  {completeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating campaign
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Mark as completed
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
