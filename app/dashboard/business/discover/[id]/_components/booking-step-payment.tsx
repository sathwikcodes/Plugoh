import { Check, Clock, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  getPackageLabel,
  type BookablePackage,
  type BookingObjective,
  type BookingTimingMode,
  type ContentStyle,
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
  focusText: string;
  eventName: string;
  contentStyles: ContentStyle[];
  usageRights: boolean;
  hashtagsMentions: string;
  ctaMessage: string;
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
          focus_text: params.focusText,
          event_name: params.eventName || undefined,
          content_styles: params.contentStyles,
          usage_rights: params.usageRights,
          hashtags_mentions: params.hashtagsMentions || undefined,
          cta_message: params.ctaMessage || undefined,
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
] as const;

export function BookingStepPayment() {
  return (
    <>
      <div className="space-y-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
          How it works
        </p>
        <div className="space-y-2">
          {STEPS.map(({ icon: Icon, color, bg, title, desc }) => (
            <div
              key={title}
              className={`flex items-start gap-3 rounded-2xl border p-3.5 ${bg}`}
            >
              <div className={`mt-0.5 shrink-0 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-white/50">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-white/35">
        If the creator declines or doesn&apos;t respond within 24h, the hold is
        released and the pending charge disappears from your statement.
      </p>
    </>
  );
}
