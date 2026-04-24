import { useState, type ReactNode } from "react";
import { Check, ChevronDown, CircleAlert } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getAvailablePackages, type BookablePackage } from "@/lib/booking";
import { Button } from "@/components/ui/button";

export interface BookingSelectItem {
  id: string;
  name: string;
  description?: string;
}

interface BookingSelectProps {
  heading: string;
  items: BookingSelectItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  children?: ReactNode;
}

export function BookingSelect({
  heading,
  items,
  selectedId,
  onSelect,
  children,
}: BookingSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.id === selectedId) ?? items[0];

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
        {heading}
      </h2>
      <div className="overflow-hidden rounded-[22px] border border-white/10 bg-white/4 shadow-[0_16px_32px_rgba(0,0,0,0.18)]">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-white/6"
        >
          <p className="min-w-0 truncate text-sm font-medium text-white">
            {selected?.name ?? ""}
          </p>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-white/55 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>
        {open ? (
          <div className="border-t border-white/8 p-1">
            {items.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelect(item.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isSelected ? "bg-white/10" : "hover:bg-white/6"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">
                      {item.name}
                    </p>
                    {item.description ? (
                      <p className="mt-0.5 text-xs text-white/50">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  {isSelected ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

interface BookingStepPackageProps {
  isProfileComplete: boolean;
  availablePackages: ReturnType<typeof getAvailablePackages>;
  selectedPackage: BookablePackage;
  onPackageChange: (pkg: BookablePackage) => void;
}

export function BookingStepPackage({
  isProfileComplete,
  availablePackages,
  selectedPackage,
  onPackageChange,
}: BookingStepPackageProps) {
  const canStart = isProfileComplete && availablePackages.length > 0;

  return (
    <>
      {!isProfileComplete ? (
        <div className="space-y-3 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-4 w-4 text-yellow-200" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">
                Complete your business profile first
              </p>
              <p className="text-sm text-white/65">
                We only need your brand details once, then future bookings stay
                faster.
              </p>
            </div>
          </div>
          <Button variant="outline" asChild className="w-full">
            <Link href="/dashboard/business/profile">
              Complete business profile
            </Link>
          </Button>
        </div>
      ) : null}
      {!availablePackages.length ? (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-white/3 p-4">
          <p className="text-sm font-medium text-white">
            This creator has no bookable package pricing yet.
          </p>
          <p className="text-sm text-white/60">
            Come back once their pricing is available.
          </p>
        </div>
      ) : null}
      {canStart ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
            What you need
          </h2>
          <div
            className="grid gap-2"
            style={{
              gridTemplateColumns: `repeat(${Math.min(availablePackages.length, 3)}, 1fr)`,
            }}
          >
            {availablePackages.map((item) => {
              const active = selectedPackage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onPackageChange(item.key)}
                  className={`rounded-2xl border px-3 py-3 text-center transition ${
                    active
                      ? "border-primary/50 bg-primary text-primary-foreground"
                      : "border-white/10 bg-white/3 text-white hover:bg-white/6"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${active ? "text-primary-foreground" : "text-white"}`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`mt-1 text-lg font-semibold ${active ? "text-black" : "text-white"}`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <Image
                        src="/coin.png"
                        alt="Price"
                        width={18}
                        height={18}
                        className="h-4.5 w-4.5 object-contain"
                      />
                      {item.price.toLocaleString("en-IN")}
                    </span>
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}
