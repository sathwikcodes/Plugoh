import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { authenticateUser, createServiceClient } from "@/lib/supabase/server";
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

  const { campaign_id } = await request.json();
  if (!campaign_id) {
    return NextResponse.json(
      { error: "campaign_id is required" },
      { status: 400 },
    );
  }

  const db = createServiceClient();

  const { data: campaign, error: fetchError } = await db
    .from("campaigns")
    .select("id, status, business_id, price_offered, razorpay_order_id")
    .eq("id", campaign_id)
    .maybeSingle();

  if (fetchError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.business_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (campaign.status !== "payment_pending") {
    return NextResponse.json(
      {
        error: `Campaign is in '${campaign.status}' state, expected 'payment_pending'`,
      },
      { status: 400 },
    );
  }

  // If an order was already created (e.g. brand refreshed the page), re-use it
  if (campaign.razorpay_order_id) {
    // Fetch order details from Razorpay to get amount/currency
    const existingOrder = await razorpay.orders.fetch(
      campaign.razorpay_order_id,
    );
    return NextResponse.json({
      orderId: existingOrder.id,
      amount: existingOrder.amount,
      currency: existingOrder.currency,
    });
  }

  const price = campaign.price_offered ?? 0;
  const fee = Math.round(price * PLATFORM_FEE_RATE * 100) / 100;
  const total = price + fee;
  const totalPaise = Math.round(total * 100);

  try {
    const order = await razorpay.orders.create({
      amount: totalPaise,
      currency: "INR",
      receipt: `escrow_${campaign_id.slice(0, 8)}_${Date.now()}`,
    });

    // Store order_id on campaign so it can be re-fetched if brand refreshes
    await db
      .from("campaigns")
      .update({
        razorpay_order_id: order.id,
        platform_fee_amount: fee,
        total_charged_amount: total,
      })
      .eq("id", campaign_id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to create Razorpay order";
    console.error("[create-escrow-order]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
