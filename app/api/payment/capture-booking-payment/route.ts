import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServiceClient } from "@/lib/supabase/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Internal route — called by the acceptBooking tRPC mutation (server-to-server).
// Captures a pre-authorized card payment and transitions campaign to in_escrow.
// For UPI campaigns, payment is already captured — just updates DB state.
export async function POST(request: NextRequest) {
  // Internal calls pass a service secret header
  const secret = request.headers.get("x-internal-secret");
  if (secret !== process.env.INTERNAL_API_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { campaign_id } = await request.json();
  if (!campaign_id) {
    return NextResponse.json({ error: "campaign_id is required" }, { status: 400 });
  }

  const db = createServiceClient();

  const { data: campaign, error: fetchError } = await db
    .from("campaigns")
    .select("id, status, payment_method, razorpay_payment_id, total_charged_amount, price_offered, platform_fee_amount, influencer_id, business_id, title")
    .eq("id", campaign_id)
    .maybeSingle();

  if (fetchError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // Idempotency: already in_escrow means capture already happened
  if (campaign.status === "in_escrow") {
    return NextResponse.json({ success: true });
  }

  if (campaign.status !== "pre_authorized") {
    return NextResponse.json(
      { error: `Cannot capture payment for campaign in '${campaign.status}' state` },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const isCard = campaign.payment_method === "card";

  // For card: capture the pre-authorized amount
  if (isCard && campaign.razorpay_payment_id) {
    const totalPaise = Math.round((campaign.total_charged_amount ?? 0) * 100);
    try {
      await razorpay.payments.capture(campaign.razorpay_payment_id, totalPaise, "INR");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Razorpay capture failed";
      console.error("[capture-booking-payment] Razorpay capture failed:", err);
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
  // For UPI: payment already captured — nothing to do with Razorpay

  // Update campaign to in_escrow
  const { error: updateError } = await db
    .from("campaigns")
    .update({
      status: "in_escrow",
      payment_status: "paid",
      payment_captured_at: now,
      accepted_at: now,
    })
    .eq("id", campaign_id);

  if (updateError) {
    console.error("[capture-booking-payment] campaign update failed:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // For card: update escrow_lock transaction to success
  if (isCard) {
    await db
      .from("escrow_transactions")
      .update({ status: "success" })
      .eq("campaign_id", campaign_id)
      .eq("type", "escrow_lock");
  }

  return NextResponse.json({ success: true });
}
