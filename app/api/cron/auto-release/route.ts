import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

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

  console.log("[cron/auto-release] done:", results);
  return NextResponse.json({ ok: true, ...results });
}
