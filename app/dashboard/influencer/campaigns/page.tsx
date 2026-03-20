"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useCampaigns } from "@/hooks/queries/use-campaigns";
import { useTRPC } from "@/lib/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  X,
  Inbox,
  Loader2,
  ArrowRight,
  Briefcase,
  Clock,
  CheckCircle2,
  Mail,
  Phone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import {
  FILTER_PILL_STYLE,
  FILTER_PILL_TRANSITION,
  stagger,
  fadeUp,
} from "@/lib/animations";

const FILTERS = ["all", "pending", "accepted", "completed"] as const;
type Filter = (typeof FILTERS)[number];

const filterLabels: Record<Filter, string> = {
  all: "All",
  pending: "Pending",
  accepted: "Active",
  completed: "Done",
};

const statusLabel: Record<string, string> = {
  pending: "New Offer",
  accepted: "In Progress",
  completed: "Completed",
  rejected: "Declined",
};

const statusBadgeCn: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  accepted: "bg-green-500/15 text-green-400 border-green-500/20",
  completed: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  rejected: "bg-white/5 text-muted-foreground border-white/10",
};

const statusBorderColor: Record<string, string> = {
  pending: "border-l-amber-400",
  accepted: "border-l-green-400",
  completed: "border-l-violet-400",
  rejected: "border-l-white/10",
};

const statusCardBg: Record<string, string> = {
  pending: "from-amber-500/8 to-yellow-500/5",
  accepted: "from-green-500/8 to-emerald-500/5",
  completed: "from-violet-500/8 to-purple-500/5",
  rejected: "from-transparent to-transparent",
};

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

  const { pending, active, completed, pendingValue, filtered } = useMemo(() => {
    const p: typeof campaigns = [];
    const a: typeof campaigns = [];
    const comp: typeof campaigns = [];
    const f: typeof campaigns = [];

    for (const c of campaigns) {
      if (c.status === "pending") p.push(c);
      else if (c.status === "accepted") a.push(c);
      else if (c.status === "completed") comp.push(c);

      if (filter === "all" ? c.status !== "rejected" : c.status === filter) {
        f.push(c);
      }
    }

    const pv = p.reduce((sum, c) => sum + (c.price_offered || 0), 0);

    return {
      pending: p,
      active: a,
      completed: comp,
      pendingValue: pv,
      filtered: f,
    };
  }, [campaigns, filter]);

  const stats = [
    {
      label: "Active",
      value: active.length,
      sub: undefined as string | undefined,
      icon: Briefcase,
      coinIcon: false,
      gradient: "from-green-500/20 to-emerald-500/20",
      iconColor: "text-green-400",
      accent: "border-green-500/20",
    },
    {
      label: "Pending Offers",
      value: pending.length,
      sub:
        pendingValue > 0
          ? `₹${pendingValue.toLocaleString()} waiting`
          : undefined,
      icon: Clock,
      coinIcon: false,
      gradient: "from-amber-500/20 to-yellow-500/20",
      iconColor: "text-amber-400",
      accent: "border-amber-500/20",
    },
    {
      label: "Completed",
      value: completed.length,
      sub: undefined as string | undefined,
      icon: CheckCircle2,
      coinIcon: false,
      gradient: "from-violet-500/20 to-purple-500/20",
      iconColor: "text-violet-400",
      accent: "border-violet-500/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 space-y-5">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-extrabold tracking-tight">
            My Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pending.length > 0
              ? `${pending.length} pending offer${pending.length > 1 ? "s" : ""} waiting for you`
              : "Manage your brand collaborations"}
          </p>
        </motion.div>

        {/* Stats Strip */}
        <motion.div variants={fadeUp} className="grid grid-cols-3 gap-3">
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
        </motion.div>

        {/* Filter Pills */}
        <motion.div
          variants={fadeUp}
          className="flex items-center gap-2 flex-wrap"
        >
          {FILTERS.map((f) => {
            const count =
              f === "all"
                ? campaigns.filter((c) => c.status !== "rejected").length
                : f === "pending"
                  ? pending.length
                  : f === "accepted"
                    ? active.length
                    : completed.length;
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
                  <motion.div
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
        </motion.div>

        {/* Campaign List */}
        <motion.div variants={fadeUp} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-2xl border border-white/5 bg-card/40 backdrop-blur-sm p-10 text-center"
              >
                <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 mb-4">
                  <Inbox className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="font-semibold">No campaigns here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === "all"
                    ? "Brands will send you booking requests once they discover your profile."
                    : `No ${filterLabels[filter].toLowerCase()} campaigns yet.`}
                </p>
              </motion.div>
            ) : (
              filtered.map((c) => (
                <motion.div
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "rounded-2xl border border-white/10 bg-gradient-to-br backdrop-blur-sm p-5 border-l-[3px] transition-all hover:border-white/20",
                    statusCardBg[c.status] || "from-transparent to-transparent",
                    statusBorderColor[c.status] || "border-l-white/10",
                    c.status === "rejected" && "opacity-60",
                  )}
                >
                  {/* Top row: status badge + time | price */}
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full border font-medium",
                          statusBadgeCn[c.status] || statusBadgeCn.rejected,
                        )}
                      >
                        {statusLabel[c.status] || c.status}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {timeAgo(c.created_at)}
                      </span>
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
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
