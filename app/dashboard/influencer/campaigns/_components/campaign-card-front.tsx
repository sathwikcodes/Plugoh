"use client";

import Image from "next/image";
import Link from "next/link";
import { m, type MotionValue } from "framer-motion";
import {
  ArrowRight,
  Check,
  Loader2,
  MapPin,
  MessageCircle,
  X,
} from "lucide-react";
import {
  formatCurrency,
  formatPackage,
  getInitials,
  timeAgo,
} from "@/lib/format";
import FlipClock from "@/components/ui/flip-clock";

const OFFER_STATUSES = new Set(["pre_authorized", "requested", "pending"]);

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

export const STATUS_GLOW: Record<string, string> = {
  pre_authorized: "rgba(245,158,11,0.20)",
  requested: "rgba(245,158,11,0.20)",
  pending: "rgba(245,158,11,0.20)",
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
        width={36}
        height={36}
        className="h-9 w-9 rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-[10px] font-bold text-white/70">
      {getInitials(fallbackLabel || displayName)}
    </div>
  );
}

export function CampaignCardFront({
  card,
  overlayOpacity = 1,
}: {
  card: CampaignCardData;
  overlayOpacity?: MotionValue<number> | number;
}) {
  const glow = STATUS_GLOW[card.status] ?? "rgba(255,255,255,0.06)";
  const isOffer = OFFER_STATUSES.has(card.status);
  const actionsDisabled = card.isAccepting || card.isDeclining;
  const meta = [card.businessType, timeAgo(card.created_at)].filter(Boolean);

  return (
    <m.div style={{ opacity: overlayOpacity }} className="h-full w-full">
      <div className="absolute inset-0 bg-[#080609]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 55% at 50% -10%, ${glow}, transparent)`,
        }}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />

      <div className="relative flex h-full flex-col px-5 pb-5 pt-6">
        <div className="flex min-h-0 flex-1 flex-col justify-start pb-1">
          <h2 className="line-clamp-4 text-[26px] font-semibold leading-[1.22] tracking-[-0.04em] text-white">
            {card.title || "Untitled Campaign"}
          </h2>

          <div className="mb-3 mt-3 flex items-center gap-3 rounded-[16px] border border-white/10 bg-white/4 px-3 py-2">
            <Avatar
              imageUrl={card.brandAvatarUrl}
              displayName={card.brandName}
              fallbackLabel={card.avatarFallbackLabel}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {card.brandName}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/45">
                {meta.map((item, index) => (
                  <span key={`${item}-${index}`} className="whitespace-nowrap">
                    {item}
                  </span>
                ))}
                {card.location ? (
                  <span className="inline-flex min-w-0 items-center gap-1 truncate">
                    <MapPin className="h-3 w-3 shrink-0 text-white/35" />
                    <span className="truncate">{card.location}</span>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mb-3 rounded-[16px] border border-white/8 bg-white/[0.03] px-3 py-2.5">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/35">
              Package booked
            </p>
            <p className="mt-1 text-sm font-semibold text-white/85">
              {formatPackage(card.package_type ?? null)}
            </p>
          </div>

          {card.brief?.trim() && (
            <p className="line-clamp-2 text-[13px] leading-[1.55] text-white/42">
              {card.brief.trim()}
            </p>
          )}
        </div>

        {isOffer && card.expires_at ? (
          <div className="mb-4 shrink-0 rounded-[16px] border border-amber-500/22 bg-amber-500/8 px-4 py-3">
            <p className="mb-2 text-center text-[9px] uppercase tracking-[0.22em] text-amber-300/55">
              Offer expires soon
            </p>
            <FlipClock
              className="w-full justify-center"
              expiresAt={card.expires_at}
            />
          </div>
        ) : null}

        <div className="h-px shrink-0 bg-white/8" />

        <div className="flex shrink-0 items-center justify-between gap-3 pt-4">
          <div className="min-w-0">
            <p className="flex items-end gap-2 text-[30px] font-bold leading-none tracking-[-0.05em] text-white">
              {formatCurrency(card.price_offered)}
              <span className="pb-1 text-[12px] font-medium tracking-[0.08em] text-white/55">
                Paid
              </span>
            </p>
          </div>

          {isOffer ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={card.onDecline}
                disabled={actionsDisabled}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-400/20 bg-rose-400/12 text-rose-200 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {card.isDeclining ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <X className="h-5 w-5" />
                )}
              </button>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={card.onAccept}
                disabled={actionsDisabled}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/12 text-emerald-200 shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {card.isAccepting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={card.chatHref}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <MessageCircle className="h-5 w-5 text-black" />
              </Link>
              <Link
                href={card.detailHref}
                onPointerDown={(e) => e.stopPropagation()}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                <ArrowRight className="h-5 w-5 text-black" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </m.div>
  );
}
