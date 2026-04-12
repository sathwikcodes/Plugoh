import { Check, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_STEPS = [
  { key: "pre_authorized", label: "Offered" },
  { key: "in_escrow", label: "In Progress" },
  { key: "delivery_submitted", label: "Delivered" },
  { key: "completed", label: "Done" },
];

const LEGACY_STEPS = [
  { key: "requested", label: "Offered" },
  { key: "payment_pending", label: "Accepted" },
  { key: "in_escrow", label: "In Progress" },
  { key: "delivery_submitted", label: "Delivered" },
  { key: "completed", label: "Done" },
];

const TERMINAL_STATUSES = new Set([
  "declined",
  "expired",
  "cancelled",
  "refunded",
  "rejected",
]);

const TERMINAL_LABELS: Record<string, string> = {
  declined: "You declined this offer",
  rejected: "Offer declined",
  expired: "Offer window expired",
  cancelled: "Booking cancelled",
  refunded: "Refunded",
};

function StatusTimeline({ status }: { status: string }) {
  if (TERMINAL_STATUSES.has(status)) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3.5">
        <CircleDot className="h-4 w-4 shrink-0 text-rose-300/70" />
        <div>
          <p className="text-[15px] font-semibold capitalize text-white">
            {status.replaceAll("_", " ")}
          </p>
          <p className="mt-0.5 text-xs text-white/50">
            {TERMINAL_LABELS[status] ?? "This campaign did not move forward."}
          </p>
        </div>
      </div>
    );
  }

  const isLegacy = status === "requested" || status === "payment_pending";
  const steps = isLegacy ? LEGACY_STEPS : STATUS_STEPS;
  const currentIndex = steps.findIndex((step) => step.key === status);
  const isCompleted = status === "completed";

  return (
    <div className="flex items-start">
      {steps.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <div key={step.key} className="flex min-w-0 flex-1 items-start">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                  current &&
                    !isCompleted &&
                    "border-amber-400/50 bg-amber-400/15 ring-4 ring-amber-400/10",
                  current &&
                    isCompleted &&
                    "border-emerald-400/50 bg-emerald-400/15 ring-4 ring-emerald-400/10",
                  reached &&
                    !current &&
                    "border-emerald-400/40 bg-emerald-400/10",
                  !reached && "border-white/[0.12] bg-white/[0.03]",
                )}
              >
                {reached && !current ? (
                  <Check className="h-3.5 w-3.5 text-emerald-300/80" />
                ) : (
                  <CircleDot
                    className={cn(
                      "h-3 w-3",
                      current && !isCompleted && "text-amber-200",
                      current && isCompleted && "text-emerald-200",
                      !current && !reached && "text-white/30",
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-center text-[11px] font-medium uppercase tracking-[0.12em]",
                  reached ? "text-white/80" : "text-white/35",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mt-[17px] h-px flex-1",
                  index < currentIndex ? "bg-emerald-300/40" : "bg-white/8",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
