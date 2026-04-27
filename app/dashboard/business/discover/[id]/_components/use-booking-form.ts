import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useMyProfile } from "@/hooks/queries/use-my-identity";
import { useToast } from "@/hooks/use-toast";
import { useTRPC } from "@/lib/trpc/client";
import {
  brandTotalFromInfluencerPrice,
  platformFeeFromInfluencerPrice,
} from "@/lib/brand-pricing";
import {
  BOOKING_OBJECTIVES,
  BOOKING_TIMING_OPTIONS,
  getAvailablePackages,
  shouldShowEventName,
  type BookingObjective,
  type BookingTimingMode,
  type BookablePackage,
  type InfluencerProfile,
} from "@/lib/booking";
import { processBookingPayment } from "./booking-step-payment";

const DEFAULT_OBJECTIVE: BookingObjective = "feature_product";
const DEFAULT_TIMING: BookingTimingMode = "choose_date";

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
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const { toast } = useToast();
  const { data: businessProfile } = useMyProfile();
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

  useEffect(() => {
    setSelectedPackage(getInitialPackage(initialPackage, availablePackages));
  }, [initialPackage, availablePackages]);
  const [timingMode, setTimingMode] =
    useState<BookingTimingMode>(DEFAULT_TIMING);
  const [dueDate, setDueDate] = useState("");
  const [contactEmailDraft, setContactEmailDraft] = useState("");
  const [contactPhoneDraft, setContactPhoneDraft] = useState("");
  const [venueAddress, setVenueAddress] = useState(
    () => businessProfile?.location?.trim() ?? "",
  );

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
    ? platformFeeFromInfluencerPrice(selectedPackageData.price)
    : 0;
  const totalIfAccepted = selectedPackageData
    ? brandTotalFromInfluencerPrice(selectedPackageData.price)
    : 0;
  const timingLabel =
    BOOKING_TIMING_OPTIONS.find((t) => t.value === timingMode)?.label ??
    "Timing";
  const objectiveLabel =
    BOOKING_OBJECTIVES.find((o) => o.value === objective)?.label ?? "Booking";
  const effectiveVenueAddress = shouldShowEventName(objective)
    ? venueAddress.trim()
    : "";

  const handleContinueToPayment = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedPackageData) return;
    if (shouldShowEventName(objective) && !effectiveVenueAddress) {
      toast({
        title: "Add your business address",
        description:
          "We'll share it with the influencer so they know where to visit. Update your profile to continue.",
        variant: "destructive",
      });
      return;
    }
    if (timingMode === "choose_date" && !dueDate) {
      toast({
        title: "Choose a delivery date",
        description: "Pick a deadline so the influencer knows the timeline.",
        variant: "destructive",
      });
      return;
    }
    if (!contactEmail) {
      toast({
        title: "Email required",
        description: "Add a contact email so the influencer can reach you.",
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
        venueAddress: effectiveVenueAddress,
        onPrepareCheckout: () => onOpenChange(false),
        onVerified: async (campaignId) => {
          if (typeof campaignId !== "string" || !campaignId.trim()) {
            toast({
              title: "Booking incomplete",
              description: "Missing campaign id from payment verification.",
              variant: "destructive",
            });
            setIsPaying(false);
            return;
          }
          try {
            await queryClient.prefetchQuery(
              trpc.campaign.getCampaign.queryOptions({
                id: campaignId,
                filterBusinessId: true,
              }),
            );
          } catch {
            // Detail route will refetch; avoid blocking redirect on prefetch failure.
          }
          await queryClient.invalidateQueries({
            queryKey: trpc.campaign.getCampaigns.queryOptions({
              role: "business",
            }).queryKey,
          });
          toast({
            title: "Booking sent!",
            description:
              "The influencer has 24 hours to accept. You'll only be charged if they do.",
          });
          onOpenChange(false);
          setIsPaying(false);
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
    timingMode,
    setTimingMode,
    timingLabel,
    dueDate,
    setDueDate,
    venueAddress: effectiveVenueAddress,
    venueAddressDraft: venueAddress,
    setVenueAddress,
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
