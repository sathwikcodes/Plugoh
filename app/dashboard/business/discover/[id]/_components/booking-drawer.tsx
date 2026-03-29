"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import {
  BOOKING_OBJECTIVES,
  BOOKING_TIMING_OPTIONS,
  buildCampaignBrief,
  buildCampaignTitle,
  getAvailablePackages,
  getPackageLabel,
  shouldShowEventName,
  type BookingFormState,
  type BookingObjective,
  type BookingTimingMode,
  type BookablePackage,
  type InfluencerProfile,
} from "@/lib/booking";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

const DEFAULT_OBJECTIVE: BookingObjective = "product_launch";
const DEFAULT_TIMING: BookingTimingMode = "asap";

interface BookingDrawerProps {
  creator: InfluencerProfile;
  initialPackage: BookablePackage | null;
  isProfileComplete: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitialPackage(
  packageSeed: BookablePackage | null,
  availablePackages: ReturnType<typeof getAvailablePackages>,
): BookablePackage {
  if (
    packageSeed &&
    availablePackages.some((item) => item.key === packageSeed)
  ) {
    return packageSeed;
  }

  return availablePackages[0]?.key ?? "reel";
}

export function BookingDrawer({
  creator,
  initialPackage,
  isProfileComplete,
  open,
  onOpenChange,
}: BookingDrawerProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile: businessProfile } = useAuth();

  const availablePackages = useMemo(
    () => getAvailablePackages(creator),
    [creator],
  );

  const [objective, setObjective] =
    useState<BookingObjective>(DEFAULT_OBJECTIVE);
  const [selectedPackage, setSelectedPackage] = useState<BookablePackage>(
    getInitialPackage(initialPackage, availablePackages),
  );
  const [timingMode, setTimingMode] =
    useState<BookingTimingMode>(DEFAULT_TIMING);
  const [dueDate, setDueDate] = useState("");
  const [focusText, setFocusText] = useState("");
  const [eventName, setEventName] = useState("");
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [contactEmailDraft, setContactEmailDraft] = useState("");
  const [contactPhoneDraft, setContactPhoneDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    setObjective(DEFAULT_OBJECTIVE);
    setSelectedPackage(getInitialPackage(initialPackage, availablePackages));
    setTimingMode(DEFAULT_TIMING);
    setDueDate("");
    setFocusText("");
    setEventName("");
    setNotes("");
    setShowNotes(false);
    setContactEmailDraft("");
    setContactPhoneDraft("");
    setSubmitting(false);
  }, [availablePackages, creator.id, initialPackage, open]);

  const selectedPackageData =
    availablePackages.find((item) => item.key === selectedPackage) ??
    availablePackages[0] ??
    null;

  const contactEmail =
    businessProfile?.email?.trim() || contactEmailDraft.trim();
  const contactPhone =
    businessProfile?.phone?.trim() || contactPhoneDraft.trim();
  const requiresContactInput = !businessProfile?.email?.trim();
  const requiresPhoneInput = !businessProfile?.phone?.trim();

  const currentFormState: BookingFormState | null =
    selectedPackageData && user
      ? {
          objective,
          packageType: selectedPackageData.key,
          timingMode,
          dueDate,
          focusText,
          eventName,
          notes,
          contactEmail,
          contactPhone,
        }
      : null;

  const generatedTitle =
    currentFormState && selectedPackageData
      ? buildCampaignTitle(currentFormState, creator)
      : "Campaign";
  const timingLabel =
    BOOKING_TIMING_OPTIONS.find((item) => item.value === timingMode)?.label ??
    "Timing";
  const objectiveLabel =
    BOOKING_OBJECTIVES.find((item) => item.value === objective)?.label ??
    "Booking";

  const canStartBooking = isProfileComplete && availablePackages.length > 0;

  const handlePayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !selectedPackageData || !currentFormState) {
      toast({
        title: "Please sign in again",
        description: "Your session needs to be refreshed before payment.",
        variant: "destructive",
      });
      return;
    }

    if (timingMode === "choose_date" && !dueDate) {
      toast({
        title: "Choose a delivery date",
        description:
          "Pick an exact deadline so the creator knows the timeline.",
        variant: "destructive",
      });
      return;
    }

    if (!contactEmail) {
      toast({
        title: "Email required",
        description:
          "Add a contact email so the creator can reach you if needed.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Please sign in again");
      }

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          amount: selectedPackageData.price,
          receipt: `r_${user.id.slice(0, 8)}_${Date.now()}`,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error ?? "Failed to create order");
      }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Plugoh",
        description: generatedTitle,
        order_id: orderData.orderId,
        prefill: {
          email: contactEmail,
          contact: contactPhone,
        },
        theme: { color: "#0f172a" },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              campaignData: {
                influencer_id: creator.user_id,
                influencer_profile_id: creator.id,
                title: generatedTitle,
                brief: buildCampaignBrief(currentFormState),
                package_type: selectedPackageData.key,
                price_offered: selectedPackageData.price,
                business_contact_email: contactEmail,
                business_contact_phone: contactPhone || null,
              },
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            toast({
              title: "Payment verification failed",
              description:
                verifyData.error ?? "Your payment could not be finalized.",
              variant: "destructive",
            });
            setSubmitting(false);
            return;
          }

          toast({
            title: "Booking confirmed",
            description: "Your request has been sent to the creator.",
          });
          onOpenChange(false);

          if (verifyData.campaignId) {
            router.push(
              `/dashboard/business/inbox?chat=${verifyData.campaignId}`,
            );
          } else {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      rzp.open();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Could not start payment",
        description: message,
        variant: "destructive",
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={open}
        onOpenChange={(nextOpen) => {
          if (submitting) return;
          onOpenChange(nextOpen);
        }}
      >
        <DrawerContent className="ml-auto flex h-[92vh] max-h-[92vh] min-h-0 flex-col overflow-hidden rounded-t-[28px] border-white/10 bg-[linear-gradient(180deg,rgba(10,14,26,0.985),rgba(6,9,18,0.97))] text-white shadow-2xl md:h-dvh md:max-h-dvh md:w-[min(440px,92vw)] md:max-w-none md:rounded-none">
          <DrawerHeader className="shrink-0 border-b border-white/10 bg-black/30 px-5 py-4 md:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <DrawerTitle className="text-xl font-semibold text-white">
                  Complete booking
                </DrawerTitle>
                <DrawerDescription className="mt-1 truncate text-sm text-white/55">
                  {creator.display_name || "Creator"} • fixed package checkout
                </DrawerDescription>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
                className="h-9 w-9 shrink-0 rounded-full text-white/65 hover:bg-white/8 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-5 p-5 pb-28 md:p-6 md:pb-32">
              {!isProfileComplete ? (
                <div className="space-y-3 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <CircleAlert className="mt-0.5 h-4 w-4 text-yellow-200" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-white">
                        Complete your business profile first
                      </p>
                      <p className="text-sm text-white/65">
                        We only need your brand details once, then future
                        bookings stay much faster.
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
                <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm font-medium text-white">
                    This creator has no bookable package pricing yet.
                  </p>
                  <p className="text-sm text-white/60">
                    Come back once their pricing is available.
                  </p>
                </div>
              ) : null}

              {canStartBooking ? (
                <form
                  id="booking-drawer-form"
                  onSubmit={handlePayment}
                  className="space-y-5"
                >
                  <section className="space-y-3">
                    <div className="space-y-1">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                        Booking type
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {BOOKING_OBJECTIVES.map((item) => {
                        const active = objective === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setObjective(item.value)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              active
                                ? "border-white/30 bg-white text-black"
                                : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm font-medium ${
                                  active ? "text-black" : "text-white"
                                }`}
                              >
                                {item.shortLabel}
                              </p>
                              {active ? (
                                <Check
                                  className={`h-4 w-4 ${
                                    active ? "text-black" : "text-white"
                                  }`}
                                />
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                      Package
                    </h2>
                    <div className="grid gap-2">
                      {availablePackages.map((item) => {
                        const active = selectedPackageData?.key === item.key;
                        return (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setSelectedPackage(item.key)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              active
                                ? "border-white/30 bg-white text-black"
                                : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p
                                  className={`font-medium ${
                                    active ? "text-black" : "text-white"
                                  }`}
                                >
                                  {item.label}
                                </p>
                                <p
                                  className={`mt-0.5 text-xs ${
                                    active ? "text-black/70" : "text-white/50"
                                  }`}
                                >
                                  {item.description}
                                </p>
                              </div>
                              {active ? (
                                <Check
                                  className={`h-4 w-4 ${
                                    active ? "text-black" : "text-white"
                                  }`}
                                />
                              ) : null}
                            </div>
                            <p
                              className={`mt-3 text-xl font-semibold ${
                                active ? "text-black" : "text-white"
                              }`}
                            >
                              ₹{item.price.toLocaleString()}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                      Timing
                    </h2>
                    <div className="grid grid-cols-3 gap-2">
                      {BOOKING_TIMING_OPTIONS.map((item) => {
                        const active = timingMode === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setTimingMode(item.value)}
                            className={`rounded-2xl border px-3 py-3 text-left transition ${
                              active
                                ? "border-white/30 bg-white text-black"
                                : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm font-medium ${
                                  active ? "text-black" : "text-white"
                                }`}
                              >
                                {item.label}
                              </p>
                              {active ? (
                                <Check
                                  className={`h-4 w-4 ${
                                    active ? "text-black" : "text-white"
                                  }`}
                                />
                              ) : null}
                            </div>
                            <p
                              className={`mt-1 text-xs ${
                                active ? "text-black/70" : "text-white/45"
                              }`}
                            >
                              {item.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {timingMode === "choose_date" ? (
                      <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <Label htmlFor="due-date" className="text-white/80">
                          Select date
                        </Label>
                        <div className="relative">
                          <CalendarDays className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
                          <Input
                            id="due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="h-10 pl-10"
                          />
                        </div>
                      </div>
                    ) : null}
                  </section>

                  {shouldShowEventName(objective) ? (
                    <section className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <Label htmlFor="event-name" className="text-white/80">
                        Venue or event name
                      </Label>
                      <Input
                        id="event-name"
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="Optional, if it helps the creator prepare"
                        className="h-10"
                      />
                    </section>
                  ) : null}

                  <section className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
                      <button
                        type="button"
                        onClick={() => setShowNotes((value) => !value)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left"
                      >
                        <span className="font-medium text-white">
                          Add optional notes
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-white/60 transition-transform ${
                            showNotes ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {showNotes ? (
                        <div className="border-t border-white/10 p-4">
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Anything quick the creator should know"
                            rows={3}
                          />
                        </div>
                      ) : null}
                    </div>
                  </section>

                  {requiresContactInput || requiresPhoneInput ? (
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
                          {requiresContactInput ? (
                            <Input
                              type="email"
                              value={contactEmailDraft}
                              onChange={(e) =>
                                setContactEmailDraft(e.target.value)
                              }
                              placeholder="you@brand.com"
                              className="mt-2 h-10"
                              required
                            />
                          ) : (
                            <p className="mt-2 font-medium text-white">
                              {contactEmail}
                            </p>
                          )}
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <Label className="text-xs uppercase tracking-[0.18em] text-white/45">
                            Phone
                          </Label>
                          {requiresPhoneInput ? (
                            <Input
                              value={contactPhoneDraft}
                              onChange={(e) =>
                                setContactPhoneDraft(e.target.value)
                              }
                              placeholder="Optional phone number"
                              className="mt-2 h-10"
                            />
                          ) : (
                            <p className="mt-2 font-medium text-white">
                              {contactPhone}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>
                  ) : null}
                </form>
              ) : null}
            </div>
          </div>

          <DrawerFooter className="shrink-0 border-t border-white/10 bg-black/75 px-5 py-4 backdrop-blur-xl md:px-6">
            {canStartBooking && selectedPackageData ? (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-white/45">
                      {objectiveLabel}
                    </p>
                    <p className="truncate text-lg font-semibold text-white">
                      {getPackageLabel(selectedPackageData.key)} • ₹
                      {selectedPackageData.price.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      {timingMode === "choose_date" && dueDate
                        ? `Needed by ${dueDate}`
                        : timingLabel}
                    </p>
                  </div>
                </div>
                <Button
                  type="submit"
                  form="booking-drawer-form"
                  size="lg"
                  disabled={submitting}
                  className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting payment
                    </>
                  ) : (
                    "Continue to payment"
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Close
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
