"use client";

import Image from "next/image";
import Link from "next/link";
import { m, type MotionValue } from "framer-motion";
import { Check, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPackage, getInitials } from "@/lib/format";
import { CAMPAIGN_STATUS_CONFIG, type CampaignStatus } from "@/lib/constants";
import { ThreeDButton } from "@/components/ui/3d-button";
import { ThreeDPill, type PillPreset } from "@/components/ui/3d-pill";

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

// ─── Constants ────────────────────────────────────────────────────────────────
const OFFER_STATUSES = new Set(["pre_authorized", "requested", "pending"]);

const STATUS_PILL_COLOR: Record<string, PillPreset> = {
  pre_authorized: "amber",
  requested: "amber",
  pending: "amber",
  payment_pending: "amber",
  in_escrow: "amber",
  delivery_submitted: "amber",
  accepted: "emerald",
  completed: "emerald",
  disputed: "rose",
  declined: "rose",
  rejected: "rose",
  cancelled: "rose",
  expired: "rose",
  refunded: "rose",
};

const PAYMENT_PROGRESS: Record<string, { label: string; color: PillPreset }> = {
  pre_authorized:    { label: "Awaiting",  color: "slate"   },
  requested:         { label: "Awaiting",  color: "slate"   },
  pending:           { label: "Awaiting",  color: "slate"   },
  payment_pending:   { label: "Pay Now",   color: "amber"   },
  in_escrow:         { label: "On Hold",   color: "amber"   },
  accepted:          { label: "On Hold",   color: "amber"   },
  delivery_submitted:{ label: "On Hold",   color: "amber"   },
  completed:         { label: "Paid",      color: "emerald" },
  disputed:          { label: "Disputed",  color: "rose"    },
  declined:          { label: "Cancelled", color: "rose"    },
  rejected:          { label: "Cancelled", color: "rose"    },
  cancelled:         { label: "Cancelled", color: "rose"    },
  expired:           { label: "Expired",   color: "rose"    },
  refunded:          { label: "Refunded",  color: "rose"    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusPill({ status }: { status: string }) {
  const cfg = CAMPAIGN_STATUS_CONFIG[status as CampaignStatus];
  if (!cfg) return null;
  return (
    <ThreeDPill
      label={cfg.shortLabel}
      color={STATUS_PILL_COLOR[status] ?? "slate"}
    />
  );
}

function BrandPill({
  brandName,
  avatarUrl,
  fallbackLabel,
}: {
  brandName: string;
  avatarUrl: string | null;
  fallbackLabel?: string | null;
}) {
  const avatar = avatarUrl ? (
    <Image
      src={avatarUrl}
      alt={brandName}
      width={16}
      height={16}
      className="h-4 w-4 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-black/30 text-[7px] font-bold">
      {getInitials(fallbackLabel || brandName)}
    </span>
  );

  return (
    <ThreeDPill
      label={brandName}
      color="slate"
      icon={avatar}
      className="[&_.pill-text]:max-w-[110px] [&_.pill-text]:truncate"
    />
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
  const isOffer = OFFER_STATUSES.has(card.status);
  const actionsDisabled = card.isAccepting || card.isDeclining;

  const pkgName = card.package_type ? formatPackage(card.package_type) : "content";
  let deliveryLabel = `Brand requests a ${pkgName} ASAP`;

  if (card.brief) {
    const timelineMatch = card.brief.match(/Timeline:\s*(.*)/);
    if (timelineMatch) {
      const t = timelineMatch[1].trim();
      if (t === "Instant") {
        deliveryLabel = `Brand requests a ${pkgName} ASAP`;
      } else {
        const dateMatch = t.match(/\((.*)\)/);
        if (dateMatch) {
          const rawDate = dateMatch[1];
          const [year, month, day] = rawDate.split("-").map(Number);
          if (year && month && day) {
            const localDate = new Date(year, month - 1, day);
            const formattedDate = localDate.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
            deliveryLabel = `Brand requests a ${pkgName} by ${formattedDate}`;
          } else {
            deliveryLabel = `Brand requests a ${pkgName} by ${rawDate}`;
          }
        } else {
          deliveryLabel = `Brand requests a ${pkgName} (${t})`;
        }
      }
    }
  }

  return (
    <m.div
      style={{ opacity: overlayOpacity }}
      className="absolute inset-0 flex flex-col overflow-hidden @container"
    >
      {/* ── Image section ──────────────────────────────────────────────────── */}
      {/*
       * padding-bottom: 58% creates the image area height.
       * CSS spec guarantees padding % is always relative to the element's
       * own width — not the parent's height — so this works in any layout ctx.
       */}
      <div className="relative w-full flex-none" style={{ paddingBottom: "58%" }}>
        <div className="absolute inset-0 overflow-hidden">
          {card.brandAvatarUrl ? (
            <Image
              src={card.brandAvatarUrl}
              alt={card.brandName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                background: `radial-gradient(ellipse 120% 120% at 50% -10%, ${glow} 0%, #111116 60%, #080609 100%)`,
              }}
            >
              {/* Large brand initials fallback */}
              <span
                className="select-none"
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(64px, 18cqw, 110px)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  color: "rgba(255,255,255,0.13)",
                  textShadow: "0 2px 24px rgba(0,0,0,0.35)",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
                aria-hidden="true"
              >
                {getInitials(card.avatarFallbackLabel || card.brandName)}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080609] via-[#080609]/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 backdrop-blur-md" style={{ maskImage: "linear-gradient(to top, black 40%, transparent 100%)" }} />
        </div>

        <div className="absolute inset-x-3 top-3 z-10 flex items-start justify-between gap-2">
          <BrandPill
            brandName={card.brandName}
            avatarUrl={card.brandAvatarUrl}
            fallbackLabel={card.avatarFallbackLabel}
          />
          <StatusPill status={card.status} />
        </div>
      </div>

      {/* ── Content section ────────────────────────────────────────────────── */}
      <div className="relative flex flex-1 flex-col overflow-hidden bg-[#080609] px-3 pb-3 pt-2.5 @[340px]:px-4 @[340px]:pb-4 @[340px]:pt-3">
        {/* Title — scales from 17px on tiny cards to 25px on wide cards */}
        <div className="hidden md:block">
          <h2
            className="line-clamp-2 font-semibold leading-[1.15] tracking-[-0.04em] text-white"
            style={{ fontSize: "clamp(17px, 5.5cqw, 25px)" }}
          >
            {card.title || "Untitled Campaign"}
          </h2>
        </div>

        {/* Payout box — coin + price left, payment-progress pill right */}
        <div className="mt-2.5 flex items-center justify-between gap-2 rounded-2xl border border-white/8 bg-white/[0.05] px-3 py-3 @[340px]:mt-3 @[340px]:px-4 @[340px]:py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Image
              src="/coin.png"
              alt=""
              width={36}
              height={36}
              className="shrink-0 object-contain"
              style={{
                width: "clamp(20px, 6cqw, 36px)",
                height: "clamp(20px, 6cqw, 36px)",
              }}
            />
            <span
              className="font-bold leading-none tracking-[-0.05em] text-amber-400"
              style={{ fontSize: "clamp(19px, 6cqw, 32px)" }}
            >
              {card.price_offered
                ? card.price_offered.toLocaleString("en-IN")
                : "—"}
            </span>
          </div>
          {PAYMENT_PROGRESS[card.status] ? (
            <ThreeDPill
              label={PAYMENT_PROGRESS[card.status].label}
              color={PAYMENT_PROGRESS[card.status].color}
              className="shrink-0"
            />
          ) : null}
        </div>

        {/* Info tags — two pills splitting the full card width */}
        {(card.businessType || card.location) ? (
          <div className="mt-2.5 flex gap-2 @[340px]:mt-3">
            {card.businessType ? (
              <ThreeDPill
                label={card.businessType}
                color={{
                  base: "#6b6457",
                  light: "#9c9183",
                  mid: "#504840",
                  dark: "#28241e",
                  ink: "#f0ece4",
                  glow: "rgba(107,100,87,0.18)",
                }}
                className="flex-1 min-w-0 justify-center [&_.pill-text]:truncate [&_.pill-label]:max-w-full"
              />
            ) : null}
            {card.location ? (
              <ThreeDPill
                label={card.location}
                color={{
                  base: "#566070",
                  light: "#8090a0",
                  mid: "#404c5c",
                  dark: "#202830",
                  ink: "#e4eaf0",
                  glow: "rgba(86,96,112,0.18)",
                }}
                icon={
                  <Image
                    src="/map.png"
                    alt=""
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 shrink-0 object-contain"
                  />
                }
                className="flex-1 min-w-0 justify-center [&_.pill-text]:truncate [&_.pill-label]:max-w-full"
              />
            ) : null}
          </div>
        ) : null}

        {/* Delivery / Package Pill */}
        <div className="mt-2.5 flex @[340px]:mt-3">
          <ThreeDPill
            label={deliveryLabel}
            color="slate"
            className="flex-1 min-w-0 justify-center [&_.pill-text]:truncate [&_.pill-label]:max-w-full"
          />
        </div>

        {/* Push action to bottom */}
        <div className="flex-1" />

        {/* Action */}
        <div className="mt-3">
          {isOffer ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={card.onDecline}
                disabled={actionsDisabled}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-amber-400/18 bg-amber-400/10 text-amber-300/80 transition-transform duration-150 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {card.isDeclining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
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
          ) : (
            <ThreeDButton
              asChild
              label="View"
              className="!w-full mx-auto three-d-button--cq-responsive"
              onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
            >
              <Link href={card.detailHref} />
            </ThreeDButton>
          )}
        </div>
      </div>
    </m.div>
  );
}
