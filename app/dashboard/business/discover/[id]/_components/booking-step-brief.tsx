import { useEffect, useMemo, useRef, useState } from "react";
import { Check, MapPin, Pencil, X } from "lucide-react";
import {
  BOOKING_OBJECTIVES,
  BOOKING_TIMING_OPTIONS,
  shouldShowEventName,
  type BookingObjective,
  type BookingTimingMode,
} from "@/lib/booking";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar32 } from "@/components/ui/calendar-picker-in-a-drawer";
import type { BookingForm } from "./use-booking-form";
import { BookingSelect } from "./booking-step-package";

interface BookingStepBriefProps {
  form: BookingForm;
}

export function BookingStepBrief({ form }: BookingStepBriefProps) {
  const objectiveItems = useMemo(
    () =>
      BOOKING_OBJECTIVES.map((o) => ({
        id: o.value,
        name: o.label,
        description: o.description,
      })),
    [],
  );
  const timingItems = useMemo(
    () =>
      BOOKING_TIMING_OPTIONS.map((t) => ({
        id: t.value,
        name: t.label,
        description: t.description,
      })),
    [],
  );

  return (
    <>
      <BookingSelect
        heading="What's this for?"
        items={objectiveItems}
        selectedId={form.objective}
        onSelect={(id) => form.setObjective(id as BookingObjective)}
      />
      {shouldShowEventName(form.objective) ? (
        <VenueAddressCard form={form} />
      ) : null}
      <BookingSelect
        heading="When do you need it?"
        items={timingItems}
        selectedId={form.timingMode}
        onSelect={(id) => form.setTimingMode(id as BookingTimingMode)}
      >
        {form.timingMode === "choose_date" ? (
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/3 p-4">
            <Calendar32
              id="due-date"
              label="Select date"
              value={form.dueDate}
              onChange={form.setDueDate}
            />
          </div>
        ) : null}
      </BookingSelect>
      {form.requiresContactInput || form.requiresPhoneInput ? (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Contact for booking
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Only shown because we are missing a contact field.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
              <Label className="text-xs uppercase tracking-[0.18em] text-white/45">
                Email
              </Label>
              {form.requiresContactInput ? (
                <Input
                  type="email"
                  value={form.contactEmailDraft}
                  onChange={(e) => form.setContactEmailDraft(e.target.value)}
                  placeholder="you@brand.com"
                  className="mt-2 h-10"
                  required
                />
              ) : (
                <p className="mt-2 font-medium text-white">
                  {form.contactEmail}
                </p>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/3 p-4">
              <Label className="text-xs uppercase tracking-[0.18em] text-white/45">
                Phone
              </Label>
              {form.requiresPhoneInput ? (
                <Input
                  value={form.contactPhoneDraft}
                  onChange={(e) => form.setContactPhoneDraft(e.target.value)}
                  placeholder="Optional phone number"
                  className="mt-2 h-10"
                />
              ) : (
                <p className="mt-2 font-medium text-white">
                  {form.contactPhone}
                </p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

function VenueAddressCard({ form }: { form: BookingForm }) {
  const [editing, setEditing] = useState(!form.venueAddressDraft);
  const [draft, setDraft] = useState(form.venueAddressDraft);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const startEdit = () => {
    setDraft(form.venueAddressDraft);
    setEditing(true);
  };

  const save = () => {
    form.setVenueAddress(draft.trim());
    setEditing(false);
  };

  const cancel = () => {
    setDraft(form.venueAddressDraft);
    setEditing(false);
  };

  if (editing) {
    return (
      <section className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
        <MapPin className="mt-3 h-4 w-4 shrink-0 text-white/50" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-medium text-white">Venue address</p>
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  save();
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  cancel();
                }
              }}
              placeholder="Street, area, city, pincode"
              className="h-9 flex-1"
            />
            <button
              type="button"
              onClick={save}
              disabled={!draft.trim()}
              aria-label="Save address"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"
            >
              <Check className="h-4 w-4" />
            </button>
            {form.venueAddressDraft ? (
              <button
                type="button"
                onClick={cancel}
                aria-label="Cancel"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-white/65 transition hover:bg-white/8 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/3 px-4 py-3">
      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">Venue address</p>
        <p className="mt-0.5 truncate text-xs text-white/50">
          {form.venueAddressDraft ||
            "Add your business address in your profile to continue."}
        </p>
      </div>
      <button
        type="button"
        onClick={startEdit}
        aria-label="Edit venue address"
        className="shrink-0 rounded-full p-1.5 text-white/55 transition hover:bg-white/8 hover:text-white"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </section>
  );
}
