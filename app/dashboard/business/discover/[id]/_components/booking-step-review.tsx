import Image from "next/image";
import {
  getPackageLabel,
  shouldShowEventName,
  type InfluencerProfile,
} from "@/lib/booking";
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-xs text-white/35">{label}</span>
      <span className="text-right text-xs font-medium text-white/80">{value}</span>
    </div>
  );
}

function Perforation() {
  return (
    <div className="relative flex items-center">
      <div className="-ml-6 h-5 w-5 shrink-0 rounded-full bg-[#0d0b0f]" />
      <div className="flex-1 border-t border-dashed border-white/10" />
      <div className="-mr-6 h-5 w-5 shrink-0 rounded-full bg-[#0d0b0f]" />
    </div>
  );
}

export function BookingStepReview({ form, creator }: BookingStepReviewProps) {
  if (!form.selectedPackageData) return null;

  const timingValue =
    form.timingMode === "choose_date" && form.dueDate
      ? formatDueDate(form.dueDate)
      : "ASAP";

  const avatarUrl = creator.ig_profile_picture_url;
  const initial = (creator.display_name ?? "C").charAt(0).toUpperCase();
  const handle = creator.instagram_handle ?? creator.ig_username;

  return (
    <div className="relative">
      {/* Stacked layers for 3D depth */}
      <div className="absolute inset-x-4 -bottom-2 h-full rounded-[20px] border border-white/5 bg-white/[0.015]" />
      <div className="absolute inset-x-2 -bottom-1 h-full rounded-[22px] border border-white/6 bg-white/[0.025]" />

      {/* Main receipt card */}
      <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[#161616] shadow-[0_20px_50px_rgba(0,0,0,0.7)]">

        {/* Creator header */}
        <div className="flex items-center gap-3.5 px-6 py-5">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-1 ring-white/12">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={creator.display_name ?? "Creator"}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/8 text-sm font-bold text-white/50">
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">
              {creator.display_name ?? "Creator"}
            </p>
            {handle ? (
              <p className="text-xs text-white/35">@{handle}</p>
            ) : null}
          </div>
        </div>

        <Perforation />

        {/* Booking rows */}
        <div className="divide-y divide-white/[0.06] px-6">
          <Row label="Package" value={getPackageLabel(form.selectedPackageData.key)} />
          <Row label="Objective" value={form.objectiveLabel} />
          {shouldShowEventName(form.objective) && form.venueAddress ? (
            <Row label="Venue" value={form.venueAddress} />
          ) : null}
          <Row label="Need by" value={timingValue} />
          {form.contactEmail ? (
            <Row label="Booked by" value={form.contactEmail} />
          ) : null}
        </div>

        <Perforation />

        {/* Amount */}
        <div className="flex items-center justify-between gap-3 px-6 py-5">
          <p className="text-sm text-white/45">Pre-authorised hold</p>
          <div className="flex items-center gap-1.5">
            <Image
              src="/coin.png"
              alt="Amount"
              width={16}
              height={16}
              className="h-4 w-4 object-contain"
            />
            <span className="text-2xl font-bold tabular-nums text-white">
              {form.totalIfAccepted.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
