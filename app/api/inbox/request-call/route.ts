import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createServiceClient } from "@/lib/supabase/server";

const CALL_REQUEST_COOLDOWN_HOURS = 6;
const CALL_REQUEST_COOLDOWN_MS = CALL_REQUEST_COOLDOWN_HOURS * 60 * 60 * 1000;
const ACTIVE_CALL_STATUSES = new Set(["in_escrow", "delivery_submitted"]);

function formatPackageLabel(value: string | null): string {
  if (!value) return "Not specified";
  if (value === "reel") return "Reel";
  if (value === "post") return "Post";
  if (value === "story") return "Story";
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatPrice(value: number | null): string {
  if (typeof value !== "number") return "Not specified";
  return `${value.toLocaleString("en-IN")}`;
}

function buildEmailHtml({
  influencerName,
  businessName,
  businessEmail,
  businessPhone,
  campaignTitle,
  campaignStatus,
  packageType,
  offeredPrice,
  requestedAt,
  conversationUrl,
}: {
  influencerName: string;
  businessName: string;
  businessEmail: string | null;
  businessPhone: string | null;
  campaignTitle: string;
  campaignStatus: string;
  packageType: string;
  offeredPrice: string;
  requestedAt: string;
  conversationUrl: string;
}) {
  return `
    <div style="margin:0;padding:24px;background:#f8f5fb;font-family:Inter,Arial,sans-serif;color:#1f1530;line-height:1.55;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #eadff5;border-radius:20px;overflow:hidden;box-shadow:0 20px 55px rgba(74,22,94,0.10);">
        <div style="padding:22px 24px;background:linear-gradient(135deg,#2a1523 0%,#5f2559 55%,#8b367a 100%);color:#fff;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.85;">Plugoh Inbox</p>
          <h2 style="margin:0;font-size:26px;line-height:1.2;font-weight:700;">New call request</h2>
          <p style="margin:8px 0 0;font-size:14px;opacity:0.92;">${businessName} would like to connect with you.</p>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 14px;font-size:16px;color:#2d1f43;">Hi ${influencerName},</p>
          <p style="margin:0 0 18px;font-size:14px;color:#4a3a64;">
            You received a new call request from <strong style="color:#2d1f43;">${businessName}</strong> regarding an active campaign conversation.
          </p>

          <div style="margin:0 0 18px;border:1px solid #eadff5;border-radius:14px;background:#fcfaff;padding:14px 14px 10px;">
            <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a79a8;">Campaign details</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:13px;color:#4a3a64;">
              <tr>
                <td style="padding:0 0 8px;opacity:0.8;">Campaign</td>
                <td style="padding:0 0 8px;text-align:right;color:#2d1f43;font-weight:600;">${campaignTitle}</td>
              </tr>
              <tr>
                <td style="padding:0 0 8px;opacity:0.8;">Package</td>
                <td style="padding:0 0 8px;text-align:right;color:#2d1f43;font-weight:600;">${packageType}</td>
              </tr>
              <tr>
                <td style="padding:0 0 8px;opacity:0.8;">Offered price</td>
                <td style="padding:0 0 8px;text-align:right;color:#2d1f43;font-weight:600;">${offeredPrice}</td>
              </tr>
              <tr>
                <td style="padding:0 0 8px;opacity:0.8;">Status</td>
                <td style="padding:0 0 8px;text-align:right;color:#2d1f43;font-weight:600;">${campaignStatus}</td>
              </tr>
              <tr>
                <td style="padding:0 0 2px;opacity:0.8;">Requested at</td>
                <td style="padding:0 0 2px;text-align:right;color:#2d1f43;font-weight:600;">${requestedAt}</td>
              </tr>
            </table>
          </div>

          <div style="margin:0 0 18px;border:1px solid #eadff5;border-radius:14px;background:#fff;padding:14px;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a79a8;">Business contact</p>
            <p style="margin:0 0 6px;font-size:14px;color:#2d1f43;"><strong>Business:</strong> ${businessName}</p>
            ${businessEmail ? `<p style="margin:0 0 6px;font-size:14px;color:#2d1f43;"><strong>Email:</strong> ${businessEmail}</p>` : ""}
            ${businessPhone ? `<p style="margin:0;font-size:14px;color:#2d1f43;"><strong>Phone:</strong> ${businessPhone}</p>` : ""}
          </div>

          <div style="margin-top:22px;">
            <a href="${conversationUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#7f2f7f 0%,#c2488f 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
              Open conversation
            </a>
            <p style="margin:10px 0 0;font-size:12px;color:#8a79a8;">
              Use the button to jump directly into your inbox thread.
            </p>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #f0e9f7;background:#fcfaff;">
          <p style="margin:0;font-size:12px;color:#8a79a8;">This was sent from Plugoh inbox.</p>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const user = await authenticateUser(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const campaignId = body?.campaignId as string | undefined;
    if (!campaignId) {
      return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
    }

    const supabase = createServiceClient();

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, business_id, influencer_id, title, status, package_type, price_offered, created_at")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (campaign.business_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!ACTIVE_CALL_STATUSES.has(campaign.status)) {
      return NextResponse.json(
        { error: "Call requests are available only for active campaigns" },
        { status: 409 },
      );
    }

    const { data: lastCallRequest } = await supabase
      .from("campaign_messages")
      .select("created_at")
      .eq("campaign_id", campaign.id)
      .eq("sender_id", campaign.business_id)
      .eq("message_type", "system")
      .contains("metadata", { event: "call_request" })
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastCallRequest?.created_at) {
      const lastAt = new Date(lastCallRequest.created_at).getTime();
      const elapsed = Date.now() - lastAt;
      if (elapsed < CALL_REQUEST_COOLDOWN_MS) {
        const retryAfterSeconds = Math.ceil(
          (CALL_REQUEST_COOLDOWN_MS - elapsed) / 1000,
        );
        return NextResponse.json(
          {
            error: `You can send another call request after ${CALL_REQUEST_COOLDOWN_HOURS} hours`,
            retryAfterSeconds,
          },
          { status: 429 },
        );
      }
    }

    const [{ data: influencerProfile }, { data: businessProfile }] = await Promise.all([
      supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", campaign.influencer_id)
        .single(),
      supabase
        .from("profiles")
        .select("email, full_name, business_name, phone")
        .eq("id", campaign.business_id)
        .single(),
    ]);

    let influencerEmail = influencerProfile?.email ?? null;
    if (!influencerEmail) {
      const { data: authUserData } = await supabase.auth.admin.getUserById(
        campaign.influencer_id,
      );
      influencerEmail = authUserData.user?.email ?? null;
    }

    if (!influencerEmail) {
      return NextResponse.json(
        { error: "Influencer email is unavailable" },
        { status: 422 },
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Email provider is not configured" },
        { status: 503 },
      );
    }

    const businessName =
      businessProfile?.business_name?.trim() ||
      businessProfile?.full_name?.trim() ||
      "A business owner";
    const influencerName = influencerProfile?.full_name?.trim() || "Creator";
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const appUrlBase =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
      request.nextUrl.origin;
    const conversationUrl = `${appUrlBase}/dashboard/influencer/inbox?chat=${campaign.id}`;
    const campaignTitle = campaign.title?.trim() || "Untitled campaign";
    const campaignStatus = campaign.status
      ? campaign.status
          .split("_")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "Unknown";
    const packageType = formatPackageLabel(campaign.package_type);
    const offeredPrice = formatPrice(campaign.price_offered);
    const requestedAt = formatDateTime(campaign.created_at);

    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Plugoh Inbox <${fromEmail}>`,
        to: [influencerEmail],
        subject: `New call request from ${businessName} • ${campaignTitle}`,
        html: buildEmailHtml({
          influencerName,
          businessName,
          businessEmail: businessProfile?.email ?? null,
          businessPhone: businessProfile?.phone ?? null,
          campaignTitle,
          campaignStatus,
          packageType,
          offeredPrice,
          requestedAt,
          conversationUrl,
        }),
      }),
    });

    if (!emailRes.ok) {
      const payload = await emailRes.json().catch(() => null);
      const message =
        (typeof payload?.error === "string" && payload.error) ||
        (typeof payload?.message === "string" && payload.message) ||
        JSON.stringify(payload);
      return NextResponse.json(
        { error: `Email send failed: ${message}` },
        { status: 502 },
      );
    }

    await emailRes.json().catch(() => null);

    await supabase.from("campaign_messages").insert({
      campaign_id: campaign.id,
      sender_id: campaign.business_id,
      message_type: "system",
      content: "Call request sent",
      metadata: {
        event: "call_request",
        channel: "email",
        requested_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to send request" }, { status: 500 });
  }
}
