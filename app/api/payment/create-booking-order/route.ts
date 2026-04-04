import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { authenticateUser } from "@/lib/supabase/server";
import { PLATFORM_FEE_RATE } from "@/lib/constants";

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
  const { price_offered, influencer_profile_id } = body;

  if (!price_offered || !influencer_profile_id) {
    return NextResponse.json(
      { error: "price_offered and influencer_profile_id are required" },
      { status: 400 },
    );
  }

  const price = Number(price_offered);
  if (isNaN(price) || price <= 0) {
    return NextResponse.json(
      { error: "Invalid price_offered" },
      { status: 400 },
    );
  }

  const fee = Math.round(price * PLATFORM_FEE_RATE * 100) / 100;
  const total = price + fee;
  const totalPaise = Math.round(total * 100);

  try {
    // payment_capture: 0 = manual capture mode.
    // For cards: creates a pre-authorisation — funds are held, not charged until
    //   we call payments.capture() when the influencer accepts.
    // For UPI: Razorpay ignores this flag and auto-captures immediately —
    //   we detect this in the verify step via payment.method and handle accordingly.
    //
    // Razorpay holds card pre-authorisations for up to 5 days by default.
    // Our influencer acceptance window is 24 h, so this is well within range.
    // If the influencer doesn't respond, the cron job marks the campaign expired
    // and the authorisation lapses on its own (no refund API call needed for cards).
    const order = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      payment_capture: false,
      receipt: `preauth_${influencer_profile_id.slice(0, 8)}_${Date.now()}`,
      notes: {
        type: "booking_preauth",
        influencer_profile_id,
        business_id: user.id,
        price_inr: String(price),
        platform_fee_inr: String(fee),
        total_inr: String(total),
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      platformFee: fee,
      total,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create Razorpay order";
    console.error("[create-booking-order]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
