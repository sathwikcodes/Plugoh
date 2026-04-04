import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import Razorpay from "razorpay";
import { authenticateUser, createServiceClient } from "@/lib/supabase/server";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import { buildCampaignBrief, buildCampaignTitle } from "@/lib/booking";
import type { BookingFormState } from "@/lib/booking";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await authenticateUser(authHeader.slice(7));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    // booking form fields
    influencer_id,
    influencer_profile_id,
    package_type,
    price_offered,
    objective,
    timing_mode,
    due_date,
    focus_text,
    event_name,
    notes,
    contact_email,
    contact_phone,
  } = body;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !influencer_id ||
    !influencer_profile_id ||
    !package_type ||
    !price_offered ||
    !objective ||
    !timing_mode ||
    !contact_email
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // HMAC-SHA256 signature verification
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 },
    );
  }

  // Idempotency check — if this payment_id already created a campaign, return it
  const db = createServiceClient();
  const { data: existing } = await db
    .from("campaigns")
    .select("id, status")
    .eq("razorpay_payment_id", razorpay_payment_id)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, campaignId: existing.id });
  }

  // Fetch payment from Razorpay to determine method (card vs upi)
  let paymentMethod = "other";
  try {
    const payment = await razorpay.payments.fetch(razorpay_payment_id);
    paymentMethod = (payment.method as string) ?? "other";
  } catch {
    // Non-fatal: we can still proceed, just won't know method
    console.warn(
      "[verify-booking-payment] Could not fetch payment method from Razorpay",
    );
  }

  // Build campaign title + brief from booking form state
  const { data: profile } = await db
    .from("influencer_profiles")
    .select("*")
    .eq("id", influencer_profile_id)
    .maybeSingle();

  const formState: BookingFormState = {
    objective,
    packageType: package_type,
    timingMode: timing_mode,
    dueDate: due_date ?? "",
    focusText: focus_text ?? "",
    eventName: event_name ?? "",
    notes: notes ?? "",
    contactEmail: contact_email,
    contactPhone: contact_phone ?? "",
  };

  const title = buildCampaignTitle(
    formState,
    profile ?? ({} as typeof profile),
  );
  const brief = buildCampaignBrief(formState);

  const price = Number(price_offered);
  const platformFee = Math.round(price * PLATFORM_FEE_RATE * 100) / 100;
  const totalCharged = Math.round((price + platformFee) * 100) / 100;

  // 24h window for influencer to accept
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Card = pre-auth (authorized, not captured yet)
  // UPI/other = immediately captured by Razorpay
  const isCard = paymentMethod === "card";

  // Create campaign in pre_authorized state
  const { data: campaign, error: insertError } = await db
    .from("campaigns")
    .insert({
      business_id: user.id,
      influencer_id,
      influencer_profile_id,
      title,
      brief,
      package_type,
      price_offered: price,
      advance_amount: price,
      platform_fee_amount: platformFee,
      total_charged_amount: totalCharged,
      business_contact_email: contact_email,
      business_contact_phone: contact_phone ?? null,
      status: "pre_authorized",
      payment_status: isCard ? "authorized" : "paid",
      payment_method: paymentMethod,
      razorpay_order_id,
      razorpay_payment_id,
      expires_at: expiresAt,
    })
    .select("id, title")
    .single();

  if (insertError || !campaign) {
    console.error(
      "[verify-booking-payment] campaign insert failed:",
      insertError,
    );
    return NextResponse.json(
      { error: insertError?.message ?? "Failed to create campaign" },
      { status: 500 },
    );
  }

  const priceInPaise = Math.round(price * 100);
  const feeInPaise = Math.round(platformFee * 100);
  const totalPaise = priceInPaise + feeInPaise;

  await Promise.all([
    // Escrow transaction record — pending for card (not captured yet), success for UPI (already captured)
    db.from("escrow_transactions").insert({
      campaign_id: campaign.id,
      type: "escrow_lock",
      amount_paise: totalPaise,
      platform_fee_paise: feeInPaise,
      razorpay_order_id,
      razorpay_payment_id,
      status: isCard ? "pending" : "success",
    }),
    // Notify influencer
    db.from("notifications").insert({
      user_id: influencer_id,
      type: "new_booking",
      data: {
        title: campaign.title ?? "Untitled",
        campaign_id: campaign.id,
        expires_at: expiresAt,
      },
    }),
    // Booking card message to start the chat
    db.from("campaign_messages").insert({
      campaign_id: campaign.id,
      sender_id: user.id,
      message_type: "booking_card",
      content: brief,
      metadata: {
        title,
        package_type,
        price_offered: price,
        platform_fee: platformFee,
        total_charged: totalCharged,
        objective,
        timing_mode,
        focus_text: focus_text ?? "",
        expires_at: expiresAt,
        payment_method: paymentMethod,
      },
    }),
    // System message
    db.from("campaign_messages").insert({
      campaign_id: campaign.id,
      sender_id: user.id,
      message_type: "system",
      content: isCard
        ? `₹${totalCharged.toLocaleString("en-IN")} pre-authorized on your card. The influencer has 24 hours to accept. No charge until they confirm.`
        : `₹${totalCharged.toLocaleString("en-IN")} held securely. The influencer has 24 hours to accept. Full refund if they don't.`,
    }),
  ]);

  return NextResponse.json({ success: true, campaignId: campaign.id });
}
