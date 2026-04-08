import { useMemo } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";
import {
  BOOKING_OBJECTIVES,
  BOOKING_TIMING_OPTIONS,
  CONTENT_STYLES,
  OBJECTIVE_PLACEHOLDERS,
  shouldShowEventName,
  type BookingObjective,
  type BookingTimingMode,
  type ContentStyle,
} from "@/lib/booking";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Workspace } from "@/components/ui/workspaces";
import type { BookingForm } from "./use-booking-form";
import { BookingDropdown } from "./booking-step-package";

interface BookingStepBriefProps {
  form: BookingForm;
}

export function BookingStepBrief({ form }: BookingStepBriefProps) {
  const objectiveItems = useMemo(
    () =>
      BOOKING_OBJECTIVES.filter((o) => o.value !== "ugc").map((o) => ({
        id: o.value,
        name: o.label,
        description: o.description,
      })),
    [],
  );
  const contentStyleItems = useMemo(
    () => CONTENT_STYLES.map((s) => ({ id: s.value, name: s.label })),
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
      <BookingDropdown
        heading="What's this for?"
        label="Objective"
        items={objectiveItems}
        selectedId={form.objective}
        onSelect={(ws: Workspace) =>
          form.setObjective(ws.id as BookingObjective)
        }
      />
      <section className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <Label htmlFor="focus-text" className="text-white/80">
          What should they show?
        </Label>
        <Input
          id="focus-text"
          value={form.focusText}
          onChange={(e) => form.setFocusText(e.target.value.slice(0, 120))}
          placeholder={OBJECTIVE_PLACEHOLDERS[form.objective]}
          className="h-10"
          required
        />
        <p className="text-right text-xs text-white/30">
          {form.focusText.length}/120
        </p>
      </section>
      {shouldShowEventName(form.objective) ? (
        <section className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <Label htmlFor="event-name" className="text-white/80">
            Where?
          </Label>
          <Input
            id="event-name"
            value={form.eventName}
            onChange={(e) => form.setEventName(e.target.value)}
            placeholder="e.g. Cafe Drifter, Indiranagar"
            className="h-10"
            required
          />
        </section>
      ) : null}
      <BookingDropdown
        heading="Content style"
        label="Content style"
        items={contentStyleItems}
        selectedId={form.contentStyles[0]}
        onSelect={(ws: Workspace) =>
          form.setContentStyles([ws.id as ContentStyle])
        }
      />
      <BookingDropdown
        heading="When do you need it?"
        label="Timing"
        items={timingItems}
        selectedId={form.timingMode}
        onSelect={(ws: Workspace) =>
          form.setTimingMode(ws.id as BookingTimingMode)
        }
      >
        {form.timingMode === "choose_date" ? (
          <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <Label htmlFor="due-date" className="text-white/80">
              Select date
            </Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
              <Input
                id="due-date"
                type="date"
                value={form.dueDate}
                onChange={(e) => form.setDueDate(e.target.value)}
                className="h-10 pl-10"
              />
            </div>
          </div>
        ) : null}
      </BookingDropdown>
      <section className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Brand can repost?</p>
          <p className="text-xs text-white/40">
            {form.usageRights
              ? "Creator grants repost rights"
              : "Creator-only — no brand repost"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.usageRights}
          onClick={() => form.setUsageRights((v) => !v)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${form.usageRights ? "bg-white" : "bg-white/20"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform ${form.usageRights ? "translate-x-5 bg-black" : "translate-x-0 bg-white/60"}`}
          />
        </button>
      </section>
      <section className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
          <button
            type="button"
            onClick={() => form.setShowDetails((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="text-sm font-medium text-white">
              + Add details
            </span>
            <ChevronDown
              className={`h-4 w-4 text-white/60 transition-transform ${form.showDetails ? "rotate-180" : ""}`}
            />
          </button>
          {form.showDetails ? (
            <div className="space-y-4 border-t border-white/10 p-4">
              <div className="space-y-2">
                <Label htmlFor="hashtags" className="text-white/80">
                  Tags & mentions
                </Label>
                <Input
                  id="hashtags"
                  value={form.hashtagsMentions}
                  onChange={(e) => form.setHashtagsMentions(e.target.value)}
                  placeholder="#SummerVibes @yourbrand"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta" className="text-white/80">
                  Key message or CTA
                </Label>
                <Input
                  id="cta"
                  value={form.ctaMessage}
                  onChange={(e) =>
                    form.setCtaMessage(e.target.value.slice(0, 100))
                  }
                  placeholder="e.g. Use code SUMMER20, Link in bio..."
                  className="h-10"
                />
              </div>
            </div>
          ) : null}
        </div>
      </section>
      {form.requiresContactInput || form.requiresPhoneInput ? (
        <section className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Contact for booking
            </h2>
            <p className="mt-1 text-sm text-white/50">
              Only shown because we are missing a contact field.
            </p>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
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
