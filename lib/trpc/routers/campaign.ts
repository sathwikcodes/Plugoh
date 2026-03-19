import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";

export const campaignRouter = router({
  updateStatus: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        status: z.enum(["accepted", "rejected", "completed"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      // Fetch campaign to determine who to notify
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

      // Verify the caller is either the influencer or business on this campaign
      if (
        campaign.influencer_id !== user.id &&
        campaign.business_id !== user.id
      ) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update this campaign",
        });
      }

      // Update status
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

      // Determine notification target and type
      const isInfluencer = campaign.influencer_id === user.id;
      const notifyUserId = isInfluencer
        ? campaign.business_id
        : campaign.influencer_id;

      const notifType =
        input.status === "accepted"
          ? "booking_accepted"
          : input.status === "rejected"
            ? "booking_rejected"
            : "booking_completed";

      await db.from("notifications").insert({
        user_id: notifyUserId,
        type: notifType,
        data: {
          title: campaign.title || "Untitled",
          campaign_id: campaign.id,
        },
      });

      return { success: true };
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

      // Verify ownership
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
});
