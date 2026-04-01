"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useCampaignCounts } from "@/hooks/use-campaign-counts";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  X,
  Inbox,
  ArrowRight,
  Briefcase,
  Clock,
  CheckCircle2,
  Mail,
  Phone,
  MessageSquare,
  Timer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { m, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import {
  FILTER_PILL_STYLE,
  FILTER_PILL_TRANSITION,
  stagger,
  fadeUp,
} from "@/lib/animations";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

const FILTERS = ["all", "pending", "accepted", "completed"] as const;
type Filter = (typeof FILTERS)[number];

const filterLabels: Record<Filter, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Active",
  completed: "Done",
};

const getStatusConfig = (status: string) =>
  CAMPAIGN_STATUS_CONFIG[status as CampaignStatus] ??
  CAMPAIGN_STATUS_CONFIG.rejected;

// ── Hoisted static empty state (rendering-hoist-jsx) ────────────────────────
const EMPTY_CAMPAIGNS = (
  <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-10 text-center">
    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 mb-4">
      <Inbox className="h-7 w-7 text-muted-foreground" />
    </div>
    <p className="font-semibold">No campaigns here</p>
    <p className="text-sm text-muted-foreground mt-1">
      Brands will send you booking requests once they discover your profile.
    </p>
  </div>
);

// Lightweight inline timer for campaign list cards — avoids full BookingTimer import overhead
function PreAuthTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, new Date(expiresAt).getTime() - Date.now()),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, new Date(expiresAt).getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (timeLeft === 0) return <span className="text-red-400">Expired</span>;
  const h = Math.floor(timeLeft / 3600000);
  const m = Math.floor((timeLeft % 3600000) / 60000);
  const s = Math.floor((timeLeft % 60000) / 1000);
  const fmt = (n: number) => String(n).padStart(2, "0");
  return (
    <span className="font-mono text-amber-200">
      {fmt(h)}:{fmt(m)}:{fmt(s)}
    </span>
  );
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: campaigns = [], isLoading: loading } = useCampaigns(
    user?.id,
    "influencer",
  );
  const [filter, setFilter] = useState<Filter>("all");

  // Clear new_booking notifications when influencer visits campaigns page
  // useRef guard prevents re-execution on React strict-mode double-mount
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

  const statusMutation = useMutation(
    trpc.campaign.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        queryClient.invalidateQueries({ queryKey: ["campaign"] });
        queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
        queryClient.invalidateQueries({
          queryKey: ["business-inbox-conversations"],
        });
        toast({ title: "Campaign updated" });
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

  const updateStatus = (id: string, status: string) => {
    statusMutation.mutate({
      campaignId: id,
      status: status as "accepted" | "rejected" | "completed",
    });
  };

  // Single-pass counts via shared hook
  const counts = useCampaignCounts(campaigns);

  // Filtered list for current tab
  const filtered = useMemo(
    () =>
      campaigns.filter((c) =>
        filter === "all" ? c.status !== "rejected" : c.status === filter,
      ),
    [campaigns, filter],
  );

  const stats = [
    {
      label: "Active",
      value: counts.active,
      sub: undefined as string | undefined,
      icon: Briefcase,
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
      accent: "border-green-500/20",
    },
    {
      label: "Pending Offers",
      value: counts.pending,
      sub:
        counts.pendingValue > 0
          ? `₹${counts.pendingValue.toLocaleString()} waiting`
          : undefined,
      icon: Clock,
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-400",
      accent: "border-amber-500/20",
    },
    {
      label: "Completed",
      value: counts.completed,
      sub: undefined as string | undefined,
      icon: CheckCircle2,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
      accent: "border-violet-500/20",
    },
  ];

  if (loading) {
    return <PageLoadingSpinner />;
  }

  return (
    <div className="container max-w-3xl py-6 space-y-5">
      <m.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Header */}
        <m.div variants={fadeUp}>
          <h1 className="text-2xl font-extrabold tracking-tight">
            My Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {counts.pending > 0
              ? `${counts.pending} pending offer${counts.pending > 1 ? "s" : ""} waiting for you`
              : "Manage your brand collaborations"}
          </p>
        </m.div>

        {/* Stats Strip */}
        <m.div variants={fadeUp} className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "rounded-2xl border bg-card/60 backdrop-blur-sm p-4 space-y-2",
                stat.accent,
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br",
                  stat.gradient,
                )}
              >
                <stat.icon className={cn("h-4 w-4", stat.iconColor)} />
              </div>
              <div>
                <p className="text-xl font-extrabold tracking-tight leading-none">
                  {stat.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
                {stat.sub && (
                  <p className="text-[10px] text-amber-400 font-medium mt-0.5">
                    {stat.sub}
                  </p>
                )}
              </div>
            </div>
          ))}
        </m.div>

        {/* Filter Pills */}
        <m.div variants={fadeUp} className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => {
            const count =
              f === "all"
                ? campaigns.length - counts.rejected
                : counts[f === "accepted" ? "active" : f];
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "relative px-4 py-2 rounded-full text-sm font-medium transition-all",
                  filter === f
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                )}
              >
                {filter === f && (
                  <m.div
                    layoutId="campaign-filter"
                    className="absolute inset-0 rounded-full"
                    style={FILTER_PILL_STYLE}
                    transition={FILTER_PILL_TRANSITION}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {filterLabels[f]}
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                        filter === f ? "bg-white/20" : "bg-white/10",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </m.div>

        {/* Campaign List */}
        <m.div variants={fadeUp} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <m.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {filter === "all" ? (
                  EMPTY_CAMPAIGNS
                ) : (
                  <div className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-10 text-center">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 mb-4">
                      <Inbox className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <p className="font-semibold">No campaigns here</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {`No ${filterLabels[filter].toLowerCase()} campaigns yet.`}
                    </p>
                  </div>
                )}
              </m.div>
            ) : (
              filtered.map((c) => (
                <m.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    contentVisibility: "auto",
                    containIntrinsicSize: "0 200px",
                  }}
                  className={cn(
                    "rounded-2xl border border-white/10 bg-gradient-to-br backdrop-blur-sm p-5 border-l-[3px] transition-all hover:border-white/20",
                    getStatusConfig(c.status).cardBg,
                    getStatusConfig(c.status).border,
                    c.status === "rejected" && "opacity-60",
                  )}
                >
                  {/* Top row: status badge + time | price */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                          getStatusConfig(c.status).badge,
                        )}
                      >
                        {getStatusConfig(c.status).label}
                      </span>
                      {c.status === "pre_authorized" && c.expires_at ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px]">
                          <Timer className="h-3 w-3 text-amber-300" />
                          {/* Inline timer display — shows countdown */}
                          <PreAuthTimer expiresAt={c.expires_at} />
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {timeAgo(c.created_at)}
                        </span>
                      )}
                    </div>
                    {c.price_offered != null && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <img
                          src="/coin.png"
                          alt="coin"
                          className="h-4 w-4 object-contain"
                        />
                        <span className="text-base font-extrabold tracking-tight">
                          {c.price_offered.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Campaign title + package */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      {c.status === "completed" && (
                        <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                      )}
                      <p className="font-semibold text-[15px] truncate">
                        {c.title || "Untitled Campaign"}
                      </p>
                    </div>
                    {c.package_type && (
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {c.package_type} package
                      </p>
                    )}
                  </div>

                  {/* Active: contact chip */}
                  {c.status === "accepted" &&
                    (c.business_contact_email || c.business_contact_phone) && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {c.business_contact_email && (
                          <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-3 py-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{c.business_contact_email}</span>
                          </div>
                        )}
                        {c.business_contact_phone && (
                          <div className="flex items-center gap-1.5 bg-white/5 rounded-xl px-3 py-1.5 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            <span>{c.business_contact_phone}</span>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Pending: completed label */}
                  {c.status === "completed" && (
                    <p className="text-xs text-violet-400 mb-3">
                      Earned — payment confirmed
                    </p>
                  )}

                  {/* Action row */}
                  <div className="flex items-center gap-2">
                    {c.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="h-9 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:brightness-110 border-0 flex-1"
                          onClick={() => updateStatus(c.id, "accepted")}
                          disabled={statusMutation.isPending}
                        >
                          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 rounded-xl border-white/10 flex-1"
                          onClick={() => updateStatus(c.id, "rejected")}
                          disabled={statusMutation.isPending}
                        >
                          <X className="mr-1.5 h-3.5 w-3.5" />
                          Decline
                        </Button>
                      </>
                    )}
                    {c.status === "accepted" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 rounded-xl border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={() => updateStatus(c.id, "completed")}
                        disabled={statusMutation.isPending}
                      >
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                        Mark Complete
                      </Button>
                    )}
                    {c.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 rounded-xl p-0 text-muted-foreground hover:text-foreground"
                        asChild
                      >
                        <Link href={`/dashboard/influencer/inbox?chat=${c.id}`}>
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 rounded-xl ml-auto text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <Link href={`/dashboard/influencer/campaigns/${c.id}`}>
                        Details <ArrowRight className="ml-1 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </m.div>
              ))
            )}
          </AnimatePresence>
        </m.div>
      </m.div>
    </div>
  );
}
