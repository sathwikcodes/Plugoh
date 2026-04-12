import Image from "next/image";
import {
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

function formatDueDate(value: string) {
  if (!value) return "ASAP";
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;

  const localDate = new Date(year, month - 1, day);
  return localDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function BookingStepReview({ form, creator }: BookingStepReviewProps) {
  if (!form.selectedPackageData) return null;

  const timingValue =
    form.timingMode === "choose_date" && form.dueDate
      ? formatDueDate(form.dueDate)
      : "ASAP";

  return (
    <div className="space-y-4 rounded-[20px] border border-white/10 bg-white/4 p-5">
      <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
          Booking details
        </p>
        <div className="space-y-2 text-sm text-white/65">
          <div className="flex items-start justify-between gap-3">
            <span className="text-white/45">Creator</span>
            <span className="text-right">
              {creator.display_name ?? "Creator"}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-white/45">Package</span>
            <span className="text-right">
              {getPackageLabel(form.selectedPackageData.key)}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-white/45">Objective</span>
            <span className="text-right">{form.objectiveLabel}</span>
          </div>
          {shouldShowEventName(form.objective) && form.venueAddress ? (
            <div className="flex items-start justify-between gap-3">
              <span className="text-white/45">Venue</span>
              <span className="text-right">{form.venueAddress}</span>
            </div>
          ) : null}
          <div className="flex items-start justify-between gap-3">
            <span className="text-white/45">Need by</span>
            <span className="text-right">{timingValue}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-4">
        <div className="flex justify-between text-sm text-white/60">
          <span>{getPackageLabel(form.selectedPackageData.key)}</span>
          <span className="inline-flex items-center gap-1.5">
            <Image
              src="/coin.png"
              alt="Price"
              width={14}
              height={14}
              className="h-3.5 w-3.5 object-contain"
            />
            {form.selectedPackageData.price.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between text-sm text-white/60">
          <span>Platform fee ({Math.round(PLATFORM_FEE_RATE * 100)}%)</span>
          <span className="inline-flex items-center gap-1.5">
            <Image
              src="/coin.png"
              alt="Platform fee"
              width={14}
              height={14}
              className="h-3.5 w-3.5 object-contain"
            />
            {form.platformFee.toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-white">
          <span>Pre-authorization amount</span>
          <span className="inline-flex items-center gap-1.5">
            <Image
              src="/coin.png"
              alt="Pre-authorization amount"
              width={14}
              height={14}
              className="h-3.5 w-3.5 object-contain"
            />
            {form.totalIfAccepted.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}
