import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createServiceClient } from "@/lib/supabase/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Vercel cron: runs daily at 2:30 AM IST (21:00 UTC previous day)
// vercel.json: { "path": "/api/cron/auto-release", "schedule": "0 21 * * *" }

export async function GET(request: NextRequest) {
  const secret = request.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createServiceClient();
  const results = { autoReleased: 0, expired: 0, errors: 0 };

  // ── 1. Auto-release: delivery_submitted for > 7 days ────────────────────────
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: toRelease } = await db
    .from("campaigns")
    .select("id")
    .eq("status", "delivery_submitted")
    .lt("delivery_submitted_at", sevenDaysAgo);

  for (const campaign of toRelease ?? []) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL ? "" : "http://localhost:3000"}/api/payment/release-escrow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-cron-secret": process.env.CRON_SECRET!,
      },
      body: JSON.stringify({ campaign_id: campaign.id }),
    });

    if (res.ok) {
      results.autoReleased++;
    } else {
      results.errors++;
      console.error("[cron/auto-release] release failed for", campaign.id, await res.text());
    }
  }

  // ── 2. Expire: requested campaigns with no response for > 48h ───────────────
  const { error: expireRequestedError } = await db
    .from("campaigns")
    .update({ status: "expired" })
    .eq("status", "requested")
    .lt("expires_at", new Date().toISOString());

  if (!expireRequestedError) {
    results.expired++;
  }

  // ── 3. Expire: payment_pending campaigns where brand hasn't paid for > 24h ──
  await db
    .from("campaigns")
    .update({ status: "expired" })
    .eq("status", "payment_pending")
    .lt("expires_at", new Date().toISOString());

  // ── 4. Expire: pre_authorized campaigns where influencer didn't respond in 24h ──
  const now = new Date().toISOString();
  const { data: expiredPreAuth } = await db
    .from("campaigns")
    .select("id, payment_method, razorpay_payment_id, total_charged_amount, business_id, influencer_id, title")
    .eq("status", "pre_authorized")
    .lt("expires_at", now);

  for (const campaign of expiredPreAuth ?? []) {
    try {
      // UPI: payment was captured immediately — issue a refund
      if (campaign.payment_method === "upi" && campaign.razorpay_payment_id) {
        const totalPaise = Math.round((campaign.total_charged_amount ?? 0) * 100);
        await razorpay.payments.refund(campaign.razorpay_payment_id, {
          amount: totalPaise,
          notes: { reason: "booking_expired", campaign_id: campaign.id },
        });
      }
      // Card: pre-auth auto-refunded by Razorpay after 2 days (manual_expiry_period) — nothing to call here

      await db
        .from("campaigns")
        .update({ status: "expired" })
        .eq("id", campaign.id);

      const isUpi = campaign.payment_method === "upi";

      await Promise.all([
        db.from("notifications").insert({
          user_id: campaign.business_id,
          type: "booking_expired",
          data: {
            title: campaign.title ?? "Untitled",
            campaign_id: campaign.id,
            refund: isUpi,
          },
        }),
        db.from("notifications").insert({
          user_id: campaign.influencer_id,
          type: "booking_expired",
          data: { title: campaign.title ?? "Untitled", campaign_id: campaign.id },
        }),
        db.from("campaign_messages").insert({
          campaign_id: campaign.id,
          sender_id: campaign.business_id,
          message_type: "system",
          content: isUpi
            ? "This booking expired — the influencer didn't respond in time. A full refund has been initiated."
            : "This booking expired — the influencer didn't respond in time. Your card pre-authorization has been released.",
        }),
      ]);

      results.expired++;
    } catch (err) {
      console.error("[cron/auto-release] pre_auth expiry failed for", campaign.id, err);
      results.errors++;
    }
  }

  console.log("[cron/auto-release] done:", results);
  return NextResponse.json({ ok: true, ...results });
}
