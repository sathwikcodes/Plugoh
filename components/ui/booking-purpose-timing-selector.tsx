import { useState, type ReactNode } from "react";
import { Check, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThreeDPill } from "@/components/ui/3d-pill";

export interface PurposeOption {
  id: string;
  label: string;
  description?: string;
}

export interface TimeOption {
  id: string;
  label: string;
  description?: string;
}

interface BookingPurposeTimingSelectorProps {
  purposes: PurposeOption[];
  selectedPurposeId: string;
  onPurposeSelect: (id: string) => void;
  times: TimeOption[];
  selectedTimeId: string;
  onTimeSelect: (id: string) => void;
  timeChildren?: ReactNode;
}

export function BookingPurposeTimingSelector({
  purposes,
  selectedPurposeId,
  onPurposeSelect,
  times,
  selectedTimeId,
  onTimeSelect,
  timeChildren,
}: BookingPurposeTimingSelectorProps) {
  const [tab, setTab] = useState<"purpose" | "time">("purpose");

  return (
    <section className="space-y-3">
      <div className="rounded-full border border-white/10 bg-white/5 p-1.5">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab("purpose")}
            className="flex w-full justify-center"
          >
            {tab === "purpose" ? (
              <ThreeDPill
                label="Purpose"
                color="gold"
                className="three-d-pill--md three-d-pill--no-glow w-full justify-center"
              />
            ) : (
              <span className="inline-flex h-10 w-full items-center justify-center rounded-full px-3 text-sm font-semibold text-white/70 transition hover:text-white">
                Purpose
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("time")}
            className="flex w-full justify-center"
          >
            {tab === "time" ? (
              <ThreeDPill
                label="Timeline"
                color="gold"
                className="three-d-pill--md three-d-pill--no-glow w-full justify-center"
              />
            ) : (
              <span className="inline-flex h-10 w-full items-center justify-center rounded-full px-3 text-sm font-semibold text-white/70 transition hover:text-white">
                Timeline
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === "purpose" ? (
        <div className="max-h-[36dvh] space-y-2 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible sm:pr-0">
          {purposes.map((item) => {
            const isActive = selectedPurposeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onPurposeSelect(item.id);
                  setTab("time");
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition",
                  isActive
                    ? "border-white/55 bg-white/12"
                    : "border-white/10 bg-white/3 hover:bg-white/7",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs text-white/55">{item.description}</p>
                  ) : null}
                </div>
                <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full transition" style={isActive ? { background: "white" } : { border: "1px solid rgba(255,255,255,0.35)" }}>
                  {isActive ? <Check className="h-3 w-3 text-black" /> : null}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="max-h-[36dvh] space-y-2 overflow-y-auto pr-1 sm:max-h-none sm:overflow-visible sm:pr-0">
          {times.map((item) => {
            const isActive = selectedTimeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTimeSelect(item.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
                  isActive
                    ? "border-white/55 bg-white/12"
                    : "border-white/10 bg-white/3 hover:bg-white/7",
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 grid shrink-0 place-items-center transition",
                    isActive
                      ? "h-9 w-9"
                      : "h-5 w-5 rounded-full border border-white/35 text-transparent",
                  )}
                >
                  {isActive ? (
                    <ThreeDPill
                      label="selected"
                      icon={<Check className="h-3.5 w-3.5 text-[#0d0b0f]" />}
                      className="three-d-pill--circle"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  {item.description ? (
                    <p className="mt-0.5 text-xs text-white/55">{item.description}</p>
                  ) : null}
                </div>
                {item.id === "asap" ? (
                  <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
                ) : null}
              </button>
            );
          })}
          {timeChildren}
        </div>
      )}
    </section>
  );
}