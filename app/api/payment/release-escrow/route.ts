import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createServiceClient } from "@/lib/supabase/server";

// Called by: cron job (auto-release) or brand approval (via tRPC approveDelivery).
// For Phase 1: records the payout obligation in escrow_transactions with status "pending".
// For Phase 2: will call Razorpay Payouts API to actually disburse funds.

export async function POST(request: NextRequest) {
  // Allow either authenticated user (brand approval) or cron secret
  const cronSecret = request.headers.get("x-cron-secret");
  const authHeader = request.headers.get("Authorization");
  const isCron = cronSecret === process.env.CRON_SECRET;

  let userId: string | null = null;

  if (!isCron) {
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await authenticateUser(authHeader.slice(7));
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    userId = user.id;
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
    .select(
      "id, status, business_id, influencer_id, title, price_offered, platform_fee_amount, razorpay_payment_id",
    )
    .eq("id", campaign_id)
    .maybeSingle();

  if (fetchError || !campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  // If called by brand user (not cron), verify ownership
  if (!isCron && userId && campaign.business_id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (campaign.status !== "delivery_submitted") {
    return NextResponse.json(
      {
        error: `Cannot release escrow for campaign in '${campaign.status}' state`,
      },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();
  const priceInPaise = Math.round((campaign.price_offered ?? 0) * 100);
  const feeInPaise = Math.round((campaign.platform_fee_amount ?? 0) * 100);

  // Update campaign to completed
  const { error: campaignUpdateError } = await db
    .from("campaigns")
    .update({ status: "completed", completed_at: now })
    .eq("id", campaign_id);

  if (campaignUpdateError) {
    console.error(
      "[release-escrow] campaign update failed:",
      campaignUpdateError,
    );
    return NextResponse.json(
      { error: campaignUpdateError.message },
      { status: 500 },
    );
  }

  // Record payout obligations and notify in parallel
  await Promise.all([
    // Payout obligation record (Phase 2: will trigger actual Razorpay payout here)
    db.from("escrow_transactions").insert([
      {
        campaign_id,
        type: "payout_influencer",
        amount_paise: priceInPaise,
        razorpay_payment_id: campaign.razorpay_payment_id,
        status: "pending",
      },
      {
        campaign_id,
        type: "platform_fee",
        amount_paise: feeInPaise,
        platform_fee_paise: feeInPaise,
        status: "success",
      },
    ]),
    db.from("notifications").insert({
      user_id: campaign.influencer_id,
      type: "booking_completed",
      data: {
        title: campaign.title ?? "Untitled",
        campaign_id: campaign.id,
        amount: campaign.price_offered,
      },
    }),
    db.from("campaign_messages").insert({
      campaign_id,
      sender_id: campaign.business_id,
      message_type: "system",
      content: isCron
        ? `Payment auto-released — ₹${(campaign.price_offered ?? 0).toLocaleString("en-IN")} is on its way to the influencer.`
        : `Content approved! ₹${(campaign.price_offered ?? 0).toLocaleString("en-IN")} is being released to the influencer.`,
    }),
  ]);

  return NextResponse.json({ success: true });
}
