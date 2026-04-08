import {
  CONTENT_STYLES,
  getPackageLabel,
  shouldShowEventName,
  type InfluencerProfile,
} from "@/lib/booking";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import type { BookingForm } from "./use-booking-form";

interface BookingStepReviewProps {
  form: BookingForm;
  creator: InfluencerProfile;
}

export function BookingStepReview({ form, creator }: BookingStepReviewProps) {
  if (!form.selectedPackageData) return null;

  return (
    <div className="space-y-4 rounded-[20px] border border-white/10 bg-white/4 p-5">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
            {form.objectiveLabel}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            {getPackageLabel(form.selectedPackageData.key)} ·{" "}
            {creator.display_name ?? "Creator"}
          </p>
          <p className="text-sm text-white/50">
            {form.timingMode === "choose_date" && form.dueDate
              ? `Needed by ${form.dueDate}`
              : form.timingLabel}
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
          Your selections
        </p>
        <div className="space-y-2 text-sm text-white/65">
          <div className="flex items-start justify-between gap-3">
            <span className="text-white/45">Package</span>
            <span className="text-right">
              {getPackageLabel(form.selectedPackageData.key)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-white/45">What to feature</span>
            <span className="text-right">{form.focusText || "—"}</span>
          </div>
          {shouldShowEventName(form.objective) ? (
            <div className="flex items-start justify-between gap-3">
              <span className="text-white/45">Event/Venue</span>
              <span className="text-right">{form.eventName || "—"}</span>
            </div>
          ) : null}
          <div className="flex items-start justify-between gap-3">
            <span className="text-white/45">Content style</span>
            <span className="text-right">
              {form.contentStyles[0]
                ? (CONTENT_STYLES.find(
                    (style) => style.value === form.contentStyles[0],
                  )?.label ?? "—")
                : "—"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-white/45">Timing</span>
            <span className="text-right">
              {form.timingMode === "choose_date" && form.dueDate
                ? `${form.timingLabel} · ${form.dueDate}`
                : form.timingLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-4">
        <div className="flex justify-between text-sm text-white/60">
          <span>{getPackageLabel(form.selectedPackageData.key)}</span>
          <span>₹{form.selectedPackageData.price.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between text-sm text-white/60">
          <span>Platform fee ({Math.round(PLATFORM_FEE_RATE * 100)}%)</span>
          <span>₹{form.platformFee.toLocaleString("en-IN")}</span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-white">
          <span>Pre-authorization amount</span>
          <span>₹{form.totalIfAccepted.toLocaleString("en-IN")}</span>
        </div>
      </div>
    </div>
  );
}
