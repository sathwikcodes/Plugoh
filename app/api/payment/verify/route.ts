import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import type { Database } from "@/lib/supabase/types";
import { authenticateUser, createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const user = await authenticateUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    campaignData,
  } = await request.json();

  // Signature verification (HMAC-SHA256)
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

  // Idempotency: check if a campaign with this order ID already exists
  const { data: existing } = await db
    .from("campaigns")
    .select("id")
    .eq("razorpay_order_id", razorpay_order_id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ success: true, campaignId: existing.id });
  }

  type CampaignInsert = Database["public"]["Tables"]["campaigns"]["Insert"] & {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    payment_status: string;
  };
  const insertPayload: CampaignInsert = {
    business_id: user.id,
    influencer_id: campaignData.influencer_id,
    influencer_profile_id: campaignData.influencer_profile_id,
    title: campaignData.title,
    brief: campaignData.brief,
    package_type: campaignData.package_type,
    price_offered: campaignData.price_offered,
    advance_amount: campaignData.price_offered,
    business_contact_email: campaignData.business_contact_email,
    business_contact_phone: campaignData.business_contact_phone,
    status: "pending",
    razorpay_order_id,
    razorpay_payment_id,
    payment_status: "paid",
  };
  const { data: campaign, error: insertError } = await db
    .from("campaigns")
    .insert(insertPayload)
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Fetch business profile for the real business name
  const { data: bizProfile } = await db
    .from("profiles")
    .select("business_name, full_name")
    .eq("id", user.id)
    .maybeSingle();
  const businessName =
    bizProfile?.business_name || bizProfile?.full_name || "A brand";

  // Notify the influencer
  await db.from("notifications").insert({
    user_id: campaignData.influencer_id,
    type: "new_booking",
    data: {
      title: campaignData.title || "Untitled",
      business_name: businessName,
      campaign_id: campaign.id,
    },
  });

  // Insert a booking card message so the chat isn't empty
  await db.from("campaign_messages").insert({
    campaign_id: campaign.id,
    sender_id: user.id,
    message_type: "booking_card",
    content: "New booking request",
    metadata: {
      title: campaignData.title || "Untitled Campaign",
      package_type: campaignData.package_type || null,
      price_offered: campaignData.price_offered || 0,
      brief: campaignData.brief || "",
      business_name: businessName,
    },
  });

  return NextResponse.json({ success: true, campaignId: campaign.id });
}
