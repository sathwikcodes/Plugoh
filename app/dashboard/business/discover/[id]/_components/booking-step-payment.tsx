import { Check, Clock, Lock } from "lucide-react";
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
    title: "We place a temporary hold",
    desc: "Amount is blocked now, not charged.",
  },
  {
    icon: Clock,
    title: "Creator gets 24h to accept",
    desc: "If they decline or miss it, the hold auto-releases.",
  },
  {
    icon: Check,
    title: "Accepted means payment is secured",
    desc: "Then it moves to escrow until delivery approval.",
  },
] as const;

export function BookingStepPayment() {
  return (
    <>
      <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
        How it works
      </p>
      <div className="space-y-2">
        {STEPS.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/3 p-3"
          >
            <div className="mt-0.5 shrink-0 text-white/75">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{title}</p>
              <p className="text-xs text-white/55">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
