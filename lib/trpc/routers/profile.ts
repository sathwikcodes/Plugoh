import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";

export const profileRouter = router({
  upsertBusinessProfile: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        businessName: z.string().min(1),
        businessType: z.string().optional(),
        location: z.string().optional(),
        phone: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      const { error } = await db.from("profiles").upsert(
        {
          id: user.id,
          full_name: input.fullName,
          business_name: input.businessName,
          business_type: input.businessType || null,
          location: input.location || null,
          phone: input.phone || null,
        },
        { onConflict: "id" },
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return { success: true };
    }),

  updateInfluencerProfile: protectedProcedure
    .input(
      z.object({
        displayName: z.string().optional(),
        bio: z.string().optional(),
        category: z.string().optional(),
        city: z.string().optional(),
        languages: z.array(z.string()).optional(),
        pricePerReel: z.number().nullable().optional(),
        pricePerPost: z.number().nullable().optional(),
        pricePerStory: z.number().nullable().optional(),
        contentTypes: z.array(z.string()).nullable().optional(),
        turnaroundTime: z.string().nullable().optional(),
        portfolioMediaIds: z.array(z.string()).nullable().optional(),
        previousBrands: z.array(z.string()).nullable().optional(),
        isActive: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user } = ctx;

      // Build update object, only including provided fields
      const updateData: Record<string, unknown> = {};
      if (input.displayName !== undefined)
        updateData.display_name = input.displayName;
      if (input.bio !== undefined) updateData.bio = input.bio;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.city !== undefined) updateData.city = input.city;
      if (input.languages !== undefined) updateData.languages = input.languages;
      if (input.pricePerReel !== undefined)
        updateData.price_per_reel = input.pricePerReel;
      if (input.pricePerPost !== undefined)
        updateData.price_per_post = input.pricePerPost;
      if (input.pricePerStory !== undefined)
        updateData.price_per_story = input.pricePerStory;
      if (input.contentTypes !== undefined)
        updateData.content_types = input.contentTypes;
      if (input.turnaroundTime !== undefined)
        updateData.turnaround_time = input.turnaroundTime;
      if (input.portfolioMediaIds !== undefined)
        updateData.portfolio_media_ids = input.portfolioMediaIds;
      if (input.previousBrands !== undefined)
        updateData.previous_brands = input.previousBrands;
      if (input.isActive !== undefined) updateData.is_active = input.isActive;

      const { error } = await db
        .from("influencer_profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      }

      return { success: true };
    }),
});
