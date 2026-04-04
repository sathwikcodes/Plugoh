"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Inbox,
  MapPin,
  TimerReset,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { useInfluencerCampaigns } from "@/hooks/queries/use-influencer-campaigns";
import {
  getBusinessDisplayName,
  getBusinessLocation,
} from "@/lib/business-profile";
import { Button } from "@/components/ui/button";
import { BookingTimer } from "@/components/booking-timer";
import { BusinessAvatar } from "@/components/shared/business-avatar";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";
import {
  FILTER_PILL_STYLE,
  FILTER_PILL_TRANSITION,
  fadeUp,
  stagger,
} from "@/lib/animations";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";

const FILTERS = ["all", "offers", "active", "completed", "closed"] as const;
type Filter = (typeof FILTERS)[number];

const FILTER_LABELS: Record<Filter, string> = {
  all: "All",
  offers: "Offers",
  active: "Active",
  completed: "Completed",
  closed: "Closed",
};

const OFFER_STATUSES = ["pre_authorized", "requested", "pending"] as const;
const ACTIVE_STATUSES = [
  "payment_pending",
  "in_escrow",
  "accepted",
  "delivery_submitted",
] as const;
const CLOSED_STATUSES = [
  "declined",
  "rejected",
  "expired",
  "cancelled",
  "refunded",
] as const;

function getStatusConfig(status: string) {
  return (
    CAMPAIGN_STATUS_CONFIG[status as CampaignStatus] ??
    CAMPAIGN_STATUS_CONFIG.rejected
  );
}

function isOfferStatus(status: string) {
  return OFFER_STATUSES.includes(status as (typeof OFFER_STATUSES)[number]);
}

function isActiveStatus(status: string) {
  return ACTIVE_STATUSES.includes(status as (typeof ACTIVE_STATUSES)[number]);
}

function isClosedStatus(status: string) {
  return CLOSED_STATUSES.includes(status as (typeof CLOSED_STATUSES)[number]);
}

function formatPackageLabel(value: string | null) {
  if (!value) return "Custom package";
  return value
    .split("+")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" + ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function OfferCountdown({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) return null;

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-right">
      <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-amber-200/70">
        Time Left
      </p>
      <BookingTimer
        expiresAt={expiresAt}
        className="mt-1 block text-2xl font-semibold tracking-[0.14em] text-amber-100"
      />
    </div>
  );
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const { data: campaignRecords = [], isLoading } = useInfluencerCampaigns(
    user?.id,
  );
  const [filter, setFilter] = useState<Filter>("all");
  const notifCleared = useRef(false);

  useEffect(() => {
    if (!user?.id || notifCleared.current) return;
    notifCleared.current = true;
    supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("type", "new_booking")
      .eq("read", false)
      .then(() => {});
  }, [user?.id]);

  const counts = useMemo(() => {
    const next = {
      all: campaignRecords.length,
      offers: 0,
      active: 0,
      completed: 0,
      closed: 0,
      offerValue: 0,
    };

    for (const { campaign } of campaignRecords) {
      if (isOfferStatus(campaign.status)) {
        next.offers += 1;
        next.offerValue += campaign.price_offered ?? 0;
      } else if (isActiveStatus(campaign.status)) {
        next.active += 1;
      } else if (campaign.status === "completed") {
        next.completed += 1;
      } else if (isClosedStatus(campaign.status)) {
        next.closed += 1;
      }
    }

    return next;
  }, [campaignRecords]);

  const filtered = useMemo(() => {
    return campaignRecords.filter(({ campaign }) => {
      if (filter === "all") return true;
      if (filter === "offers") return isOfferStatus(campaign.status);
      if (filter === "active") return isActiveStatus(campaign.status);
      if (filter === "completed") return campaign.status === "completed";
      return isClosedStatus(campaign.status);
    });
  }, [campaignRecords, filter]);

  const stats = [
    {
      label: "Offers To Review",
      value: counts.offers,
      sub:
        counts.offerValue > 0
          ? `₹${counts.offerValue.toLocaleString("en-IN")} on the table`
          : "No open offers",
      icon: TimerReset,
      iconClassName: "text-amber-300",
      cardClassName: "border-amber-500/20 bg-amber-500/[0.06]",
    },
    {
      label: "Active Campaigns",
      value: counts.active,
      sub: "Campaigns currently moving forward",
      icon: BriefcaseBusiness,
      iconClassName: "text-emerald-300",
      cardClassName: "border-emerald-500/20 bg-emerald-500/[0.05]",
    },
    {
      label: "Completed",
      value: counts.completed,
      sub: "Closed successfully",
      icon: CheckCircle2,
      iconClassName: "text-violet-300",
      cardClassName: "border-violet-500/20 bg-violet-500/[0.05]",
    },
  ];

  if (isLoading) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="container max-w-5xl py-6">
      <m.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <m.div variants={fadeUp} className="space-y-2">
          <h1 className="heading-mix text-2xl font-semibold tracking-tight text-white">
            Campaign{" "}
            <span className="heading-mix-accent text-white/90">Reviews</span>
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Review each opportunity with the brand context, offer details, and
            timeline you need before deciding.
          </p>
        </m.div>

        <m.div variants={fadeUp} className="grid gap-3 md:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-3xl border p-5 backdrop-blur-sm",
                stat.cardClassName,
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white/80">
                  {stat.label}
                </p>
                <stat.icon className={cn("h-4 w-4", stat.iconClassName)} />
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-white">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </m.div>

        <m.div variants={fadeUp} className="flex flex-wrap gap-2">
          {FILTERS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={cn(
                "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === key
                  ? "text-white"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white",
              )}
            >
              {filter === key ? (
                <m.div
                  layoutId="campaign-filter"
                  className="absolute inset-0 rounded-full"
                  style={FILTER_PILL_STYLE}
                  transition={FILTER_PILL_TRANSITION}
                />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-2">
                {FILTER_LABELS[key]}
                <span
                  className={cn(
                    "min-w-[22px] rounded-full px-1.5 py-0.5 text-[10px]",
                    filter === key ? "bg-white/20" : "bg-white/8",
                  )}
                >
                  {counts[key]}
                </span>
              </span>
            </button>
          ))}
        </m.div>

        <m.div variants={fadeUp} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <m.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl border border-white/8 bg-card/40 p-12 text-center backdrop-blur-sm"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <Inbox className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="mt-4 text-base font-medium text-white">
                  No campaigns in this view
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Brands will appear here once they send you collaboration
                  requests.
                </p>
              </m.div>
            ) : (
              filtered.map(({ campaign, business }) => {
                const businessName = getBusinessDisplayName(business);
                const location = getBusinessLocation(business);
                const summary =
                  business?.businessProfile?.tagline?.trim() ||
                  business?.businessProfile?.brand_summary?.trim() ||
                  campaign.brief?.trim() ||
                  "";
                const status = getStatusConfig(campaign.status);
                const isOffer = isOfferStatus(campaign.status);

                return (
                  <m.div
                    key={campaign.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={cn(
                      "rounded-[28px] border bg-card/[0.42] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm transition-colors hover:border-white/15",
                      status.border,
                      isClosedStatus(campaign.status) && "opacity-70",
                    )}
                  >
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1 space-y-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-1 text-[11px] font-medium",
                              status.badge,
                            )}
                          >
                            {status.label}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Received {formatDate(campaign.created_at)}
                          </span>
                        </div>

                        <div className="flex items-start gap-4">
                          <BusinessAvatar
                            business={business}
                            name={businessName}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-display text-[1.15rem] font-medium tracking-tight text-white">
                              {businessName}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                              {business?.businessProfile?.brand_type ? (
                                <span>
                                  {business.businessProfile.brand_type}
                                </span>
                              ) : null}
                              {location ? (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {location}
                                </span>
                              ) : null}
                            </div>
                            {summary ? (
                              <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-white/68">
                                {summary}
                              </p>
                            ) : null}
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
                          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                              Campaign
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white">
                              {campaign.title || "Untitled Campaign"}
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {formatPackageLabel(campaign.package_type)}
                            </p>
                          </div>

                          <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 md:min-w-[180px]">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                              Your Earnings
                            </p>
                            <p className="heading-premium mt-2 text-2xl font-semibold tracking-tight text-white">
                              ₹
                              {(campaign.price_offered ?? 0).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </div>
                        </div>

                        {campaign.brief ? (
                          <div className="rounded-3xl border border-white/8 bg-white/[0.025] px-4 py-3">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                              Brief Snapshot
                            </p>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/70">
                              {campaign.brief}
                            </p>
                          </div>
                        ) : null}

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock3 className="h-3.5 w-3.5" />
                            {isOffer
                              ? "Review the full brief before accepting"
                              : isActiveStatus(campaign.status)
                                ? "Campaign is currently in motion"
                                : campaign.status === "completed"
                                  ? "Campaign wrapped successfully"
                                  : "Closed campaign record"}
                          </div>
                          <Button
                            variant="outline"
                            className="h-10 rounded-full border-white/12 bg-white/[0.03] px-4 text-white hover:bg-white/[0.06]"
                            asChild
                          >
                            <Link
                              href={`/dashboard/influencer/campaigns/${campaign.id}`}
                            >
                              View details
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {isOffer ? (
                        <div className="lg:w-[220px]">
                          <OfferCountdown expiresAt={campaign.expires_at} />
                        </div>
                      ) : null}
                    </div>
                  </m.div>
                );
              })
            )}
          </AnimatePresence>
        </m.div>
      </m.div>
    </div>
  );
}
