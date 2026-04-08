import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import {
  BOOKING_OBJECTIVES,
  BOOKING_TIMING_OPTIONS,
  getAvailablePackages,
  shouldShowEventName,
  type BookingObjective,
  type BookingTimingMode,
  type BookablePackage,
  type ContentStyle,
  type InfluencerProfile,
} from "@/lib/booking";
import { processBookingPayment } from "./booking-step-payment";

const DEFAULT_OBJECTIVE: BookingObjective = "product_launch";
const DEFAULT_TIMING: BookingTimingMode = "asap";

function getInitialPackage(
  packageSeed: BookablePackage | null,
  availablePackages: ReturnType<typeof getAvailablePackages>,
): BookablePackage {
  if (packageSeed && availablePackages.some((item) => item.key === packageSeed))
    return packageSeed;
  return availablePackages[0]?.key ?? "reel";
}

export function useBookingForm(
  creator: InfluencerProfile,
  initialPackage: BookablePackage | null,
  isProfileComplete: boolean,
  onOpenChange: (open: boolean) => void,
) {
  const router = useRouter();
  const { toast } = useToast();
  const { profile: businessProfile } = useAuth();
  const availablePackages = useMemo(
    () => getAvailablePackages(creator),
    [creator],
  );

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

  const selectedPackageData =
    availablePackages.find((p) => p.key === selectedPackage) ??
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
    BOOKING_TIMING_OPTIONS.find((t) => t.value === timingMode)?.label ??
    "Timing";
  const objectiveLabel =
    BOOKING_OBJECTIVES.find((o) => o.value === objective)?.label ?? "Booking";

  const handleContinueToPayment = (e: FormEvent<HTMLFormElement>) => {
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
      await processBookingPayment({
        creator,
        selectedPackageData,
        contactEmail,
        contactPhone,
        objective,
        timingMode,
        dueDate,
        focusText,
        eventName,
        contentStyles,
        usageRights,
        hashtagsMentions,
        ctaMessage,
        onVerified: (campaignId) => {
          toast({
            title: "Booking sent!",
            description:
              "The creator has 24 hours to accept. You'll only be charged if they do.",
          });
          onOpenChange(false);
          router.push(`/dashboard/business/campaigns/${campaignId}`);
        },
        onVerifyFailed: (error) => {
          toast({
            title: "Payment verification failed",
            description: error,
            variant: "destructive",
          });
          setIsPaying(false);
        },
        onDismiss: () => setIsPaying(false),
      });
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

  return {
    step,
    setStep,
    isPaying,
    availablePackages,
    selectedPackage,
    setSelectedPackage,
    selectedPackageData,
    objective,
    setObjective,
    objectiveLabel,
    focusText,
    setFocusText,
    eventName,
    setEventName,
    contentStyles,
    setContentStyles,
    timingMode,
    setTimingMode,
    timingLabel,
    dueDate,
    setDueDate,
    usageRights,
    setUsageRights,
    showDetails,
    setShowDetails,
    hashtagsMentions,
    setHashtagsMentions,
    ctaMessage,
    setCtaMessage,
    contactEmail,
    contactPhone,
    requiresContactInput,
    requiresPhoneInput,
    contactEmailDraft,
    setContactEmailDraft,
    contactPhoneDraft,
    setContactPhoneDraft,
    platformFee,
    totalIfAccepted,
    canStartBooking,
    handleContinueToPayment,
    handlePay,
  };
}

export type BookingForm = ReturnType<typeof useBookingForm>;
