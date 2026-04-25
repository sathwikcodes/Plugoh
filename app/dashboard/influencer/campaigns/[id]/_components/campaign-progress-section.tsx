"use client";

import {
  Banknote,
  CheckCheck,
  LockKeyhole,
  SendHorizonal,
  Sparkles,
  XCircle,
} from "lucide-react";
import { ThreeDPill, type PillPreset } from "@/components/ui/3d-pill";
import { cn } from "@/lib/utils";

// ── Step definitions ──────────────────────────────────────────────────────────

interface Step {
  key: string;
  icon: React.ReactNode;
}

const ICON_SIZE = "h-3 w-3";

const STEPS_STANDARD: Step[] = [
  { key: "pre_authorized", icon: <Sparkles className={ICON_SIZE} /> },
  { key: "in_escrow",      icon: <LockKeyhole className={ICON_SIZE} /> },
  { key: "delivery_submitted", icon: <SendHorizonal className={ICON_SIZE} /> },
  { key: "completed",     icon: <CheckCheck className={ICON_SIZE} /> },
];

const STEPS_LEGACY: Step[] = [
  { key: "requested",         icon: <Sparkles className={ICON_SIZE} /> },
  { key: "payment_pending",   icon: <Banknote className={ICON_SIZE} /> },
  { key: "in_escrow",         icon: <LockKeyhole className={ICON_SIZE} /> },
  { key: "delivery_submitted", icon: <SendHorizonal className={ICON_SIZE} /> },
  { key: "completed",         icon: <CheckCheck className={ICON_SIZE} /> },
];

const TERMINAL_STATUSES = new Set([
  "declined",
  "expired",
  "cancelled",
  "refunded",
  "rejected",
  "disputed",
]);

const TERMINAL_LABELS: Record<string, string> = {
  declined: "You declined this offer",
  rejected: "Offer declined by brand",
  expired: "Offer window expired",
  cancelled: "Booking cancelled",
  refunded: "Refunded",
  disputed: "Under dispute",
};

// ── Node color logic ──────────────────────────────────────────────────────────

type NodeState = "done" | "active" | "inactive";

function nodeColor(state: NodeState): PillPreset {
  if (state === "done")   return "emerald";
  if (state === "active") return "amber";
  return "slate";
}

// ── Uniform connector line ────────────────────────────────────────────────────
// NODE_SIZE = 2.25rem → half = 1.125rem ≈ 18px. Use mt-[18px] to centre line.

function Connector({ filled }: { filled: boolean }) {
  return (
    <div
      className="mx-2 h-px flex-1 shrink-0 rounded-full transition-all duration-300"
      style={{
        background: filled
          ? "rgba(255,255,255,0.45)"
          : "rgba(255,255,255,0.12)",
      }}
    />
  );
}

// ── Timeline ──────────────────────────────────────────────────────────────────

function StatusTimeline({ status }: { status: string }) {
  if (TERMINAL_STATUSES.has(status)) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3.5">
        <ThreeDPill
          label=""
          color="rose"
          icon={<XCircle className={ICON_SIZE} />}
          className="three-d-pill--circle"
        />
        <div>
          <p className="text-[14px] font-semibold capitalize text-white">
            {status.replaceAll("_", " ")}
          </p>
          <p className="mt-0.5 text-[11px] text-white/45">
            {TERMINAL_LABELS[status] ?? "This campaign did not move forward."}
          </p>
        </div>
      </div>
    );
  }

  const isLegacy = status === "requested" || status === "payment_pending";
  const steps = isLegacy ? STEPS_LEGACY : STEPS_STANDARD;
  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="w-full overflow-x-auto">
      {/* min-width ensures each node has at least 44px breathing room */}
      <div
        className="flex items-center"
        style={{ minWidth: `${steps.length * 44}px` }}
      >
        {steps.map((step, i) => {
          const reached  = i <= currentIndex;
          const current  = i === currentIndex;
          const state: NodeState = reached && !current ? "done" : current ? "active" : "inactive";

          return (
            <div key={step.key} className="flex flex-1 items-center">
              {/* 3-D circular pill node */}
              <ThreeDPill
                label=""
                color={nodeColor(state)}
                icon={step.icon}
                className={cn(
                  "three-d-pill--circle",
                  // subtle ring on active step
                  current && "ring-2 ring-amber-400/30 ring-offset-1 ring-offset-transparent",
                )}
              />

              {/* Connector after every node except the last */}
              {i < steps.length - 1 && (
                <Connector filled={i < currentIndex} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function CampaignProgressSection({ status }: { status: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-4 sm:px-5">
      <p className="mb-4 text-[10px] uppercase tracking-[0.22em] text-white/35">
        Progress
      </p>
      <StatusTimeline status={status} />
    </div>
  );
}
