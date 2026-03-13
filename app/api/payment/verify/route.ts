import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
  );
  const {
    data: { user },
    error: authError,
  } = await anonClient.auth.getUser(token);
  if (authError || !user) {
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

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: campaign, error: insertError } = await db
    .from("campaigns")
    .insert({
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
    } as any) // razorpay_* cols added via migration, not in auto-generated types
    .select("id")
    .single();

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  await db.from("notifications").insert({
    user_id: campaignData.influencer_id,
    type: "new_booking",
    data: {
      title: campaignData.title || "Untitled",
      business_name: campaignData.business_contact_email,
      campaign_id: campaign.id,
    },
  });

  return NextResponse.json({ success: true, campaignId: campaign.id });
}
