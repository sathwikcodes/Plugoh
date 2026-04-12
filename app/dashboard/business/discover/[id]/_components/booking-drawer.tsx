"use client";

import Script from "next/script";
import Image from "next/image";
import { ArrowLeft, Loader2, Lock, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { type BookablePackage, type InfluencerProfile } from "@/lib/booking";
import { Button } from "@/components/ui/button";
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
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <Drawer
        direction={isMobile ? "bottom" : "right"}
        open={open}
        onOpenChange={(nextOpen) => {
          if (form.isPaying) return;
          onOpenChange(nextOpen);
        }}
      >
        <DrawerContent className="ml-auto flex h-[88dvh] max-h-[88dvh] min-h-0 flex-col overflow-hidden rounded-t-[32px] border-t border-white/10 bg-[#241e30] text-white shadow-[0_-24px_60px_rgba(0,0,0,0.55)] md:h-dvh md:max-h-dvh md:w-105 md:max-w-none md:rounded-none md:border-t-0 md:border-l md:border-white/10 md:shadow-[-28px_0_90px_rgba(0,0,0,0.5)]">
          <DrawerHeader className="shrink-0 border-b border-white/8 px-5 py-4 text-left md:px-6">
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

          <DrawerFooter className="shrink-0 border-t border-white/8 bg-[#241e30]/96 px-5 py-4 backdrop-blur-xl md:px-6">
            {form.canStartBooking && form.selectedPackageData ? (
              <div className="space-y-3">
                {form.step === 1 ? (
                  <Button
                    type="submit"
                    form="booking-drawer-form"
                    size="lg"
                    className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90"
                  >
                    Continue
                  </Button>
                ) : (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      disabled={form.isPaying}
                      onClick={form.handlePay}
                      className="h-12 w-full rounded-full bg-white text-black hover:bg-white/90"
                    >
                      {form.isPaying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Opening payment…
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Hold
                          <Image
                            src="/coin.png"
                            alt="Amount"
                            width={16}
                            height={16}
                            className="mx-1 h-4 w-4 object-contain"
                          />
                          {form.totalIfAccepted.toLocaleString("en-IN")}
                        </>
                      )}
                    </Button>
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
