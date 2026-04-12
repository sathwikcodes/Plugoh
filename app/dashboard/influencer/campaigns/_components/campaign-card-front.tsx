"use client";

import Image from "next/image";
import Link from "next/link";
import { m, type MotionValue } from "framer-motion";
import { ArrowRight, Check, Loader2, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPackage, getInitials } from "@/lib/format";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";
import FlipClock from "@/components/ui/flip-clock";

// ─── Status glow (also used by campaign-card-back) ───────────────────────────
export const STATUS_GLOW: Record<string, string> = {
  pre_authorized: "rgba(245,158,11,0.22)",
  requested: "rgba(245,158,11,0.22)",
  pending: "rgba(245,158,11,0.22)",
  payment_pending: "rgba(34,197,94,0.18)",
  in_escrow: "rgba(34,197,94,0.18)",
  accepted: "rgba(34,197,94,0.18)",
  delivery_submitted: "rgba(34,197,94,0.16)",
  completed: "rgba(34,197,94,0.18)",
  disputed: "rgba(239,68,68,0.18)",
  declined: "rgba(239,68,68,0.18)",
  rejected: "rgba(239,68,68,0.18)",
  cancelled: "rgba(239,68,68,0.18)",
  expired: "rgba(239,68,68,0.18)",
  refunded: "rgba(239,68,68,0.18)",
};

// ─── Card data interface ──────────────────────────────────────────────────────
export interface CampaignCardData {
  id: string;
  title: string | null;
  brief?: string | null;
  status: string;
  package_type?: string | null;
  price_offered: number | null;
  expires_at?: string | null;
  created_at: string;
  brandName: string;
  businessType?: string | null;
  location?: string | null;
  brandAvatarUrl: string | null;
  avatarFallbackLabel?: string | null;
  detailHref: string;
  chatHref: string;
  onAccept?: () => void;
  onDecline?: () => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
}

// ─── State derivation ─────────────────────────────────────────────────────────
const OFFER_STATUSES = new Set(["pre_authorized", "requested", "pending"]);
const CLOSED_STATUSES = new Set([
  "declined",
  "rejected",
  "expired",
  "cancelled",
  "refunded",
]);

type CardVariant = "offer-timer" | "offer-no-timer" | "non-offer";

function deriveCardState(status: string, expiresAt?: string | null) {
  const isOffer = OFFER_STATUSES.has(status);
  const isClosed = CLOSED_STATUSES.has(status);
  const hasTimer = isOffer && !!expiresAt;
  const variant: CardVariant = hasTimer
    ? "offer-timer"
    : isOffer
      ? "offer-no-timer"
      : "non-offer";
  return { isOffer, isClosed, hasTimer, variant };
}

const PRICE_LABEL: Record<string, string> = {
  in_escrow: "in escrow",
  accepted: "in escrow",
  payment_pending: "awaiting payment",
  delivery_submitted: "pending payout",
  completed: "earned",
};

// ─── Local sub-components ─────────────────────────────────────────────────────
function Avatar({
  imageUrl,
  displayName,
  fallbackLabel,
}: {
  imageUrl: string | null;
  displayName: string;
  fallbackLabel?: string | null;
}) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={displayName}
        width={32}
        height={32}
        className="h-8 w-8 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[9px] font-bold text-white/60">
      {getInitials(fallbackLabel || displayName)}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/28">
      {children}
    </p>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg = CAMPAIGN_STATUS_CONFIG[status as CampaignStatus];
  if (!cfg) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-[5px] text-[11px] font-medium",
        cfg.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)} />
      {cfg.shortLabel}
    </span>
  );
}

function PackagePill({
  packageType,
  muted,
}: {
  packageType?: string | null;
  muted?: boolean;
}) {
  if (!packageType) return null;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-white/[0.09] bg-white/[0.06] px-2.5 py-[5px] text-[11px] font-medium",
        muted ? "text-white/22" : "text-white/70",
      )}
    >
      {formatPackage(packageType)}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CampaignCardFront({
  card,
  overlayOpacity = 1,
}: {
  card: CampaignCardData;
  overlayOpacity?: MotionValue<number> | number;
}) {
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";
  const { isOffer, isClosed, hasTimer, variant } = deriveCardState(
    card.status,
    card.expires_at,
  );
  const actionsDisabled = card.isAccepting || card.isDeclining;
  const priceLabel = PRICE_LABEL[card.status] ?? null;
  const isCompleted = card.status === "completed";
  const hasBrief = !!card.brief?.trim();

  return (
    <m.div style={{ opacity: overlayOpacity }} className="h-full w-full">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[#080609]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% -8%, ${glow}, transparent)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

      <div className="relative flex h-full flex-col px-5 pb-5 pt-5">
        {/* ── Title ── */}
        <h2
          className={cn(
            "line-clamp-2 text-[22px] font-semibold leading-[1.2] tracking-[-0.04em]",
            isClosed ? "text-white/45" : "text-white",
          )}
        >
          {card.title || "Untitled Campaign"}
        </h2>

        {/* ── Brand row ── */}
        <div
          className={cn(
            "mt-3 flex items-center gap-2.5 rounded-2xl border px-3 py-2",
            isClosed
              ? "border-white/6 bg-white/[0.025]"
              : "border-white/8 bg-white/4",
          )}
        >
          <Avatar
            imageUrl={card.brandAvatarUrl}
            displayName={card.brandName}
            fallbackLabel={card.avatarFallbackLabel}
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-[13px] font-semibold leading-tight",
                isClosed ? "text-white/38" : "text-white",
              )}
            >
              {card.brandName}
            </p>
            {!hasTimer && card.businessType ? (
              <p className="mt-0.5 truncate text-[11px] text-white/35">
                {card.businessType}
              </p>
            ) : null}
          </div>
        </div>

        {/* ── Middle section: flex-1, top content + brief pinned to bottom ── */}
        <div className="mt-3 flex min-h-0 flex-1 flex-col justify-between">
          {/* Top content */}
          <div className="space-y-3">
            {/* Offer + timer */}
            {variant === "offer-timer" && (
              <div className="rounded-[16px] border border-amber-500/20 bg-amber-500/[0.07] px-4 py-3.5">
                <p className="mb-3 text-center text-[9px] font-semibold uppercase tracking-[0.22em] text-amber-300/50">
                  Offer expires soon
                </p>
                <FlipClock
                  compact
                  expiresAt={card.expires_at}
                  className="w-full justify-center"
                />
              </div>
            )}

            {/* Package — shown for all offer variants */}
            {isOffer && card.package_type && (
              <div className="space-y-1.5">
                <Label>Package</Label>
                <PackagePill packageType={card.package_type} />
              </div>
            )}

            {/* Status + Package — shown for all non-offer variants */}
            {!isOffer && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  <StatusPill status={card.status} />
                  {card.package_type ? (
                    <PackagePill
                      packageType={card.package_type}
                      muted={isClosed}
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Brief — pinned to bottom of flex-1, right above divider */}
          {hasBrief && (
            <div className="space-y-1.5">
              <Label>Brief</Label>
              <p
                className={cn(
                  "leading-[1.55] text-white/40",
                  hasTimer
                    ? "line-clamp-2 text-[11.5px]"
                    : "line-clamp-3 text-[12px]",
                )}
              >
                {card.brief!.trim()}
              </p>
            </div>
          )}
        </div>

        {/* ── Divider ── */}
        {!isClosed ? <div className="mt-3 h-px bg-white/[0.07]" /> : null}

        {/* ── Price + Actions ── */}
        <div className="flex items-center justify-between gap-3 pt-3.5">
          {/* Price */}
          <div className="min-w-0">
            <p
              className={cn(
                "text-[26px] font-bold leading-none tracking-[-0.05em]",
                isCompleted
                  ? "text-emerald-300"
                  : isClosed
                    ? "text-white/25"
                    : "text-white",
              )}
            >
              {formatCurrency(card.price_offered)}
            </p>
            {priceLabel ? (
              <p className="mt-1 text-[10px] tracking-wide text-white/35">
                {priceLabel}
              </p>
            ) : null}
          </div>

          {/* Actions */}
          {isOffer ? (
            <div className="flex shrink-0 items-center gap-2">
              {/* Decline */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={card.onDecline}
                disabled={actionsDisabled}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rose-400/18 bg-rose-400/10 text-rose-300/80 transition-transform duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {card.isDeclining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
              {/* Accept — wide primary */}
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={card.onAccept}
                disabled={actionsDisabled}
                className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-emerald-400 text-[13px] font-semibold text-black shadow-[0_6px_20px_rgba(52,211,153,0.30)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {card.isAccepting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Accept</span>
                  </>
                )}
              </button>
            </div>
          ) : isCompleted ? (
            <Link
              href={card.detailHref}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-[13px] font-semibold text-black shadow-[0_6px_20px_rgba(0,0,0,0.30)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>View</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : isClosed ? (
            <Link
              href={card.detailHref}
              onPointerDown={(e) => e.stopPropagation()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/8 bg-white/5 transition-transform duration-150 hover:scale-105 active:scale-95"
            >
              <ArrowRight className="h-4 w-4 text-white/40" />
            </Link>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={card.chatHref}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                <MessageCircle className="h-4.5 w-4.5 text-black" />
              </Link>
              <Link
                href={card.detailHref}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.28)] transition-transform duration-150 hover:scale-105 active:scale-95"
              >
                <ArrowRight className="h-4.5 w-4.5 text-black" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
}
