import { useState } from "react";
import { Check, ChevronDown, Clock, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  getPackageLabel,
  type BookablePackage,
  type BookingObjective,
  type BookingTimingMode,
  type InfluencerProfile,
} from "@/lib/booking";

interface ProcessBookingPaymentParams {
  creator: InfluencerProfile;
  selectedPackageData: { key: BookablePackage; price: number };
  contactEmail: string;
  contactPhone: string;
  objective: BookingObjective;
  timingMode: BookingTimingMode;
  dueDate: string;
  venueAddress: string;
  onVerified: (campaignId: string) => void;
  onVerifyFailed: (error: string) => void;
  onDismiss: () => void;
}

export async function processBookingPayment(
  params: ProcessBookingPaymentParams,
) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token)
    throw new Error("Session expired — please sign in again");

  const orderRes = await fetch("/api/payment/create-booking-order", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      price_offered: params.selectedPackageData.price,
      influencer_profile_id: params.creator.id,
    }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok)
    throw new Error(orderData.error ?? "Failed to create order");

  const rzp = new window.Razorpay({
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: orderData.currency,
    name: "Plugoh",
    description: `${getPackageLabel(params.selectedPackageData.key)} · ${params.creator.display_name ?? "Creator"}`,
    order_id: orderData.orderId,
    prefill: { email: params.contactEmail, contact: params.contactPhone },
    theme: { color: "#0f172a" },
    notes: {
      booking_type: "pre_authorization",
      creator: params.creator.display_name ?? params.creator.id,
    },
    handler: async (response: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    }) => {
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
          influencer_id: params.creator.user_id,
          influencer_profile_id: params.creator.id,
          package_type: params.selectedPackageData.key,
          price_offered: params.selectedPackageData.price,
          objective: params.objective,
          timing_mode: params.timingMode,
          due_date: params.dueDate || undefined,
          event_name: params.venueAddress || undefined,
          contact_email: params.contactEmail,
          contact_phone: params.contactPhone,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        params.onVerifyFailed(verifyData.error);
        return;
      }
      params.onVerified(verifyData.campaignId);
    },
    modal: { ondismiss: params.onDismiss },
  });
  rzp.open();
}

const STEPS = [
  {
    icon: Lock,
    title: "We place a temporary hold on your payment",
    accent: "text-yellow-300",
    ring: "border-yellow-500/30 bg-yellow-500/10",
    line: "bg-white/10",
  },
  {
    icon: Clock,
    title: "Creator has 24 hours to accept or decline",
    accent: "text-sky-300",
    ring: "border-sky-500/30 bg-sky-500/10",
    line: "bg-white/10",
  },
  {
    icon: Check,
    title: "On acceptance, funds move to secure escrow",
    accent: "text-emerald-300",
    ring: "border-emerald-500/30 bg-emerald-500/10",
    line: null,
  },
] as const;

export function BookingStepPayment() {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/4"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/40">
          How it works
        </p>
        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-white/30 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="border-t border-white/8 px-4 pb-5 pt-4">
          <div className="space-y-0">
            {STEPS.map(({ icon: Icon, title, accent, ring, line }, i) => (
              <div key={title} className="relative flex gap-3.5 pb-5 last:pb-0">
                {/* Connecting line to next step */}
                {line ? (
                  <div className={`absolute left-[13px] top-7 bottom-0 w-px ${line}`} />
                ) : null}
                {/* Icon */}
                <div className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${ring}`}>
                  <Icon className={`h-3 w-3 ${accent}`} />
                </div>
                {/* Text — single line, no wrap issues */}
                <p className="flex-1 pt-1 text-sm leading-snug text-white/65">{title}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
