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

const ICO = "h-[11px] w-[11px]";

interface Step {
  key: string;
  icon: React.ReactNode;
}

const STEPS_STANDARD: Step[] = [
  { key: "pre_authorized",     icon: <Sparkles      className={ICO} /> },
  { key: "in_escrow",          icon: <LockKeyhole   className={ICO} /> },
  { key: "delivery_submitted", icon: <SendHorizonal className={ICO} /> },
  { key: "completed",          icon: <CheckCheck    className={ICO} /> },
];

const STEPS_LEGACY: Step[] = [
  { key: "requested",          icon: <Sparkles      className={ICO} /> },
  { key: "payment_pending",    icon: <Banknote      className={ICO} /> },
  { key: "in_escrow",          icon: <LockKeyhole   className={ICO} /> },
  { key: "delivery_submitted", icon: <SendHorizonal className={ICO} /> },
  { key: "completed",          icon: <CheckCheck    className={ICO} /> },
];

const TERMINAL_STATUSES = new Set([
  "declined", "expired", "cancelled", "refunded", "rejected", "disputed",
]);

const TERMINAL_LABELS: Record<string, string> = {
  declined:  "Creator declined your offer",
  rejected:  "Creator declined your offer",
  expired:   "Booking window expired",
  cancelled: "Booking cancelled",
  refunded:  "Payment refunded",
  disputed:  "Under dispute — our team is reviewing",
};

type NodeState = "done" | "active" | "inactive";

function nodeColor(state: NodeState): PillPreset {
  if (state === "done")   return "emerald";
  if (state === "active") return "amber";
  return "slate";
}

function Connector({ filled }: { filled: boolean }) {
  return (
    <div
      className="mx-2 h-px flex-1 rounded-full transition-all duration-300"
      style={{
        background: filled
          ? "rgba(255,255,255,0.50)"
          : "rgba(255,255,255,0.13)",
      }}
    />
  );
}

function StatusTimeline({ status }: { status: string }) {
  if (TERMINAL_STATUSES.has(status)) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] px-4 py-3">
        <ThreeDPill
          label=""
          color="rose"
          icon={<XCircle className={ICO} />}
          className="three-d-pill--circle three-d-pill--no-glow"
        />
        <div>
          <p className="text-[13px] font-semibold capitalize text-white">
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
    <div className="flex w-full items-center px-2 py-3">
      {steps.map((step, i) => {
        const reached = i <= currentIndex;
        const current = i === currentIndex;
        const state: NodeState =
          reached && !current ? "done" : current ? "active" : "inactive";

        return (
          <div
            key={step.key}
            className={cn("flex items-center", i < steps.length - 1 ? "flex-1" : "")}
          >
            <ThreeDPill
              label=""
              color={nodeColor(state)}
              icon={step.icon}
              className="three-d-pill--circle three-d-pill--no-glow"
              style={
                current
                  ? {
                      outline: "2px solid rgba(245,158,11,0.65)",
                      outlineOffset: "3px",
                    }
                  : undefined
              }
            />
            {i < steps.length - 1 && <Connector filled={i < currentIndex} />}
          </div>
        );
      })}
    </div>
  );
}

export function CampaignProgressSection({ status }: { status: string }) {
  return <StatusTimeline status={status} />;
}
