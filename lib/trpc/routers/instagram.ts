import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../init";

export const instagramRouter = router({
  getInstagramMedia: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from("instagram_media")
        .select("*")
        .eq("user_id", input.userId)
        .order("timestamp", { ascending: false });
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return data ?? [];
    }),

  getTopMedia: protectedProcedure
    .input(z.object({ userId: z.string(), limit: z.number().default(6) }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.db
        .from("instagram_media")
        .select("*")
        .eq("user_id", input.userId)
        .not("permalink", "is", null)
        .order("like_count", { ascending: false, nullsFirst: false })
        .limit(input.limit);
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return data ?? [];
    }),

  getPortfolioMedia: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        mediaIds: z.array(z.string()),
      }),
    )
    .query(async ({ ctx, input }) => {
      if (input.mediaIds.length === 0) return [];
      const { data, error } = await ctx.db
        .from("instagram_media")
        .select("*")
        .eq("user_id", input.userId)
        .in("ig_media_id", input.mediaIds);
      if (error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message,
        });
      return data ?? [];
    }),
});
