import { z } from "zod";
import { TRPCError } from "@trpc/server";
import Razorpay from "razorpay";
import { router, protectedProcedure } from "../init";
import { PLATFORM_FEE_RATE } from "@/lib/constants";
import { buildCampaignBrief, buildCampaignTitle } from "@/lib/booking";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

function formatPackageLabel(value: string | null): string {
  if (!value) return "Not specified";
  if (value === "reel") return "Reel";
  if (value === "post") return "Post";
  if (value === "story") return "Story";
  return value
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

function buildDeliveryEmailHtml({
  brandName,
  influencerName,
  campaignTitle,
  packageType,
  priceOffered,
  notes,
  reviewUrl,
}: {
  brandName: string;
  influencerName: string;
  campaignTitle: string;
  packageType: string;
  priceOffered: string;
  notes?: string;
  reviewUrl: string;
}) {
  return `
    <div style="margin:0;padding:24px;background:#f8f5fb;font-family:Inter,Arial,sans-serif;color:#1f1530;line-height:1.55;">
      <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #eadff5;border-radius:20px;overflow:hidden;box-shadow:0 20px 55px rgba(74,22,94,0.10);">
        <div style="padding:22px 24px;background:linear-gradient(135deg,#2a1523 0%,#5f2559 55%,#8b367a 100%);color:#fff;">
          <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.85;">Plugoh Notifications</p>
          <h2 style="margin:0;font-size:26px;line-height:1.2;font-weight:700;">Delivery submitted</h2>
          <p style="margin:8px 0 0;font-size:14px;opacity:0.92;">${influencerName} completed their delivery for ${campaignTitle}.</p>
        </div>

        <div style="padding:24px;">
          <p style="margin:0 0 14px;font-size:16px;color:#2d1f43;">Hi ${brandName},</p>
          <p style="margin:0 0 18px;font-size:14px;color:#4a3a64;">
            <strong style="color:#2d1f43;">${influencerName}</strong> has submitted their content for <strong style="color:#2d1f43;">${campaignTitle}</strong>. Here's the delivery link:
          </p>

          <div style="margin:0 0 18px;border:1px solid #c4e8c4;border-radius:14px;background:#f4fbf4;padding:14px;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#4a9a4a;">Delivery ready</p>
            <p style="margin:0;font-size:14px;color:#1a7a3a;">Log in to your Plugoh dashboard to view and download the delivery using the button below.</p>
          </div>

          ${
            notes
              ? `<div style="margin:0 0 18px;border:1px solid #eadff5;border-radius:14px;background:#fcfaff;padding:14px;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8a79a8;">Notes from influencer</p>
            <p style="margin:0;font-size:14px;color:#4a3a64;">${notes}</p>
          </div>`
              : ""
          }

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
                <td style="padding:0 0 2px;opacity:0.8;">Influencer earnings</td>
                <td style="padding:0 0 2px;text-align:right;color:#2d1f43;font-weight:600;">₹${priceOffered}</td>
              </tr>
            </table>
          </div>

          <div style="margin:0 0 22px;border:1px solid #fde8c4;border-radius:14px;background:#fffbf4;padding:14px;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#a06010;">You have 24 hours to review and take action:</p>
            <ul style="margin:0;padding:0 0 0 18px;font-size:13px;color:#6a4820;line-height:1.8;">
              <li>Approve the delivery and release payment</li>
              <li>Request a revision</li>
              <li>Raise a dispute with Plugoh</li>
            </ul>
          </div>

          <div style="margin-top:4px;">
            <a href="${reviewUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,#7f2f7f 0%,#c2488f 100%);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;">
              Review delivery →
            </a>
            <p style="margin:10px 0 0;font-size:12px;color:#8a79a8;">
              Use the button to view the content and take action on your campaign.
            </p>
          </div>
        </div>

        <div style="padding:14px 24px;border-top:1px solid #f0e9f7;background:#fcfaff;">
          <p style="margin:0;font-size:12px;color:#8a79a8;">Sent by Plugoh · plugoh.com</p>
        </div>
      </div>
    </div>
  `;
}

async function sendDeliveryNotificationEmail({
  db,
  campaign,
  influencerId,
  notes,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  campaign: any;
  influencerId: string;
  notes?: string;
}) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) return;

    // Resolve brand email
    let brandEmail: string | null =
      (campaign.business_contact_email as string | null) ?? null;

    const [{ data: brandProfile }, { data: influencerProfile }] =
      await Promise.all([
        db
          .from("profiles")
          .select("email, full_name, business_name")
          .eq("id", campaign.business_id)
          .single(),
        db.from("profiles").select("full_name").eq("id", influencerId).single(),
      ]);

    if (!brandEmail) {
      brandEmail = brandProfile?.email ?? null;
    }
    if (!brandEmail) {
      const { data: authUser } = await db.auth.admin.getUserById(
        campaign.business_id,
      );
      brandEmail = authUser?.user?.email ?? null;
    }
    if (!brandEmail) return;

    const brandName =
      (brandProfile?.business_name as string | null)?.trim() ||
      (brandProfile?.full_name as string | null)?.trim() ||
      "there";
    const influencerName =
      (influencerProfile?.full_name as string | null)?.trim() ||
      "The influencer";
    const campaignTitle =
      (campaign.title as string | null)?.trim() || "your campaign";
    const packageType = formatPackageLabel(
      campaign.package_type as string | null,
    );
    const priceOffered = campaign.price_offered
      ? (campaign.price_offered as number).toLocaleString("en-IN")
      : "—";

    const appUrl =
      (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "") ||
      "https://plugoh.com";
    const reviewUrl = `${appUrl}/dashboard/business/campaigns/${campaign.id}`;
    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Plugoh <${fromEmail}>`,
        to: [brandEmail],
        subject: `Delivery submitted — ${campaignTitle}`,
        html: buildDeliveryEmailHtml({
          brandName,
          influencerName,
          campaignTitle,
          packageType,
          priceOffered,
          notes,
          reviewUrl,
        }),
      }),
    });
  } catch {
    // Non-fatal — delivery is already recorded
  }
}

export const campaignRouter = router({
  getCampaigns: protectedProcedure
    .input(
      z.object({
        role: z.enum(["business", "influencer"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      const column =
        input.role === "business" ? "business_id" : "influencer_id";
      const { data, error } = await ctx.db
        .from("campaigns")
        .select("*")
        .eq(column, ctx.user.id)
        .order("created_at", { ascending: false });
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return data ?? [];
    }),

  getCampaign: protectedProcedure
    .input(
      z.object({ id: z.string(), filterBusinessId: z.boolean().optional() }),
    )
    .query(async ({ ctx, input }) => {
      let query = ctx.db.from("campaigns").select("*").eq("id", input.id);
      if (input.filterBusinessId) {
        query = query.eq("business_id", ctx.user.id);
      }
      const { data, error } = await query.maybeSingle();
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return data;
    }),

  getCampaignMessages: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from("campaign_messages")
        .select("*")
        .eq("campaign_id", input.campaignId)
        .order("created_at", { ascending: true });
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return data ?? [];
    }),

  markNotificationsRead: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        notificationType: z.string().default("new_message"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.db
        .from("notifications")
        .update({ read: true })
        .eq("user_id", ctx.user.id)
        .eq("type", input.notificationType)
        .eq("read", false)
        .contains("data", { campaign_id: input.campaignId });
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return { success: true };
    }),

  submitBookingRequest: protectedProcedure
    .input(
      z.object({
        influencer_id: z.string(),
        influencer_profile_id: z.string(),
        package_type: z.enum(["reel", "post", "story"]),
        price_offered: z.number().positive(),
        objective: z.enum([
          "visit_place",
          "feature_product",
          "showcase_service",
          "promote_offer",
          "brand_shoutout",
        ]),
        timing_mode: z.enum(["asap", "choose_date"]),
        due_date: z.string().optional(),
        event_name: z.string().optional(),
        contact_email: z.string().email(),
        contact_phone: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const platformFee =
        Math.round(input.price_offered * PLATFORM_FEE_RATE * 100) / 100;
      const totalCharged =
        Math.round((input.price_offered + platformFee) * 100) / 100;

      // expires_at = 48h from now (auto-expire if influencer doesn't respond)
      const expiresAt = new Date(
        Date.now() + 48 * 60 * 60 * 1000,
      ).toISOString();

      const formState: import("@/lib/booking").BookingFormState = {
        objective: input.objective,
        packageType: input.package_type,
        timingMode: input.timing_mode,
        dueDate: input.due_date ?? "",
        venueAddress: input.event_name ?? "",
        contactEmail: input.contact_email,
        contactPhone: input.contact_phone,
      };

      const { data: profile } = await db
        .from("influencer_profiles")
        .select("*")
        .eq("id", input.influencer_profile_id)
        .maybeSingle();

      const title = buildCampaignTitle(formState, profile);
      const brief = buildCampaignBrief(formState);

      const { data: campaign, error } = await db
        .from("campaigns")
        .insert({
          business_id: user.id,
          influencer_id: input.influencer_id,
          influencer_profile_id: input.influencer_profile_id,
          title,
          brief,
          package_type: input.package_type,
          price_offered: input.price_offered,
          advance_amount: input.price_offered,
          platform_fee_amount: platformFee,
          total_charged_amount: totalCharged,
          business_contact_email: input.contact_email,
          business_contact_phone: input.contact_phone,
          status: "requested",
          payment_status: "unpaid",
          expires_at: expiresAt,
        })
        .select("id, title")
        .single();

      if (error || !campaign) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error?.message ?? "Failed to create booking request",
        });
      }

      await db.from("notifications").insert({
        user_id: input.influencer_id,
        type: "new_booking",
        data: { title: campaign.title ?? "Untitled", campaign_id: campaign.id },
      });

      await db.from("campaign_messages").insert({
        campaign_id: campaign.id,
        sender_id: user.id,
        message_type: "booking_card",
        content: brief,
        metadata: {
          title,
          package_type: input.package_type,
          price_offered: input.price_offered,
          platform_fee: platformFee,
          total_charged: totalCharged,
          objective: input.objective,
          timing_mode: input.timing_mode,
          event_name: input.event_name ?? "",
        },
      });

      return { success: true, campaignId: campaign.id };
    }),

  acceptBooking: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { data: campaign, error: fetchError } = await db
        .from("campaigns")
        .select("*")
        .eq("id", input.campaignId)
        .maybeSingle();

      if (fetchError || !campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign.influencer_id !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the influencer can accept",
        });
      }

      if (campaign.status === "pre_authorized") {
        if (campaign.expires_at && new Date(campaign.expires_at) < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "This booking has expired. The brand will need to book again.",
          });
        }

        const now = new Date().toISOString();
        const isCard = campaign.payment_method === "card";

        if (isCard && campaign.razorpay_payment_id) {
          const totalPaise = Math.round(
            (campaign.total_charged_amount ?? 0) * 100,
          );
          try {
            await razorpay.payments.capture(
              campaign.razorpay_payment_id,
              totalPaise,
              "INR",
            );
          } catch (err: unknown) {
            const message =
              err instanceof Error ? err.message : "Payment capture failed";
            console.error("[acceptBooking] Razorpay capture failed:", err);
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
          }
        }

        const { error: updateError } = await db
          .from("campaigns")
          .update({
            status: "in_escrow",
            payment_status: "paid",
            accepted_at: now,
            payment_captured_at: now,
          })
          .eq("id", input.campaignId);

        if (updateError) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: updateError.message,
          });
        }

        if (isCard) {
          await db
            .from("escrow_transactions")
            .update({ status: "success" })
            .eq("campaign_id", input.campaignId)
            .eq("type", "escrow_lock");
        }

        const notifData = {
          title: campaign.title ?? "Untitled",
          campaign_id: campaign.id,
        };

        await Promise.all([
          db.from("notifications").insert({
            user_id: campaign.business_id,
            type: "payment_confirmed",
            data: { ...notifData, amount: campaign.total_charged_amount },
          }),
          db.from("notifications").insert({
            user_id: user.id,
            type: "booking_accepted",
            data: { ...notifData, amount: campaign.price_offered },
          }),
          db
            .from("notifications")
            .update({ read: true })
            .eq("user_id", user.id)
            .eq("type", "new_booking")
            .eq("read", false)
            .contains("data", { campaign_id: input.campaignId }),
          db.from("campaign_messages").insert({
            campaign_id: input.campaignId,
            sender_id: user.id,
            message_type: "system",
            content: `Booking confirmed! ₹${(campaign.price_offered ?? 0).toLocaleString("en-IN")} is now secured in escrow. Time to create!`,
          }),
        ]);

        return { success: true };
      }

      if (!["requested", "pending"].includes(campaign.status)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot accept a campaign in '${campaign.status}' state`,
        });
      }

      const paymentExpiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000,
      ).toISOString();

      const { error: updateError } = await db
        .from("campaigns")
        .update({
          status: "payment_pending",
          accepted_at: new Date().toISOString(),
          expires_at: paymentExpiresAt,
        })
        .eq("id", input.campaignId);

      if (updateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: updateError.message,
        });
      }

      const notifData = {
        title: campaign.title ?? "Untitled",
        campaign_id: campaign.id,
      };

      await Promise.all([
        db.from("notifications").insert({
          user_id: campaign.business_id,
          type: "booking_accepted",
          data: notifData,
        }),
        db
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user.id)
          .eq("type", "new_booking")
          .eq("read", false)
          .contains("data", { campaign_id: input.campaignId }),
        db.from("campaign_messages").insert({
          campaign_id: input.campaignId,
          sender_id: user.id,
          message_type: "system",
          content: "Booking accepted — waiting for brand to complete payment.",
        }),
      ]);

      return { success: true };
    }),

  declineBooking: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { data: campaign, error: fetchError } = await db
        .from("campaigns")
        .select("*")
        .eq("id", input.campaignId)
        .maybeSingle();

      if (fetchError || !campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign.influencer_id !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the influencer can decline",
        });
      }

      const isPreAuth = campaign.status === "pre_authorized";
      const isRequested = ["requested", "pending"].includes(campaign.status);

      if (!isPreAuth && !isRequested) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot decline a campaign in '${campaign.status}' state`,
        });
      }

      let refundMessage =
        "Booking declined by the influencer. No payment was taken.";

      if (isPreAuth && campaign.razorpay_payment_id) {
        const isUpi = campaign.payment_method === "upi";

        if (isUpi) {
          // UPI was captured immediately — issue a refund
          const totalPaise = Math.round(
            (campaign.total_charged_amount ?? 0) * 100,
          );
          try {
            await razorpay.payments.refund(campaign.razorpay_payment_id, {
              amount: totalPaise,
              notes: {
                reason: "influencer_declined",
                campaign_id: campaign.id,
              },
            });
            refundMessage =
              "Booking declined by the influencer. A full refund has been initiated and will reflect in 5–7 business days.";
          } catch (err) {
            // Non-fatal: log and continue — finance team can process manually
            console.error("[declineBooking] UPI refund failed:", err);
            refundMessage =
              "Booking declined. Refund will be processed manually — please contact support.";
          }
        } else {
          // Card pre-auth: Razorpay auto-voids within 7 days; nothing to call.
          refundMessage =
            "Booking declined by the influencer. Your card pre-authorization has been released — no charge was made.";
        }
      }

      const { error: updateError } = await db
        .from("campaigns")
        .update({ status: "declined" })
        .eq("id", input.campaignId);

      if (updateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: updateError.message,
        });
      }

      const notifData = {
        title: campaign.title ?? "Untitled",
        campaign_id: campaign.id,
      };

      await Promise.all([
        db.from("notifications").insert({
          user_id: campaign.business_id,
          type: "booking_rejected",
          data: notifData,
        }),
        db
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user.id)
          .eq("type", "new_booking")
          .eq("read", false)
          .contains("data", { campaign_id: input.campaignId }),
        db.from("campaign_messages").insert({
          campaign_id: input.campaignId,
          sender_id: user.id,
          message_type: "system",
          content: refundMessage,
        }),
      ]);

      return { success: true };
    }),

  submitDelivery: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        storagePath: z.string().min(1, "Storage path is required"),
        notes: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { data: campaign, error: fetchError } = await db
        .from("campaigns")
        .select("*")
        .eq("id", input.campaignId)
        .maybeSingle();

      if (fetchError || !campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign.influencer_id !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the influencer can submit delivery",
        });
      }

      if (campaign.status !== "in_escrow") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Campaign must be in_escrow to submit delivery",
        });
      }

      const now = new Date().toISOString();

      const [{ error: deliveryError }, { error: updateError }] =
        await Promise.all([
          db.from("deliveries").insert({
            campaign_id: input.campaignId,
            submitted_by: user.id,
            content_url: input.storagePath,
            notes: input.notes ?? null,
            submitted_at: now,
          }),
          db
            .from("campaigns")
            .update({
              status: "delivery_submitted",
              delivery_submitted_at: now,
            })
            .eq("id", input.campaignId),
        ]);

      if (deliveryError || updateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            deliveryError?.message ??
            updateError?.message ??
            "Failed to submit delivery",
        });
      }

      const notifData = {
        title: campaign.title ?? "Untitled",
        campaign_id: campaign.id,
      };

      await Promise.all([
        db.from("notifications").insert({
          user_id: campaign.business_id,
          type: "delivery_submitted",
          data: notifData,
        }),
        db.from("campaign_messages").insert({
          campaign_id: input.campaignId,
          sender_id: user.id,
          message_type: "system",
          content: `Content delivered! Review and approve within 7 days — payment auto-releases after that.`,
        }),
      ]);

      // Fire-and-forget: send delivery notification email to brand
      void sendDeliveryNotificationEmail({
        db,
        campaign,
        influencerId: user.id,
        notes: input.notes,
      });

      return { success: true };
    }),

  approveDelivery: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { data: campaign, error: fetchError } = await db
        .from("campaigns")
        .select("*")
        .eq("id", input.campaignId)
        .maybeSingle();

      if (fetchError || !campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign.business_id !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the brand can approve delivery",
        });
      }

      if (campaign.status !== "delivery_submitted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Campaign is not awaiting delivery review",
        });
      }

      const now = new Date().toISOString();

      const [{ error: deliveryUpdateError }, { error: campaignUpdateError }] =
        await Promise.all([
          db
            .from("deliveries")
            .update({ approved_at: now, approved_by: user.id })
            .eq("campaign_id", input.campaignId)
            .is("approved_at", null),
          db
            .from("campaigns")
            .update({ status: "completed", completed_at: now })
            .eq("id", input.campaignId),
        ]);

      if (deliveryUpdateError || campaignUpdateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            deliveryUpdateError?.message ??
            campaignUpdateError?.message ??
            "Failed to approve delivery",
        });
      }

      // Record escrow transaction (Phase 1: manual payout; Phase 2: Razorpay Payouts)
      const priceInPaise = Math.round((campaign.price_offered ?? 0) * 100);
      const feeInPaise = Math.round((campaign.platform_fee_amount ?? 0) * 100);

      await Promise.all([
        db.from("escrow_transactions").insert([
          {
            campaign_id: input.campaignId,
            type: "payout_influencer",
            amount_paise: priceInPaise,
            razorpay_payment_id: campaign.razorpay_payment_id,
            status: "pending", // Phase 2: will be updated to 'success' after Razorpay Payout
          },
          {
            campaign_id: input.campaignId,
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
          campaign_id: input.campaignId,
          sender_id: user.id,
          message_type: "system",
          content: `Content approved! ₹${campaign.price_offered?.toLocaleString("en-IN")} is being released to the influencer.`,
        }),
      ]);

      return { success: true };
    }),

  disputeDelivery: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        reason: z.string().min(10, "Please describe the issue (min 10 chars)"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { data: campaign, error: fetchError } = await db
        .from("campaigns")
        .select("*")
        .eq("id", input.campaignId)
        .maybeSingle();

      if (fetchError || !campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign.business_id !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the brand can dispute delivery",
        });
      }

      if (campaign.status !== "delivery_submitted") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Can only dispute after delivery is submitted",
        });
      }

      const now = new Date().toISOString();

      const [{ error: deliveryError }, { error: campaignError }] =
        await Promise.all([
          db
            .from("deliveries")
            .update({ dispute_reason: input.reason, disputed_at: now })
            .eq("campaign_id", input.campaignId)
            .is("approved_at", null),
          db
            .from("campaigns")
            .update({ status: "disputed" })
            .eq("id", input.campaignId),
        ]);

      if (deliveryError || campaignError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            deliveryError?.message ??
            campaignError?.message ??
            "Failed to raise dispute",
        });
      }

      const notifData = {
        title: campaign.title ?? "Untitled",
        campaign_id: campaign.id,
      };

      await Promise.all([
        db.from("notifications").insert({
          user_id: campaign.influencer_id,
          type: "delivery_disputed",
          data: notifData,
        }),
        db.from("campaign_messages").insert({
          campaign_id: input.campaignId,
          sender_id: user.id,
          message_type: "system",
          content: `A dispute has been raised. Our team will review and resolve within 48 hours.`,
        }),
      ]);

      return { success: true };
    }),

  getDeliveryDownloadUrl: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { data: campaign } = await db
        .from("campaigns")
        .select("business_id, status")
        .eq("id", input.campaignId)
        .maybeSingle();

      if (!campaign || campaign.business_id !== user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      const eligible = ["delivery_submitted", "completed", "disputed"];
      if (!eligible.includes(campaign.status ?? "")) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No delivery available",
        });
      }

      const { data: delivery } = await db
        .from("deliveries")
        .select("content_url")
        .eq("campaign_id", input.campaignId)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!delivery?.content_url) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Delivery not found",
        });
      }

      const { data: signedData, error } = await db.storage
        .from("campaign-deliveries")
        .createSignedUrl(delivery.content_url, 3600);

      if (error || !signedData?.signedUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not generate download link",
        });
      }

      return { signedUrl: signedData.signedUrl, expiresInSeconds: 3600 };
    }),

  editCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        title: z.string().min(1),
        brief: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { data: campaign } = await db
        .from("campaigns")
        .select("business_id")
        .eq("id", input.campaignId)
        .maybeSingle();

      if (!campaign || campaign.business_id !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to edit this campaign",
        });
      }

      const { error } = await db
        .from("campaigns")
        .update({ title: input.title, brief: input.brief })
        .eq("id", input.campaignId);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return { success: true };
    }),

  // Soft-deprecated; prefer acceptBooking / declineBooking / approveDelivery.
  updateStatus: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        status: z.enum([
          "accepted",
          "rejected",
          "completed",
          "in_escrow",
          "declined",
        ]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { data: campaign, error: fetchError } = await db
        .from("campaigns")
        .select("*")
        .eq("id", input.campaignId)
        .maybeSingle();

      if (fetchError || !campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (
        campaign.influencer_id !== user.id &&
        campaign.business_id !== user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this campaign",
        });
      }

      const { error: updateError } = await db
        .from("campaigns")
        .update({ status: input.status })
        .eq("id", input.campaignId);

      if (updateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: updateError.message,
        });
      }

      const isInfluencer = campaign.influencer_id === user.id;
      const notifyUserId = isInfluencer
        ? campaign.business_id
        : campaign.influencer_id;

      const notifType =
        input.status === "accepted" || input.status === "in_escrow"
          ? "booking_accepted"
          : input.status === "rejected" || input.status === "declined"
            ? "booking_rejected"
            : "booking_completed";

      await Promise.all([
        db.from("notifications").insert({
          user_id: notifyUserId,
          type: notifType,
          data: {
            title: campaign.title ?? "Untitled",
            campaign_id: campaign.id,
          },
        }),
        ...(isInfluencer
          ? [
              db
                .from("notifications")
                .update({ read: true })
                .eq("user_id", user.id)
                .eq("type", "new_booking")
                .eq("read", false)
                .contains("data", { campaign_id: input.campaignId }),
            ]
          : []),
      ]);

      return { success: true };
    }),
});
