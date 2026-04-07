"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import {
  BOOKING_OBJECTIVES,
  BOOKING_TIMING_OPTIONS,
  CONTENT_STYLES,
  OBJECTIVE_PLACEHOLDERS,
  getAvailablePackages,
  getPackageLabel,
  shouldShowEventName,
  type BookingObjective,
  type BookingTimingMode,
  type BookablePackage,
  type ContentStyle,
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
import {
  Workspaces,
  WorkspaceTrigger,
  WorkspaceContent,
  type Workspace,
} from "@/components/ui/workspaces";
import Link from "next/link";

const DEFAULT_OBJECTIVE: BookingObjective = "product_launch";
const DEFAULT_TIMING: BookingTimingMode = "asap";

interface BookingWorkspace extends Workspace {
  description?: string;
}

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
  const { profile: businessProfile } = useAuth();

  const availablePackages = useMemo(
    () => getAvailablePackages(creator),
    [creator],
  );

  // Step: 1 = booking form, 2 = payment confirmation
  const [step, setStep] = useState<1 | 2>(1);
  const [isPaying, setIsPaying] = useState(false);

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
  const [contentStyles, setContentStyles] = useState<ContentStyle[]>([
    "honest_review",
  ]);
  const [usageRights, setUsageRights] = useState(false);
  const [hashtagsMentions, setHashtagsMentions] = useState("");
  const [ctaMessage, setCtaMessage] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [contactEmailDraft, setContactEmailDraft] = useState("");
  const [contactPhoneDraft, setContactPhoneDraft] = useState("");

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setIsPaying(false);
    setObjective(DEFAULT_OBJECTIVE);
    setSelectedPackage(getInitialPackage(initialPackage, availablePackages));
    setTimingMode(DEFAULT_TIMING);
    setDueDate("");
    setFocusText("");
    setEventName("");
    setContentStyles(["honest_review"]);
    setUsageRights(false);
    setHashtagsMentions("");
    setCtaMessage("");
    setShowDetails(false);
    setContactEmailDraft("");
    setContactPhoneDraft("");
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

  const canStartBooking = isProfileComplete && availablePackages.length > 0;

  const platformFee = selectedPackageData
    ? Math.round(selectedPackageData.price * PLATFORM_FEE_RATE)
    : 0;
  const totalIfAccepted = selectedPackageData
    ? selectedPackageData.price + platformFee
    : 0;

  const timingLabel =
    BOOKING_TIMING_OPTIONS.find((item) => item.value === timingMode)?.label ??
    "Timing";
  const objectiveOptions = useMemo(
    () => BOOKING_OBJECTIVES.filter((item) => item.value !== "ugc"),
    [],
  );
  const objectiveItems = useMemo<BookingWorkspace[]>(
    () =>
      objectiveOptions.map((item) => ({
        id: item.value,
        name: item.label,
        description: item.description,
      })),
    [objectiveOptions],
  );
  const contentStyleItems = useMemo<BookingWorkspace[]>(
    () =>
      CONTENT_STYLES.map((style) => ({
        id: style.value,
        name: style.label,
      })),
    [],
  );
  const timingItems = useMemo<BookingWorkspace[]>(
    () =>
      BOOKING_TIMING_OPTIONS.map((item) => ({
        id: item.value,
        name: item.label,
        description: item.description,
      })),
    [],
  );
  const objectiveLabel =
    BOOKING_OBJECTIVES.find((item) => item.value === objective)?.label ??
    "Booking";

  const renderDropdownTrigger =
    (label: string) => (workspace: Workspace, isOpen: boolean) => (
      <div className="flex w-full items-center justify-between gap-3">
        <div className="min-w-0 text-left">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/45">
            {label}
          </p>
          <p className="mt-1 truncate text-sm font-medium text-white">
            {workspace.name}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-white/55 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>
    );

  const renderWorkspaceRow = (
    workspace: BookingWorkspace,
    isSelected: boolean,
  ) => (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-white">{workspace.name}</p>
        {workspace.description ? (
          <p className="mt-1 text-xs text-white/50">{workspace.description}</p>
        ) : null}
      </div>
      {isSelected ? <Check className="h-4 w-4 text-white" /> : null}
    </div>
  );

  const handleContinueToPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPackageData) return;

    if (!focusText.trim()) {
      toast({
        title: "What should they feature?",
        description:
          "Tell the creator what to highlight — even a few words helps.",
        variant: "destructive",
      });
      return;
    }

    if (shouldShowEventName(objective) && !eventName.trim()) {
      toast({
        title: "Where should they go?",
        description: "Add the venue or event name so the creator can prepare.",
        variant: "destructive",
      });
      return;
    }
    if (timingMode === "choose_date" && !dueDate) {
      toast({
        title: "Choose a delivery date",
        description: "Pick a deadline so the creator knows the timeline.",
        variant: "destructive",
      });
      return;
    }

    if (!contactEmail) {
      toast({
        title: "Email required",
        description: "Add a contact email so the creator can reach you.",
        variant: "destructive",
      });
      return;
    }

    setStep(2);
  };

  const handlePay = async () => {
    if (!selectedPackageData || isPaying) return;
    setIsPaying(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token)
        throw new Error("Session expired — please sign in again");

      // Step 1: Create Razorpay order (pre-auth)
      const orderRes = await fetch("/api/payment/create-booking-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_offered: selectedPackageData.price,
          influencer_profile_id: creator.id,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok)
        throw new Error(orderData.error ?? "Failed to create order");

      // Step 2: Open Razorpay modal
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Plugoh",
        description: `${getPackageLabel(selectedPackageData.key)} · ${creator.display_name ?? "Creator"}`,
        order_id: orderData.orderId,
        prefill: { email: contactEmail, contact: contactPhone },
        theme: { color: "#0f172a" },
        notes: {
          booking_type: "pre_authorization",
          creator: creator.display_name ?? creator.id,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Verify payment + create campaign
          const verifyRes = await fetch("/api/payment/verify-booking-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              influencer_id: creator.user_id,
              influencer_profile_id: creator.id,
              package_type: selectedPackageData.key,
              price_offered: selectedPackageData.price,
              objective,
              timing_mode: timingMode,
              due_date: dueDate || undefined,
              focus_text: focusText,
              event_name: eventName || undefined,
              content_styles: contentStyles,
              usage_rights: usageRights,
              hashtags_mentions: hashtagsMentions || undefined,
              cta_message: ctaMessage || undefined,
              contact_email: contactEmail,
              contact_phone: contactPhone,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            toast({
              title: "Payment verification failed",
              description: verifyData.error,
              variant: "destructive",
            });
            setIsPaying(false);
            return;
          }

          toast({
            title: "Booking sent!",
            description:
              "The creator has 24 hours to accept. You'll only be charged if they do.",
          });
          onOpenChange(false);
          router.push(`/dashboard/business/campaigns/${verifyData.campaignId}`);
        },
        modal: {
          ondismiss: () => setIsPaying(false),
        },
      });

      rzp.open();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast({
        title: "Could not start payment",
        description: message,
        variant: "destructive",
      });
      setIsPaying(false);
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
          if (isPaying) return;
          onOpenChange(nextOpen);
        }}
      >
        <DrawerContent className="ml-auto flex h-[88dvh] max-h-[88dvh] min-h-0 flex-col overflow-hidden rounded-t-[32px] border-t border-white/10 bg-[#151922] text-white shadow-[0_-24px_60px_rgba(0,0,0,0.55)] md:h-dvh md:max-h-dvh md:w-[420px] md:max-w-none md:rounded-none md:border-t-0 md:border-l md:border-white/10 md:shadow-[-28px_0_90px_rgba(0,0,0,0.5)]">
          <DrawerHeader className="shrink-0 border-b border-white/8 px-5 py-4 md:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                {step === 2 ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    disabled={isPaying}
                    className="shrink-0 rounded-full p-1 text-white/60 hover:text-white transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                ) : null}
                <div className="min-w-0">
                  <DrawerTitle className="text-xl font-semibold text-white">
                    {step === 1 ? "Book creator" : "Confirm & pay"}
                  </DrawerTitle>
                  <DrawerDescription className="mt-1 truncate text-sm text-white/55">
                    {step === 1
                      ? `${creator.display_name || "Creator"} · no charge until they accept`
                      : "Pre-authorization only — charged only if accepted"}
                  </DrawerDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                disabled={isPaying}
                className="h-9 w-9 shrink-0 rounded-full text-white/65 hover:bg-white/8 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Step indicator */}
            <div className="mt-3 flex items-center gap-2">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${step >= 1 ? "bg-white/40" : "bg-white/10"}`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${step >= 2 ? "bg-white/40" : "bg-white/10"}`}
              />
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {/* ── Step 1: Booking Form ───────────────────────────── */}
            {step === 1 ? (
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
                          bookings stay faster.
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
                    onSubmit={handleContinueToPayment}
                    className="space-y-5"
                  >
                    {/* ── Package ──────────────────────────────────── */}
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
                          const active = selectedPackageData?.key === item.key;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => setSelectedPackage(item.key)}
                              className={`rounded-2xl border px-3 py-3 text-center transition ${
                                active
                                  ? "border-white/30 bg-white text-black"
                                  : "border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.06]"
                              }`}
                            >
                              <p
                                className={`text-sm font-medium ${active ? "text-black" : "text-white"}`}
                              >
                                {item.label}
                              </p>
                              <p
                                className={`mt-1 text-lg font-semibold ${active ? "text-black" : "text-white"}`}
                              >
                                ₹{item.price.toLocaleString("en-IN")}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </section>

                    {/* ── Objective (horizontal pills) ────────────── */}
                    <section className="space-y-3">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                        What&apos;s this for?
                      </h2>
                      <Workspaces
                        workspaces={objectiveItems}
                        selectedWorkspaceId={objective}
                        onWorkspaceChange={(workspace) =>
                          setObjective(workspace.id as BookingObjective)
                        }
                      >
                        <WorkspaceTrigger
                          className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/[0.065]"
                          renderTrigger={renderDropdownTrigger("Objective")}
                        />
                        <WorkspaceContent
                          title="Objective"
                          className="border-white/10 bg-[#151922] text-white"
                          renderWorkspace={renderWorkspaceRow}
                        />
                      </Workspaces>
                    </section>

                    {/* ── What to feature (required) ───────────────── */}
                    <section className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <Label htmlFor="focus-text" className="text-white/80">
                        What should they show?
                      </Label>
                      <Input
                        id="focus-text"
                        value={focusText}
                        onChange={(e) =>
                          setFocusText(e.target.value.slice(0, 120))
                        }
                        placeholder={OBJECTIVE_PLACEHOLDERS[objective]}
                        className="h-10"
                        required
                      />
                      <p className="text-right text-xs text-white/30">
                        {focusText.length}/120
                      </p>
                    </section>

                    {/* ── Venue (conditional) ──────────────────────── */}
                    {shouldShowEventName(objective) ? (
                      <section className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <Label htmlFor="event-name" className="text-white/80">
                          Where?
                        </Label>
                        <Input
                          id="event-name"
                          value={eventName}
                          onChange={(e) => setEventName(e.target.value)}
                          placeholder="e.g. Cafe Drifter, Indiranagar"
                          className="h-10"
                          required
                        />
                      </section>
                    ) : null}

                    {/* ── Content style (multi-select pills) ──────── */}
                    <section className="space-y-3">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                        Content style
                      </h2>
                      <Workspaces
                        workspaces={contentStyleItems}
                        selectedWorkspaceId={contentStyles[0]}
                        onWorkspaceChange={(workspace) =>
                          setContentStyles([workspace.id as ContentStyle])
                        }
                      >
                        <WorkspaceTrigger
                          className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/[0.065]"
                          renderTrigger={renderDropdownTrigger("Content style")}
                        />
                        <WorkspaceContent
                          title="Content style"
                          className="border-white/10 bg-[#151922] text-white"
                          renderWorkspace={renderWorkspaceRow}
                        />
                      </Workspaces>
                    </section>

                    {/* ── Timing (horizontal pills) ────────────────── */}
                    <section className="space-y-3">
                      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                        When do you need it?
                      </h2>
                      <Workspaces
                        workspaces={timingItems}
                        selectedWorkspaceId={timingMode}
                        onWorkspaceChange={(workspace) =>
                          setTimingMode(workspace.id as BookingTimingMode)
                        }
                      >
                        <WorkspaceTrigger
                          className="w-full rounded-[22px] border border-white/10 bg-white/[0.04] px-4 py-3 text-left shadow-[0_16px_32px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/[0.065]"
                          renderTrigger={renderDropdownTrigger("Timing")}
                        />
                        <WorkspaceContent
                          title="Timing"
                          className="border-white/10 bg-[#151922] text-white"
                          renderWorkspace={renderWorkspaceRow}
                        />
                      </Workspaces>

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

                    {/* ── Usage rights toggle ──────────────────────── */}
                    <section className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          Brand can repost?
                        </p>
                        <p className="text-xs text-white/40">
                          {usageRights
                            ? "Creator grants repost rights"
                            : "Creator-only — no brand repost"}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={usageRights}
                        onClick={() => setUsageRights((v) => !v)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                          usageRights ? "bg-white" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform ${
                            usageRights
                              ? "translate-x-5 bg-black"
                              : "translate-x-0 bg-white/60"
                          }`}
                        />
                      </button>
                    </section>

                    {/* ── Add details (expandable) ─────────────────── */}
                    <section className="space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03]">
                        <button
                          type="button"
                          onClick={() => setShowDetails((v) => !v)}
                          className="flex w-full items-center justify-between px-4 py-3 text-left"
                        >
                          <span className="text-sm font-medium text-white">
                            + Add details
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 text-white/60 transition-transform ${showDetails ? "rotate-180" : ""}`}
                          />
                        </button>
                        {showDetails ? (
                          <div className="space-y-4 border-t border-white/10 p-4">
                            <div className="space-y-2">
                              <Label
                                htmlFor="hashtags"
                                className="text-white/80"
                              >
                                Tags & mentions
                              </Label>
                              <Input
                                id="hashtags"
                                value={hashtagsMentions}
                                onChange={(e) =>
                                  setHashtagsMentions(e.target.value)
                                }
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
                                value={ctaMessage}
                                onChange={(e) =>
                                  setCtaMessage(e.target.value.slice(0, 100))
                                }
                                placeholder="e.g. Use code SUMMER20, Link in bio..."
                                className="h-10"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </section>

                    {/* ── Contact (conditional) ────────────────────── */}
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
            ) : null}

            {/* ── Step 2: Payment Confirmation ───────────────────── */}
            {step === 2 && selectedPackageData ? (
              <div className="space-y-5 p-5 pb-28 md:p-6 md:pb-32">
                {/* Order summary */}
                <div className="rounded-[20px] border border-white/10 bg-white/[0.04] p-5 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                        {objectiveLabel}
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white">
                        {getPackageLabel(selectedPackageData.key)} ·{" "}
                        {creator.display_name ?? "Creator"}
                      </p>
                      <p className="text-sm text-white/50">
                        {timingMode === "choose_date" && dueDate
                          ? `Needed by ${dueDate}`
                          : timingLabel}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/8 bg-black/20 p-4 space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                      Your selections
                    </p>
                    <div className="space-y-2 text-sm text-white/65">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/45">Package</span>
                        <span className="text-right">
                          {getPackageLabel(selectedPackageData.key)}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/45">What to feature</span>
                        <span className="text-right">{focusText || "—"}</span>
                      </div>
                      {shouldShowEventName(objective) ? (
                        <div className="flex items-start justify-between gap-3">
                          <span className="text-white/45">Event/Venue</span>
                          <span className="text-right">{eventName || "—"}</span>
                        </div>
                      ) : null}
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/45">Content style</span>
                        <span className="text-right">
                          {contentStyles[0]
                            ? (CONTENT_STYLES.find(
                                (style) => style.value === contentStyles[0],
                              )?.label ?? "—")
                            : "—"}
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/45">Timing</span>
                        <span className="text-right">
                          {timingMode === "choose_date" && dueDate
                            ? `${timingLabel} · ${dueDate}`
                            : timingLabel}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/8 bg-black/20 p-4">
                    <div className="flex justify-between text-sm text-white/60">
                      <span>{getPackageLabel(selectedPackageData.key)}</span>
                      <span>
                        ₹{selectedPackageData.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-white/60">
                      <span>Platform fee (12%)</span>
                      <span>₹{platformFee.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-semibold text-white">
                      <span>Pre-authorization amount</span>
                      <span>₹{totalIfAccepted.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                {/* How it works */}
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                    How it works
                  </p>
                  <div className="space-y-2">
                    {[
                      {
                        icon: Lock,
                        color: "text-primary",
                        bg: "bg-primary/10 border-primary/15",
                        title: "Your bank places a temporary hold",
                        desc: "No money is deducted. You'll see it as 'pending' in your banking app — not a charge.",
                      },
                      {
                        icon: Clock,
                        color: "text-amber-300",
                        bg: "bg-amber-300/10 border-amber-300/15",
                        title: "Creator has 24 hours to accept",
                        desc: "They see your booking instantly. You'll get a confirmation email from Razorpay — that just means the hold was placed, not that you were charged.",
                      },
                      {
                        icon: Check,
                        color: "text-emerald-300",
                        bg: "bg-emerald-300/10 border-emerald-300/15",
                        title: "Accepted → payment secured in escrow",
                        desc: "Only then is the hold converted to an actual charge. Released to creator after you approve the content.",
                      },
                    ].map(({ icon: Icon, color, bg, title, desc }) => (
                      <div
                        key={title}
                        className={`flex items-start gap-3 rounded-2xl border p-3.5 ${bg}`}
                      >
                        <div className={`mt-0.5 shrink-0 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {title}
                          </p>
                          <p className="text-xs text-white/50">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-center text-xs text-white/35">
                  If the creator declines or doesn&apos;t respond within 24h,
                  the hold is released and the pending charge disappears from
                  your statement.
                </p>
              </div>
            ) : null}
          </div>

          <DrawerFooter className="shrink-0 border-t border-white/8 bg-[#151922]/96 px-5 py-4 backdrop-blur-xl md:px-6">
            {canStartBooking && selectedPackageData ? (
              <div className="space-y-3">
                {step === 1 ? (
                  <>
                    <Button
                      type="submit"
                      form="booking-drawer-form"
                      size="lg"
                      className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90"
                    >
                      Continue
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      disabled={isPaying}
                      onClick={handlePay}
                      className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Opening payment…
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Pre-authorize ₹
                          {totalIfAccepted.toLocaleString("en-IN")}
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-white/35">
                      Charged only if the creator accepts within 24 hours
                    </p>
                  </>
                )}
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
