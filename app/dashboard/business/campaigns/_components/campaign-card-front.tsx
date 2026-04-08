"use client";

import Image from "next/image";
import Link from "next/link";
import { m, type MotionValue } from "framer-motion";
import { ArrowRight, BarChart3, Lock, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatPackage,
  getInitials,
  timeAgo,
} from "@/lib/format";
import FlipClock from "@/components/ui/flip-clock";
import { CAMPAIGN_STATUS_CONFIG } from "@/lib/constants";
import type { CampaignStatus } from "@/lib/constants";

export interface CampaignCardData {
  id: string;
  title: string | null;
  brief?: string | null;
  status: string;
  package_type: string | null;
  price_offered: number | null;
  expires_at: string | null;
  created_at: string;
  influencerName: string;
  influencerHandle: string | null;
  influencerAvatarUrl: string | null;
  chartUrl?: string | null;
  chartLocked?: boolean | null;
}

export const STATUS_GLOW: Record<string, string> = {
  pre_authorized: "rgba(245,158,11,0.20)",
  requested: "rgba(245,158,11,0.20)",
  pending: "rgba(245,158,11,0.20)",
  payment_pending: "rgba(234,179,8,0.22)",
  in_escrow: "rgba(234,179,8,0.18)",
  accepted: "rgba(34,197,94,0.15)",
  delivery_submitted: "rgba(234,179,8,0.18)",
  completed: "rgba(34,197,94,0.15)",
  disputed: "rgba(239,68,68,0.18)",
  declined: "rgba(239,68,68,0.18)",
  rejected: "rgba(239,68,68,0.18)",
  cancelled: "rgba(239,68,68,0.18)",
  expired: "rgba(239,68,68,0.18)",
  refunded: "rgba(239,68,68,0.18)",
};

export function CampaignCardFront({
  card,
  overlayOpacity = 1,
}: {
  card: CampaignCardData;
  overlayOpacity?: MotionValue<number> | number;
}) {
  const cfg =
    CAMPAIGN_STATUS_CONFIG[card.status as CampaignStatus] ??
    CAMPAIGN_STATUS_CONFIG.requested;
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";
  const showTimer =
    ["pre_authorized", "requested", "pending"].includes(card.status) &&
    !!card.expires_at;
  const isChartLocked = card.chartLocked ?? !card.chartUrl;
  const chartHref =
    card.chartUrl || `/dashboard/business/campaigns/${card.id}#chart`;

  return (
    <m.div style={{ opacity: overlayOpacity }} className="h-full w-full">
      <div className="absolute inset-0 bg-[#080a0d]" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${glow}, transparent)`,
        }}
      />

      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

      <div className="relative flex h-full flex-col px-5 pb-5 pt-6">
        <div className="flex shrink-0 items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.75 text-[10px] font-semibold uppercase tracking-[0.18em] leading-none",
              cfg.badge,
            )}
          >
            {cfg.label}
          </span>
          <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-0.75 text-[10px] font-medium uppercase tracking-[0.16em] leading-none text-white/50">
            {formatPackage(card.package_type)}
          </span>
        </div>

        <div className="min-h-0 flex-1 flex flex-col justify-start pb-1 pt-2">
          <h2 className="line-clamp-4 text-[26px] font-semibold leading-[1.22] tracking-[-0.04em] text-white">
            {card.title || "Untitled Campaign"}
          </h2>

          <div className="mb-3 mt-3 flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/4 px-3 py-2">
            {card.influencerAvatarUrl ? (
              <Image
                src={card.influencerAvatarUrl}
                alt={card.influencerName}
                width={36}
                height={36}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-[10px] font-bold text-white/70">
                {getInitials(card.influencerName)}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {card.influencerName}
              </p>
              <p className="truncate text-[11px] text-white/45">
                {card.influencerHandle ? `@${card.influencerHandle}` : "—"}
                {" · "}
                {timeAgo(card.created_at)}
              </p>
            </div>
          </div>

          {card.brief?.trim() && (
            <p className="line-clamp-2 text-[13px] leading-[1.55] text-white/42">
              {card.brief.trim()}
            </p>
          )}
        </div>

        {showTimer && (
          <div className="mb-4 shrink-0 rounded-[16px] border border-amber-500/22 bg-amber-500/8 px-4 py-3">
            <p className="mb-2 text-[9px] uppercase tracking-[0.22em] text-amber-300/55">
              Offer expires in
            </p>
            <FlipClock className="justify-start" expiresAt={card.expires_at} />
          </div>
        )}

        <div className="shrink-0 h-px bg-white/8" />

        <div className="shrink-0 flex items-center justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="text-[30px] font-bold leading-none tracking-[-0.05em] text-white">
              {formatCurrency(card.price_offered)}
              <span className="ml-2 text-[14px] font-medium tracking-[0.01em] text-white/55">
                spent
              </span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {isChartLocked ? (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="relative flex h-12 w-12 items-center justify-center rounded-full border border-white/16 bg-white/6 text-white/45 shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
              >
                <MessageCircle className="h-5 w-5 opacity-70" />
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-white/20 bg-[#11151c]">
                  <Lock className="h-2.5 w-2.5 text-white/75" />
                </span>
              </button>
            ) : (
              <Link
                href={chartHref}
                onClick={(e) => e.stopPropagation()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <BarChart3 className="h-5 w-5 text-black" />
              </Link>
            )}
            <Link
              href={`/dashboard/business/campaigns/${card.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              <ArrowRight className="h-5 w-5 text-black" />
            </Link>
          </div>
        </div>
      </div>
    </m.div>
  );
}
