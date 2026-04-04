import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { authenticateUser, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await authenticateUser(authHeader.slice(7));
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    campaign_id,
  } = await request.json();

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !campaign_id
  ) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // HMAC-SHA256 signature verification
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 400 },
    );
  }

  const db = createServiceClient();

  // Idempotency: if already processed, return early
  const { data: campaign, error: fetchError } = await db
    .from("campaigns")
    .select(
      "id, status, business_id, influencer_id, title, price_offered, platform_fee_amount, total_charged_amount",
    )
    .eq("id", campaign_id)
    .maybeSingle();

  if (fetchError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  if (campaign.business_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (campaign.status === "in_escrow") {
    // Already processed — idempotent success
    return NextResponse.json({ success: true, campaignId: campaign.id });
  }

  if (campaign.status !== "payment_pending") {
    return NextResponse.json(
      {
        error: `Cannot process payment for campaign in '${campaign.status}' state`,
      },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  // Update campaign to in_escrow
  const { error: updateError } = await db
    .from("campaigns")
    .update({
      status: "in_escrow",
      payment_status: "paid",
      razorpay_payment_id,
      payment_captured_at: now,
    })
    .eq("id", campaign_id);

  if (updateError) {
    console.error("[verify-escrow] campaign update failed:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const priceInPaise = Math.round((campaign.price_offered ?? 0) * 100);
  const feeInPaise = Math.round((campaign.platform_fee_amount ?? 0) * 100);
  const totalPaise = priceInPaise + feeInPaise;

  // Insert escrow_lock transaction + notifications in parallel
  await Promise.all([
    db.from("escrow_transactions").insert({
      campaign_id,
      type: "escrow_lock",
      amount_paise: totalPaise,
      platform_fee_paise: feeInPaise,
      razorpay_order_id,
      razorpay_payment_id,
      status: "success",
    }),
    db.from("notifications").insert({
      user_id: campaign.influencer_id,
      type: "payment_secured",
      data: {
        title: campaign.title ?? "Untitled",
        campaign_id: campaign.id,
        amount: campaign.price_offered,
      },
    }),
    db.from("notifications").insert({
      user_id: user.id,
      type: "payment_confirmed",
      data: {
        title: campaign.title ?? "Untitled",
        campaign_id: campaign.id,
        amount: campaign.total_charged_amount,
      },
    }),
    db.from("campaign_messages").insert({
      campaign_id,
      sender_id: user.id,
      message_type: "system",
      content: `Payment secured — ₹${(campaign.price_offered ?? 0).toLocaleString("en-IN")} is locked in escrow. Time to create!`,
    }),
  ]);

  return NextResponse.json({ success: true, campaignId: campaign.id });
}
