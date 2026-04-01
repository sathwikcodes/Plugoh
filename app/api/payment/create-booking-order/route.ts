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
    return NextResponse.json({ error: "Invalid price_offered" }, { status: 400 });
  }

  const fee = Math.round(price * PLATFORM_FEE_RATE * 100) / 100;
  const total = price + fee;
  const totalPaise = Math.round(total * 100);

  try {
    // payment_capture: 0 = manual capture (pre-auth for cards)
    // UPI will still auto-capture despite this flag — handled in verify step
    const order = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      payment_capture: 0,
      // If not captured within 2 days, Razorpay auto-refunds the authorization.
      // Our influencer response window is 24h, so this gives a 24h safety buffer.
      manual_expiry_period: 2,
      receipt: `preauth_${influencer_profile_id.slice(0, 8)}_${Date.now()}`,
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      platformFee: fee,
      total,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Razorpay order";
    console.error("[create-booking-order]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
