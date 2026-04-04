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

export const campaignRouter = router({
  // ─── Submit Booking Request (brand) ────────────────────────────────────────
  // Creates the campaign with status "requested" — no payment taken.
  submitBookingRequest: protectedProcedure
    .input(
      z.object({
        influencer_id: z.string(),
        influencer_profile_id: z.string(),
        package_type: z.enum(["reel", "post", "story"]),
        price_offered: z.number().positive(),
        objective: z.enum([
          "product_launch",
          "restaurant_visit",
          "brand_awareness",
          "ugc",
          "event_coverage",
        ]),
        timing_mode: z.enum(["asap", "this_week", "choose_date"]),
        due_date: z.string().optional(),
        focus_text: z.string(),
        event_name: z.string().optional(),
        notes: z.string().optional(),
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
        focusText: input.focus_text,
        eventName: input.event_name ?? "",
        notes: input.notes ?? "",
        contactEmail: input.contact_email,
        contactPhone: input.contact_phone,
      };

      // Fetch influencer profile for title generation
      const { data: profile } = await db
        .from("influencer_profiles")
        .select("*")
        .eq("id", input.influencer_profile_id)
        .maybeSingle();

      const title = buildCampaignTitle(
        formState,
        (profile as import("@/lib/booking").InfluencerProfile) ??
          ({} as import("@/lib/booking").InfluencerProfile),
      );
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

      // Notify influencer of new booking request
      await db.from("notifications").insert({
        user_id: input.influencer_id,
        type: "new_booking",
        data: { title: campaign.title ?? "Untitled", campaign_id: campaign.id },
      });

      // Insert booking card message so chat starts with deal details
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
          focus_text: input.focus_text,
        },
      });

      return { success: true, campaignId: campaign.id };
    }),

  // ─── Accept Booking (influencer) ───────────────────────────────────────────
  // Pre-auth flow: captures the pre-authorized payment and transitions pre_authorized → in_escrow.
  // Legacy flow: transitions requested → payment_pending (kept for backward compat).
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

      // ── New pre-auth flow ──────────────────────────────────────────────────
      if (campaign.status === "pre_authorized") {
        // Check 24h timer hasn't expired
        if (campaign.expires_at && new Date(campaign.expires_at) < new Date()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "This booking has expired. The brand will need to book again.",
          });
        }

        const now = new Date().toISOString();
        const isCard = campaign.payment_method === "card";

        // For card: capture the pre-authorized amount
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

        // Transition to in_escrow
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

        // For card: mark escrow_lock as success now that capture went through
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

      // ── Legacy flow (requested|pending → payment_pending) ─────────────────
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

  // ─── Decline Booking (influencer) ──────────────────────────────────────────
  // Pre-auth flow: voids pre-auth (card) or initiates refund (UPI) then marks declined.
  // Legacy flow: transitions requested → declined.
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

      // Pre-auth flow: handle payment reversal
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

  // ─── Submit Delivery (influencer) ──────────────────────────────────────────
  // Transitions in_escrow → delivery_submitted. Starts 7-day auto-release clock.
  submitDelivery: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        contentUrl: z.string().url("Must be a valid URL"),
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

      // Insert delivery record and update campaign status in parallel
      const [{ error: deliveryError }, { error: updateError }] =
        await Promise.all([
          db.from("deliveries").insert({
            campaign_id: input.campaignId,
            submitted_by: user.id,
            content_url: input.contentUrl,
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
        // Notify brand to review delivery
        db.from("notifications").insert({
          user_id: campaign.business_id,
          type: "delivery_submitted",
          data: notifData,
        }),
        // System message in chat
        db.from("campaign_messages").insert({
          campaign_id: input.campaignId,
          sender_id: user.id,
          message_type: "system",
          content: `Content delivered! Review and approve within 7 days — payment auto-releases after that.`,
        }),
      ]);

      return { success: true };
    }),

  // ─── Approve Delivery (brand) ───────────────────────────────────────────────
  // Transitions delivery_submitted → completed. Triggers payout via API route.
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

      // Update delivery approval and campaign status
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

  // ─── Dispute Delivery (brand) ───────────────────────────────────────────────
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

  // ─── Edit Campaign (brand) ─────────────────────────────────────────────────
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

  // ─── Legacy updateStatus (kept for backward compat, soft-deprecated) ───────
  // Use acceptBooking/declineBooking/approveDelivery instead.
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
