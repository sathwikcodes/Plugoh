"use client";

import Image from "next/image";
import { ArrowLeft, Loader2, Lock, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { type BookablePackage, type InfluencerProfile } from "@/lib/booking";
import { Button } from "@/components/ui/button";
import { ThreeDButton } from "@/components/ui/3d-button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useBookingForm } from "./use-booking-form";
import { BookingStepPackage } from "./booking-step-package";
import { BookingStepBrief } from "./booking-step-brief";
import { BookingStepReview } from "./booking-step-review";
import { BookingStepPayment } from "./booking-step-payment";

import { SwipeToHold } from "./swipe-to-hold";

interface BookingDrawerProps {
  creator: InfluencerProfile;
  initialPackage: BookablePackage | null;
  isProfileComplete: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDrawer(props: BookingDrawerProps) {
  return <BookingDrawerContent key={props.creator.id} {...props} />;
}

function BookingDrawerContent({
  creator,
  initialPackage,
  isProfileComplete,
  open,
  onOpenChange,
}: BookingDrawerProps) {
  const isMobile = useIsMobile();
  const form = useBookingForm(
    creator,
    initialPackage,
    isProfileComplete,
    onOpenChange,
  );

  return (
    <>
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={open}
        onOpenChange={(nextOpen) => {
          if (form.isPaying) return;
          onOpenChange(nextOpen);
        }}
      >
        <DrawerContent className="ml-auto flex !h-[94dvh] !max-h-[94dvh] min-h-0 flex-col overflow-hidden rounded-t-[32px] border-t border-white/10 bg-[#141414] text-white shadow-[0_-24px_60px_rgba(0,0,0,0.55)] md:!h-dvh md:!max-h-dvh md:w-105 md:max-w-none md:rounded-none md:border-t-0 md:border-l md:border-white/10 md:shadow-[-28px_0_90px_rgba(0,0,0,0.5)]">
          <DrawerHeader className="shrink-0 border-b border-white/8 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] text-left md:px-6 md:pt-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                {form.step === 2 ? (
                  <button
                    type="button"
                    onClick={() => form.setStep(1)}
                    disabled={form.isPaying}
                    className="shrink-0 rounded-full p-1 text-white/60 transition hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                ) : null}
                <div className="min-w-0 text-left">
                  <DrawerTitle className="text-left text-xl font-semibold text-white">
                    {form.step === 1 ? "Book creator" : "Confirm & pay"}
                  </DrawerTitle>
                  <DrawerDescription className="mt-1 truncate text-left text-sm text-white/55">
                    {form.step === 1
                      ? `${creator.display_name || "Creator"} · no charge until they accept`
                      : "Review your booking details"}
                  </DrawerDescription>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                disabled={form.isPaying}
                className="h-9 w-9 shrink-0 self-center rounded-full text-white/65 hover:bg-white/8 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${form.step >= 1 ? "bg-white/40" : "bg-white/10"}`}
              />
              <div
                className={`h-1 flex-1 rounded-full transition-colors ${form.step >= 2 ? "bg-white/40" : "bg-white/10"}`}
              />
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {form.step === 1 ? (
              <div className="space-y-5 p-5 pb-28 md:p-6 md:pb-32">
                <BookingStepPackage
                  isProfileComplete={isProfileComplete}
                  availablePackages={form.availablePackages}
                  selectedPackage={form.selectedPackage}
                  onPackageChange={form.setSelectedPackage}
                />
                {form.canStartBooking ? (
                  <form
                    id="booking-drawer-form"
                    onSubmit={form.handleContinueToPayment}
                    className="space-y-5"
                  >
                    <BookingStepBrief form={form} />
                  </form>
                ) : null}
              </div>
            ) : null}

            {form.step === 2 && form.selectedPackageData ? (
              <div className="space-y-5 p-5 pb-28 md:p-6 md:pb-32">
                <BookingStepReview form={form} creator={creator} />
                <BookingStepPayment />
              </div>
            ) : null}
          </div>

          <DrawerFooter className="shrink-0 border-t border-white/8 bg-[#141414]/96 px-5 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-4 backdrop-blur-xl md:px-6 md:pb-4">
            {form.canStartBooking && form.selectedPackageData ? (
              <div className="space-y-3">
                {form.step === 1 ? (
                  <ThreeDButton
                    type="submit"
                    form="booking-drawer-form"
                    label="Continue"
                    hideIcon
                    className="three-d-button--no-glow three-d-button--sm w-full"
                  />
                ) : (
                  <SwipeToHold
                    amount={form.totalIfAccepted}
                    onConfirm={form.handlePay}
                    isLoading={form.isPaying}
                    disabled={form.isPaying}
                  />
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
