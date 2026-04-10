import { CircleDot } from "lucide-react";
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

function StatusTimeline({ status }: { status: string }) {
  if (TERMINAL_STATUSES.has(status)) {
    const labels: Record<string, string> = {
      declined: "You declined this offer",
      rejected: "Offer declined",
      expired: "Offer window expired",
      cancelled: "Booking cancelled",
      refunded: "Refunded",
    };
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-rose-300/20 bg-rose-300/8 px-4 py-3">
        <CircleDot className="h-4 w-4 shrink-0 text-rose-300/70" />
        <div>
          <p className="text-sm font-medium capitalize text-white">
            {status.replaceAll("_", " ")}
          </p>
          <p className="text-xs text-white/50">
            {labels[status] ?? "This campaign did not move forward."}
          </p>
        </div>
      </div>
    );
  }

  const isLegacy = status === "requested" || status === "payment_pending";
  const steps = isLegacy ? LEGACY_STEPS : STATUS_STEPS;
  const currentIndex = steps.findIndex((step) => step.key === status);
  const reachedTone = status === "completed" ? "success" : "active";

  return (
    <div className="flex items-center overflow-x-auto">
      {steps.map((step, index) => {
        const reached = index <= currentIndex;
        const current = index === currentIndex;
        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border transition-colors sm:h-8 sm:w-8",
                  reached
                    ? reachedTone === "success"
                      ? "border-green-300/30 bg-green-300/15"
                      : "border-yellow-300/30 bg-yellow-300/15"
                    : "border-white/10 bg-white/[0.04]",
                )}
              >
                <CircleDot
                  className={cn(
                    "h-3 w-3 sm:h-3.5 sm:w-3.5",
                    current
                      ? reachedTone === "success"
                        ? "text-green-200"
                        : "text-yellow-200"
                      : reached
                        ? reachedTone === "success"
                          ? "text-green-200/60"
                          : "text-yellow-200/60"
                        : "text-white/30",
                  )}
                />
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium uppercase tracking-[0.14em] sm:text-[10px]",
                  reached ? "text-white/80" : "text-white/35",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-2 mb-4 h-px w-6 sm:w-14",
                  index < currentIndex
                    ? reachedTone === "success"
                      ? "bg-green-300/45"
                      : "bg-yellow-300/45"
                    : "bg-white/10",
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
      <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-white/35">
        Progress
      </p>
      <StatusTimeline status={status} />
    </div>
  );
}
